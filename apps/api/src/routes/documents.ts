import { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { desc, count, eq } from 'drizzle-orm'
import { db } from '../db'
import { documents } from '../db/schema'
import { validateClerkJWT } from '../lib/auth'
import { inngest } from '../lib/inngest'
import { getLimits } from '../lib/plan-limits'

const CreateDocumentSchema = z.object({
  file_name: z.string().min(1).max(255),
  parsed_text: z.string().min(1)
})

export async function documentRoutes(app: FastifyInstance) {
  app.post('/documents', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    let payload: {
      fileName: string
      parsedText: string
      sourceType: 'upload' | 'inline'
    }
    try {
      payload = await readDocumentPayload(req)
    } catch (error) {
      return reply.code(400).send({ error: error instanceof Error ? error.message : 'Invalid document payload' })
    }

    const { fileName, parsedText: rawText, sourceType } = payload

    // ─── Document count limit ──────────────────────────────────────────────
    const limits = getLimits(org.plan)
    if (limits.documents !== -1) {
      const [{ total }] = await db
        .select({ total: count() })
        .from(documents)
        .where(eq(documents.org_id, org.id))
      if (Number(total) >= limits.documents) {
        return reply.code(402).send({
          error: 'Document limit reached',
          upgrade_url: 'https://cognity.com.au/#pricing',
        })
      }
    }
    // ──────────────────────────────────────────────────────────────────────

    // ─── Sanitize parsed_text ──────────────────────────────────────────────
    // 1. Trim to 500,000 characters to keep embeddings within Pinecone limits.
    // 2. Strip null bytes (\x00) and control chars < 0x20 except \n \r \t.
    const parsedText = rawText
      .slice(0, 500_000)
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00\x01-\x08\x0B\x0C\x0E-\x1F]/g, '')
    // ──────────────────────────────────────────────────────────────────────

    const fileUrl = `${sourceType}://${encodeURIComponent(fileName)}`

    const [doc] = await db.insert(documents).values({
      org_id: org.id,
      file_name: fileName,
      file_url: fileUrl,
      parsed_text: parsedText,
      embedding_status: 'pending'
    }).returning()

    await inngest.send({
      name: 'document/process',
      data: { document_id: doc.id, org_id: org.id }
    })

    return reply.code(201).send({
      document_id: doc.id,
      file_name: doc.file_name,
      embedding_status: 'pending'
    })
  })

  app.get('/documents', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const docs = await db.query.documents.findMany({
      where: (d, { eq }) => eq(d.org_id, org.id),
      orderBy: (d, { desc }) => [desc(d.created_at)]
    })

    return reply.send({ documents: docs })
  })

  // DELETE /v1/documents/:id
  app.delete('/documents/:id', async (req, reply) => {
    const org = await validateClerkJWT(req)
    if (!org) return reply.code(401).send({ error: 'Unauthorized' })

    const { id } = req.params as { id: string }

    // Verify ownership
    const doc = await db.query.documents.findFirst({
      where: (d, { and, eq }) => and(eq(d.id, id), eq(d.org_id, org.id))
    })
    if (!doc) return reply.code(404).send({ error: 'Document not found' })

    await db.delete(documents).where(eq(documents.id, id))
    // TODO: also delete vectors from Pinecone (optional for now)

    return reply.send({ ok: true })
  })
}

async function readDocumentPayload(req: FastifyRequest): Promise<{
  fileName: string
  parsedText: string
  sourceType: 'upload' | 'inline'
}> {
  const multipartRequest = req as FastifyRequest & {
    isMultipart?: () => boolean
    parts?: () => AsyncIterable<{ type: 'file' | 'field'; fieldname: string; filename?: string; mimetype?: string; value: string; toBuffer?: () => Promise<Buffer> }>
  }

  if (typeof multipartRequest.isMultipart === 'function' && multipartRequest.isMultipart()) {
    const fields: Record<string, string> = {}
    let uploadedFile: { filename: string; mimetype: string; buffer: Buffer } | null = null

    for await (const part of multipartRequest.parts?.() ?? []) {
      if (part.type === 'file') {
        const fileBuffer = part.toBuffer ? await part.toBuffer() : Buffer.alloc(0)
        uploadedFile = {
          filename: part.filename ?? 'document',
          mimetype: part.mimetype ?? 'application/octet-stream',
          buffer: fileBuffer
        }
      } else {
        fields[part.fieldname] = String(part.value)
      }
    }

    const fileName = fields.file_name?.trim() || uploadedFile?.filename || 'document'
    const parsedText = fields.parsed_text?.trim() || (uploadedFile ? extractDocumentText(uploadedFile.buffer, uploadedFile.mimetype, uploadedFile.filename) : '')

    if (!parsedText) {
      throw new Error('Document text is required')
    }

    return {
      fileName,
      parsedText,
      sourceType: uploadedFile ? 'upload' : 'inline'
    }
  }

  const body = CreateDocumentSchema.parse(req.body)
  return {
    fileName: body.file_name,
    parsedText: body.parsed_text.trim(),
    sourceType: 'inline'
  }
}

function extractDocumentText(buffer: Buffer, mimetype: string, fileName: string) {
  const lowerName = fileName.toLowerCase()
  if (
    mimetype.startsWith('text/') ||
    /\.(txt|md|csv|json|html?|ya?ml|log)$/i.test(lowerName)
  ) {
    return buffer.toString('utf8').trim()
  }

  if (mimetype === 'application/pdf' || lowerName.endsWith('.pdf')) {
    return extractPdfText(buffer)
  }

  return buffer.toString('utf8').trim()
}

function extractPdfText(buffer: Buffer) {
  const source = buffer.toString('latin1')
  const textFragments: string[] = []

  for (const match of source.matchAll(/\((?:\\.|[^\\)])*\)\s*T[Jj]/g)) {
    const literal = match[0].match(/\((?:\\.|[^\\)])*\)/)?.[0]
    if (!literal) continue
    textFragments.push(unescapePdfLiteral(literal.slice(1, -1)))
  }

  for (const match of source.matchAll(/<([0-9A-Fa-f\s]+)>\s*T[Jj]/g)) {
    const hex = match[1].replace(/\s+/g, '')
    if (!hex) continue
    try {
      textFragments.push(Buffer.from(hex, 'hex').toString('utf8'))
    } catch {}
  }

  return textFragments.join(' ').replace(/\s+/g, ' ').trim()
}

function unescapePdfLiteral(input: string) {
  let output = ''

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]

    if (character !== '\\') {
      output += character
      continue
    }

    const nextCharacter = input[index + 1]
    index += 1

    switch (nextCharacter) {
      case 'n':
        output += '\n'
        break
      case 'r':
        output += '\r'
        break
      case 't':
        output += '\t'
        break
      case 'b':
        output += '\b'
        break
      case 'f':
        output += '\f'
        break
      case '(':
      case ')':
      case '\\':
        output += nextCharacter
        break
      case '\n':
        break
      case '\r':
        if (input[index + 1] === '\n') index += 1
        break
      default:
        output += nextCharacter ?? ''
        break
    }
  }

  return output
}

import { inngest } from '../lib/inngest'
import { db } from '../db'
import { documents } from '../db/schema'
import { embedText } from '../lib/gemini'
import { index } from '../lib/pinecone'
import { and, eq } from 'drizzle-orm'

// Inngest background job — triggered when document is uploaded
export const processDocument = inngest.createFunction(
  { id: 'process-document' },
  { event: 'document/process' },
  async ({ event }) => {
    const { document_id, org_id } = event.data

    const document = await db.query.documents.findFirst({
      where: (doc, { eq }) => and(eq(doc.id, document_id), eq(doc.org_id, org_id))
    })

    if (!document) {
      return { success: false, error: 'Document not found' }
    }

    await db.update(documents)
      .set({ embedding_status: 'processing' })
      .where(eq(documents.id, document_id))

    const extractedText = document.parsed_text?.trim() || 'Placeholder extracted text from document'

    const chunks = chunkText(extractedText, 512, 50)

    const vectors = await Promise.all(
      chunks.map(async (chunk, i) => ({
        id: `${document_id}-chunk-${i}`,
        values: await embedText(chunk),
        metadata: { org_id: document.org_id, document_id, text: chunk, chunk_index: i }
      }))
    )

    await index.upsert(vectors)

    await db.update(documents)
      .set({ embedding_status: 'done', parsed_text: extractedText, chunk_count: chunks.length })
      .where(eq(documents.id, document_id))

    return { success: true, chunks: chunks.length }
  }
)

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const words = text.split(' ')
  const chunks: string[] = []
  let i = 0
  while (i < words.length) {
    chunks.push(words.slice(i, i + chunkSize).join(' '))
    i += chunkSize - overlap
  }
  return chunks
}

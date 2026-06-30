import { Pinecone } from '@pinecone-database/pinecone'

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
export const index = pc.index(process.env.PINECONE_INDEX_NAME ?? 'cognity-docs')

export async function querySimilar(vector: number[], orgId: string, topK = 3) {
  const results = await index.query({
    vector,
    topK,
    filter: { org_id: orgId },
    includeMetadata: true
  })
  return results.matches.map(m => m.metadata?.text as string).filter(Boolean)
}

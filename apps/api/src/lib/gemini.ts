import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const geminiChat = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
export const geminiEmbedding = genAI.getGenerativeModel({ model: 'text-embedding-004' })

export async function embedText(text: string): Promise<number[]> {
  const result = await geminiEmbedding.embedContent(text)
  return result.embedding.values
}

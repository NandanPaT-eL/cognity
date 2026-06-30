import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

function modelCandidates(envValue: string | undefined, preferred: string[], deprecated: string[]) {
  return [
    ...preferred,
    ...(envValue && !deprecated.includes(envValue) ? [envValue] : [])
  ]
}

const chatModelCandidates = modelCandidates(
  process.env.GEMINI_MODEL,
  ['gemini-2.5-flash-lite', 'gemini-2.5-flash'],
  ['gemini-2.0-flash']
)

const embeddingModelCandidates = modelCandidates(
  process.env.GEMINI_EMBEDDING_MODEL,
  ['gemini-embedding-001', 'gemini-embedding-2'],
  ['text-embedding-004']
)

export async function embedText(text: string): Promise<number[]> {
  let lastError: unknown

  for (const model of embeddingModelCandidates) {
    try {
      const result = await genAI.getGenerativeModel({ model }).embedContent(text)
      return result.embedding.values
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Unable to create an embedding with any configured Gemini model')
}

export async function generateChatContentStream(systemPrompt: string, userMessage: string) {
  let lastError: unknown

  for (const model of chatModelCandidates) {
    try {
      return await genAI.getGenerativeModel({ model }).generateContentStream([
        { text: systemPrompt },
        { text: `User: ${userMessage}\nCognity:` }
      ])
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Unable to generate a Gemini response with any configured model')
}

export async function generateChatContent(prompt: string) {
  let lastError: unknown

  for (const model of chatModelCandidates) {
    try {
      return await genAI.getGenerativeModel({ model }).generateContent(prompt)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Unable to generate a Gemini response with any configured model')
}

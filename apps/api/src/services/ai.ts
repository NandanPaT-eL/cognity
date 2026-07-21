import { db } from '../db'
import { messages } from '../db/schema'
import { embedText, generateChatContentStream } from '../lib/gemini'
import { querySimilar } from '../lib/pinecone'
import { v4 as uuidv4 } from 'uuid'

interface GenerateOptions {
  session: { id: string; goal_text: string | null; org_id: string }
  userMessage: string
  orgId: string
}

export async function generateAIResponse({ session, userMessage, orgId }: GenerateOptions) {
  // Run all data fetches in parallel — embedding+pinecone AND db queries simultaneously
  const [queryVector, history, activationGoal] = await Promise.all([
    embedText(userMessage),
    db.query.messages.findMany({
      where: (m, { eq }) => eq(m.session_id, session.id),
      orderBy: (m, { desc }) => [desc(m.created_at)],
      limit: 8,
    }),
    db.query.activationGoals.findFirst({
      where: (g, { eq }) => eq(g.org_id, orgId)
    })
  ])

  // Pinecone query runs after embedding is ready (already parallel with DB above)
  // Reduce topK from 5 to 3 — enough context, less processing
  const contextChunks = await querySimilar(queryVector, orgId, 3)
  const context = contextChunks.join('\n\n')

  const historyText = history
    .reverse()
    .map(m => `${m.role === 'user' ? 'User' : 'Cognity'}: ${m.content}`)
    .join('\n')

  const activationGoalLine = activationGoal
    ? `\nActivation goal: ${activationGoal.event_name} — ${activationGoal.description}`
    : ''

  // Tighter system prompt = fewer input tokens = faster TTFT
  const systemPrompt = `You are Cognity, an onboarding assistant embedded in a product.
Goal: ${session.goal_text ?? 'Not stated'}${activationGoalLine}
Docs:\n${context}
History:\n${historyText}
Rules: max 2 sentences. Give the single next action. Ask one question if unclear. Never say you're an AI.
If you cannot help with something, acknowledge what they wanted to do, apologize briefly, and suggest they try rephrasing or contact support.`

  const result = await generateChatContentStream(systemPrompt, userMessage)

  const messageId = uuidv4()
  let fullResponse = ''

  async function* streamChunks() {
    for await (const chunk of result.stream) {
      const text = chunk.text()
      fullResponse += text
      yield text
    }
    await db.insert(messages).values({
      session_id: session.id,
      role: 'assistant',
      content: fullResponse
    })
  }

  return { stream: streamChunks(), messageId }
}

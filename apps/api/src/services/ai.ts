import { db } from '../db'
import { messages } from '../db/schema'
import { geminiChat, embedText } from '../lib/gemini'
import { querySimilar } from '../lib/pinecone'
import { v4 as uuidv4 } from 'uuid'

interface GenerateOptions {
  session: { id: string; goal_text: string | null; org_id: string }
  userMessage: string
  orgId: string
}

export async function generateAIResponse({ session, userMessage, orgId }: GenerateOptions) {
  // 1. Embed user message
  const queryVector = await embedText(userMessage)

  // 2. Retrieve relevant doc chunks from Pinecone
  const contextChunks = await querySimilar(queryVector, orgId, 5)
  const context = contextChunks.join('\n\n')

  // 3. Fetch last 10 messages for conversation history
  const history = await db.query.messages.findMany({
    where: (m, { eq }) => eq(m.session_id, session.id),
    orderBy: (m, { desc }) => [desc(m.created_at)],
    limit: 10
  })

  const historyText = history
    .reverse()
    .map(m => `${m.role === 'user' ? 'User' : 'Cognity'}: ${m.content}`)
    .join('\n')

  // 3.5. Fetch activation goal for this org
  const activationGoal = await db.query.activationGoals.findFirst({
    where: (g, { eq }) => eq(g.org_id, orgId)
  })

  // 4. Build prompt
  const activationGoalLine = activationGoal
    ? `\nActivation goal for this product: ${activationGoal.event_name} — ${activationGoal.description}`
    : ''

  const systemPrompt = `You are Cognity, an onboarding assistant.
The user's goal: ${session.goal_text ?? 'Not yet stated'}${activationGoalLine}

Product documentation context:
${context}

Conversation so far:
${historyText}

Rules:
- Be concise. Maximum 3 sentences per response.
- Always give the next single action the user should take.
- If confused, ask one clarifying question.
- Never mention you are an AI or using documentation.`

  // 5. Stream from Gemini
  const result = await geminiChat.generateContentStream([
    { text: systemPrompt },
    { text: `User: ${userMessage}\nCognity:` }
  ])

  const messageId = uuidv4()
  let fullResponse = ''

  async function* streamChunks() {
    for await (const chunk of result.stream) {
      const text = chunk.text()
      fullResponse += text
      yield text
    }
    // Store assistant message after streaming completes
    await db.insert(messages).values({
      session_id: session.id,
      role: 'assistant',
      content: fullResponse
    })
  }

  return { stream: streamChunks(), messageId }
}

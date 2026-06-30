import { generateChatContent } from '../lib/gemini'

interface StuckOptions {
  sessionId: string
  pagePath?: string
  idleSeconds: number
  goalText?: string
}

const IDLE_THRESHOLD = 45

export async function detectStuck({ sessionId, pagePath, idleSeconds, goalText }: StuckOptions): Promise<string | null> {
  if (idleSeconds < IDLE_THRESHOLD) return null

  const pageLabel = pagePath
    ? pagePath.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') ?? 'this step'
    : 'this step'

  const staticFallback = `Looks like you might be stuck on ${pageLabel}. Would you like help with this?`

  if (!goalText) return staticFallback

  try {
    const prompt = `The user is trying to: ${goalText}
They have been idle on the "${pageLabel}" page for 45 seconds.
Write one short, friendly sentence (max 20 words) offering help. Do not mention AI or documentation.`

    const result = await generateChatContent(prompt)
    const text = result.response.text().trim()
    return text || staticFallback
  } catch {
    return staticFallback
  }
}

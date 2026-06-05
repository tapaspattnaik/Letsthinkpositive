import { prisma } from '@/lib/db'

// Fetch user memories and format them as a context block for AI system prompts
export async function getUserMemoryContext(userId: number): Promise<string> {
  try {
    const memories = await prisma.userMemory.findMany({
      where:   { userId },
      orderBy: { updatedAt: 'desc' },
      take:    10,
    })

    if (!memories.length) return ''

    const lines = memories.map(m => {
      const label = m.key.replace(/_/g, ' ')
      return `- ${label}: ${m.value}`
    })

    return `\n\n[Personalisation context — things this user has previously shared]:\n${lines.join('\n')}\nUse this context naturally to personalise your responses. Don't explicitly mention that you "remember" unless it feels natural.`
  } catch {
    return ''
  }
}

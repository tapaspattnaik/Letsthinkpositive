import { GoogleGenerativeAI } from '@google/generative-ai'

interface ModerationResult {
  safe:    boolean
  issues:  string[]
  message: string
}

// ── Quick regex pre-filter ────────────────────────────────────────────────
const BAD_PATTERNS = [
  /\bf+u+c+k+\b/gi, /\bs+h+i+t+\b/gi, /\bb+i+t+c+h+\b/gi,
  /\ba+s+s+h+o+l+e+\b/gi, /\bc+u+n+t+\b/gi, /\bn+i+g+g+\b/gi,
  /\bkill\s+(yourself|urself|yoself)\b/gi, /\bkys\b/gi,
  /\bdie\s+(you|u|yourself)\b/gi,
  /hate\s+(all|every)\s+(race|religion|gender|group)/gi,
  /buy\s+now|click\s+here|free\s+money|get\s+rich\s+quick/gi,
]

function quickCheck(text: string): string[] {
  const issues: string[] = []
  const plain = text.replace(/<[^>]+>/g, ' ')
  if (BAD_PATTERNS.some(p => p.test(plain))) issues.push('profanity or hate language detected')
  return issues
}

// ── AI deep check using Gemini ────────────────────────────────────────────
export async function moderateContent(
  title: string,
  body: string,
): Promise<ModerationResult> {
  // Step 1: quick regex check
  const fullText = `${title} ${body.replace(/<[^>]+>/g, ' ')}`
  const quickIssues = quickCheck(fullText)
  if (quickIssues.length > 0) {
    return {
      safe:    false,
      issues:  quickIssues,
      message: 'Your post contains language that isn\'t appropriate for our wellness community. Please review and remove any offensive words.',
    }
  }

  // Step 2: AI check via Gemini (fast, low token usage)
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return { safe: true, issues: [], message: '' } // skip if no key

  const excerpt = fullText.slice(0, 1500)

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { maxOutputTokens: 120, temperature: 0 },
    })

    const prompt = `You are a content moderator for a wellness platform called "letsthinkpositive.com".
Review the post below and respond ONLY with valid JSON in this exact format:
{"safe":true,"issues":[],"message":""}

Flag content that contains:
- Profanity or explicit language
- Hate speech (targeting race, religion, gender, nationality, disability)
- Harmful intentions, self-harm, or encouraging harm to others
- Spam, promotional content, or scam material
- Highly negative content that contradicts the platform's positive ethos

If safe: {"safe":true,"issues":[],"message":""}
If not safe: {"safe":false,"issues":["short issue description"],"message":"friendly explanation to user"}

DO NOT include any text outside the JSON.

Title: ${title}

Content: ${excerpt}`

    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()

    // Extract JSON from response (Gemini sometimes wraps in markdown)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { safe: true, issues: [], message: '' }

    const parsed = JSON.parse(jsonMatch[0]) as ModerationResult
    return {
      safe:    !!parsed.safe,
      issues:  Array.isArray(parsed.issues) ? parsed.issues : [],
      message: parsed.message ?? '',
    }
  } catch {
    // If moderation fails, let it through (don't block submission on AI error)
    return { safe: true, issues: [], message: '' }
  }
}

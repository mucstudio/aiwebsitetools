import { createToolHandler, callAI } from '@/lib/create-tool-handler'

interface CorporateClapbackInput {
  text: string
  mode: 'rage' | 'decode'
  aggressionLevel?: number
}

const corporateClapbackProcessor = async (input: CorporateClapbackInput) => {
  const { text, mode, aggressionLevel = 2 } = input

  let systemPrompt = ""

  if (mode === 'rage') {
    // 愤怒转化模式
    systemPrompt = `You are 'Corporate Clapback 98', an expert in corporate speak and passive-aggressive email writing.

Task: Rewrite the user's angry/casual input into professional corporate jargon.

Aggression Level Setting (${aggressionLevel}/3):
1 = Polite & Professional (Standard HR safe).
2 = Passive Aggressive (Use words like 'per my last email', 'kindly', 'ensure').
3 = Gaslight / Extreme (Technically professional but heavily condescending and cold. Use complex buzzwords to confuse them).

Rules:
- Maintain a "professional" tone at all times.
- Use buzzwords like: synergy, circle back, bandwidth, deliverables, deep dive, offline.
- Do not add explanations. Just output the email body.`
  } else {
    // 解码模式
    systemPrompt = `You are 'Corporate Clapback 98', a translator who decodes corporate bullshit into plain truth.

Task: Translate the user's corporate email/message into what they REALLY mean (brutally honest).

Tone: Cynical, funny, direct.
Start the response with "TRANSLATION:"`
  }

  const aiResult = await callAI(
    `${systemPrompt}\n\nUser input: ${text}`,
    'corporate-clapback'
  )

  return {
    content: aiResult.content,
    metadata: {
      aiTokens: aiResult.tokens,
      aiCost: aiResult.cost,
      mode,
      aggressionLevel
    }
  }
}

export const POST = createToolHandler({
  toolId: 'corporate-clapback',
  processor: corporateClapbackProcessor,
  validateInput: (input: CorporateClapbackInput) => {
    if (!input.text || typeof input.text !== 'string' || input.text.trim().length < 5) {
      return { valid: false, error: 'Input is too short. Please utilize the keyboard.' }
    }
    if (!input.mode || !['rage', 'decode'].includes(input.mode)) {
      return { valid: false, error: 'Invalid mode selected.' }
    }
    return { valid: true }
  }
})

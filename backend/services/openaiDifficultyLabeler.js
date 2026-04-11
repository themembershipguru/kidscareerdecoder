import OpenAI from 'openai'

const CHUNK_SIZE = 15

const systemPrompt = `You label quiz questions for KidsCareerDecoder, an educational aptitude-style quiz for children roughly ages 3–14. There are no "wrong" answers—each question has scenario choices.

Task: assign each question an integer difficulty_level from 1 to 5 for adaptive ordering:
- 1 = very simple, concrete, one clear situation, minimal reading or inference
- 2 = simple with a small twist or two ideas
- 3 = moderate: needs a bit of reflection or compares options
- 4 = challenging: nuanced social/emotional, planning, or abstract tradeoffs
- 5 = most demanding: multi-step reasoning, subtle empathy, or complex hypotheticals

Use the question text and the answer option labels only (they indicate tone/complexity). Spread values across the set when appropriate—do not label everything 3.

Respond with JSON only:
{"labels":[{"question_id":"<exact id from input>","difficulty_level":3}]}

Include every question_id from the input exactly once. difficulty_level must be an integer 1–5.`

function clampDifficulty(n) {
  const x = Math.round(Number(n))
  if (!Number.isFinite(x)) return 3
  return Math.min(5, Math.max(1, x))
}

async function labelChunk(client, { quizTitle, quizDescription, questions }) {
  const lines = questions.map((q, i) => {
    const opts = (q.options || []).map((o) => o.label).join(' | ')
    return `${i + 1}. id=${q.id}\n   Q: ${q.body}\n   Options: ${opts || '(none)'}`
  })
  const userContent = `Quiz title: ${quizTitle || 'Untitled'}
Quiz description: ${quizDescription || 'none'}

Questions:
${lines.join('\n\n')}`

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    max_tokens: 2000,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
  })
  const raw = response.choices[0]?.message?.content ?? '{}'
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('OpenAI returned invalid JSON')
  }
  const arr = parsed.labels
  if (!Array.isArray(arr)) {
    throw new Error('OpenAI response missing labels array')
  }
  const out = new Map()
  for (const row of arr) {
    const qid = row?.question_id
    if (typeof qid !== 'string' || !qid.trim()) continue
    out.set(qid.trim(), clampDifficulty(row.difficulty_level))
  }
  return out
}

/**
 * @param {{ quizTitle?: string, quizDescription?: string, questions: Array<{ id: string, body: string, options?: Array<{ label: string }> }> }} params
 * @returns {Promise<Map<string, number>>} question_id -> difficulty 1–5
 */
export async function labelQuestionDifficultiesOpenAI(params) {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set')
  }
  const client = new OpenAI({ apiKey })
  const { quizTitle, quizDescription, questions } = params
  if (!questions?.length) {
    return new Map()
  }

  const merged = new Map()
  for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
    const chunk = questions.slice(i, i + CHUNK_SIZE)
    const part = await labelChunk(client, {
      quizTitle,
      quizDescription,
      questions: chunk,
    })
    for (const [k, v] of part) {
      merged.set(k, v)
    }
  }

  for (const q of questions) {
    if (!merged.has(q.id)) {
      merged.set(q.id, 3)
    }
  }
  return merged
}

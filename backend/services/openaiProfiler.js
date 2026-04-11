import OpenAI from 'openai'

const systemPrompt = `You are a child career aptitude analyst for KidsCareerDecoder, an educational platform for kids aged 3-14. Given aptitude scores across 6 dimensions and the child's age, determine their dominant aptitude profile and suggest age-appropriate careers.

Rules:
- Profile format: top two aptitudes hyphenated alphabetically, e.g. "Creative-Social" or "Logical-Scientific"
- Suggest exactly 3 careers appropriate for the child's age group
- Explanation must be encouraging, positive, and written for a parent to read

JSON structure:
{"profile": "Creative-Social", "careers": ["Animator", "Game Designer", "UX Researcher"], "top_strength": "Creative", "explanation": "Your child shows a wonderful blend of creativity and people skills!"}`

export async function getProfile(scores, age) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const userContent = `Child age: ${age}. Aptitude scores (percentage): logical=${scores.logical_pct}%, creative=${scores.creative_pct}%, verbal=${scores.verbal_pct}%, social=${scores.social_pct}%, scientific=${scores.scientific_pct}%, practical=${scores.practical_pct}%`
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    max_tokens: 500,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
  })
  const raw = response.choices[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(raw)
  return {
    profile: parsed.profile,
    careers: parsed.careers,
    top_strength: parsed.top_strength,
    explanation: parsed.explanation,
  }
}

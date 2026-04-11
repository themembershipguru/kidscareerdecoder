import Anthropic from '@anthropic-ai/sdk'

const systemPrompt = `You are a child career aptitude analyst for KidsCareerDecoder, an educational platform for kids aged 3-14. Given aptitude scores across 6 dimensions and the child's age, determine their dominant aptitude profile and suggest age-appropriate careers.

Rules:
- Profile format: top two aptitudes hyphenated alphabetically, e.g. "Creative-Social" or "Logical-Scientific"  
- Suggest exactly 3 careers appropriate for the child's age group
- Explanation must be encouraging, positive, and written for a parent to read
- Respond ONLY with valid JSON, no markdown, no backticks

JSON structure:
{"profile": "Creative-Social", "careers": ["Animator", "Game Designer", "UX Researcher"], "top_strength": "Creative", "explanation": "Your child shows a wonderful blend of creativity and people skills!"}`

export async function getProfile(scores, age) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const userContent = `Child age: ${age}. Aptitude scores (percentage): logical=${scores.logical_pct}%, creative=${scores.creative_pct}%, verbal=${scores.verbal_pct}%, social=${scores.social_pct}%, scientific=${scores.scientific_pct}%, practical=${scores.practical_pct}%`
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent }],
  })
  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  const parsed = JSON.parse(cleaned)
  return {
    profile: parsed.profile,
    careers: parsed.careers,
    top_strength: parsed.top_strength,
    explanation: parsed.explanation,
  }
}

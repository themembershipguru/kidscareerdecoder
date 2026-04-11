import axios from 'axios'
import { getProfile as getClaudeProfile } from './claudeProfiler.js'
import { getProfile as getOpenaiProfile } from './openaiProfiler.js'

const aptitudeOrder = [
  'logical',
  'creative',
  'verbal',
  'social',
  'scientific',
  'practical',
]

function capitalizeWord(s) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function buildFallbackFromScores(scoresPct) {
  const entries = aptitudeOrder.map((key) => ({
    key,
    v: Number(scoresPct[`${key}_pct`] ?? scoresPct[key] ?? 0),
  }))
  entries.sort((a, b) => b.v - a.v || a.key.localeCompare(b.key))
  const topStrengthKey = entries[0].key
  const secondKey = entries[1].key
  const profileParts = [capitalizeWord(topStrengthKey), capitalizeWord(secondKey)].sort(
    (a, b) => a.localeCompare(b),
  )
  return {
    profile: profileParts.join('-'),
    careers: [],
    top_strength: capitalizeWord(topStrengthKey),
    explanation: 'Profile determined from quiz scores',
    ai_provider: 'fallback',
  }
}

export async function getAptitudeProfile(scores, age) {
  const AI_PROVIDER = process.env.AI_PROVIDER || 'claude'
  const payload = {
    logical_pct: scores.logical_pct,
    creative_pct: scores.creative_pct,
    verbal_pct: scores.verbal_pct,
    social_pct: scores.social_pct,
    scientific_pct: scores.scientific_pct,
    practical_pct: scores.practical_pct,
    age,
  }
  try {
    let result
    if (AI_PROVIDER === 'claude') {
      result = await getClaudeProfile(payload, age)
    } else if (AI_PROVIDER === 'openai') {
      result = await getOpenaiProfile(payload, age)
    } else if (AI_PROVIDER === 'random_forest') {
      const base = (process.env.ML_SERVICE_URL || 'http://localhost:5001').replace(/\/$/, '')
      const { data } = await axios.post(`${base}/predict`, payload, { timeout: 30000 })
      result = {
        profile: data.profile,
        careers: data.careers,
        top_strength: data.top_strength,
        explanation: data.explanation,
      }
    } else {
      throw new Error('unknown AI_PROVIDER')
    }
    return { ...result, ai_provider: AI_PROVIDER }
  } catch {
    return buildFallbackFromScores(scores)
  }
}

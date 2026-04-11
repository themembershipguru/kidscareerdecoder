import { getPool } from '../db/pool.js'

const TTL_MS = 30_000
let cachedValue = null
let cachedAt = 0

const ALLOWED = ['claude', 'openai', 'random_forest', 'fallback_only']

function normalizeEnvProvider() {
  const env = (process.env.AI_PROVIDER || 'claude').trim()
  return ALLOWED.includes(env) ? env : 'claude'
}

/**
 * Effective AI provider: DB app_settings.ai_provider if set and allowed, else AI_PROVIDER env, else claude.
 */
export async function getEffectiveAiProvider() {
  if (Date.now() - cachedAt < TTL_MS && cachedValue !== null) {
    return cachedValue
  }
  try {
    const pool = getPool()
    const { rows } = await pool.query(
      `SELECT value FROM public.app_settings WHERE key = 'ai_provider' LIMIT 1`,
    )
    const v = rows[0]?.value?.trim()
    if (v && ALLOWED.includes(v)) {
      cachedValue = v
      cachedAt = Date.now()
      return v
    }
  } catch {
    /* table missing or DB down */
  }
  cachedValue = normalizeEnvProvider()
  cachedAt = Date.now()
  return cachedValue
}

export function invalidateAiProviderCache() {
  cachedValue = null
  cachedAt = 0
}

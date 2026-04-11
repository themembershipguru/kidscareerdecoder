import { getPool } from '../db/pool.js'
import { getEffectiveAiProvider, invalidateAiProviderCache } from '../services/aiProviderSettings.js'

const ALLOWED_PROVIDERS = ['claude', 'openai', 'random_forest', 'fallback_only']

export async function getAiStatus(_req, res) {
  try {
    const pool = getPool()
    let dbOverride = null
    try {
      const { rows } = await pool.query(
        `SELECT value, updated_at FROM public.app_settings WHERE key = 'ai_provider' LIMIT 1`,
      )
      if (rows[0]) {
        dbOverride = { value: rows[0].value, updated_at: rows[0].updated_at }
      }
    } catch {
      /* missing table */
    }
    const effective = await getEffectiveAiProvider()
    res.json({
      effectiveProvider: effective,
      envDefault: (process.env.AI_PROVIDER || 'claude').trim(),
      dbOverride,
      anthropicKeyPresent: Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
      openaiKeyPresent: Boolean(process.env.OPENAI_API_KEY?.trim()),
    })
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
}

export async function patchAiProvider(req, res) {
  try {
    const provider = String(req.body?.provider ?? '').trim()
    if (!ALLOWED_PROVIDERS.includes(provider)) {
      res.status(400).json({
        error: `provider must be one of: ${ALLOWED_PROVIDERS.join(', ')}`,
      })
      return
    }
    if (provider === 'fallback_only') {
      /* no keys required */
    } else if (provider === 'openai' && !process.env.OPENAI_API_KEY?.trim()) {
      res.status(400).json({
        error: 'OPENAI_API_KEY is not set in server environment',
      })
      return
    } else if (provider === 'claude' && !process.env.ANTHROPIC_API_KEY?.trim()) {
      res.status(400).json({
        error: 'ANTHROPIC_API_KEY is not set in server environment',
      })
      return
    }
    const pool = getPool()
    await pool.query(
      `INSERT INTO public.app_settings (key, value, updated_at)
       VALUES ('ai_provider', $1, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [provider],
    )
    invalidateAiProviderCache()
    const effective = await getEffectiveAiProvider()
    res.json({ ok: true, effectiveProvider: effective })
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
}

export async function clearAiProviderOverride(_req, res) {
  try {
    const pool = getPool()
    await pool.query(`DELETE FROM public.app_settings WHERE key = 'ai_provider'`)
    invalidateAiProviderCache()
    const effective = await getEffectiveAiProvider()
    res.json({ ok: true, effectiveProvider: effective })
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
}

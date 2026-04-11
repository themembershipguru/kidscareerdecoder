import { getPool } from '../db/pool.js'

export async function getAttributionBreakdown(_req, res) {
  try {
    const pool = getPool()
    const { rows } = await pool.query(
      `SELECT
         COALESCE(NULLIF(TRIM(attribution_json->>'utm_source'), ''), '(none)') AS utm_source,
         COALESCE(NULLIF(TRIM(attribution_json->>'utm_medium'), ''), '(none)') AS utm_medium,
         COUNT(*)::int AS signups
       FROM public.users
       WHERE attribution_json IS NOT NULL
         AND attribution_json != '{}'::jsonb
       GROUP BY 1, 2
       ORDER BY signups DESC
       LIMIT 80`,
    )
    res.json({ breakdown: rows })
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
}

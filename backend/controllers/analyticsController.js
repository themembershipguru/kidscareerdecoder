import { getPool } from '../db/pool.js'

async function assertParentOwnsChild(parentId, childId) {
  const pool = getPool()
  const { rows } = await pool.query(
    `SELECT id FROM public.users
     WHERE id = $1 AND parent_user_id = $2 AND role = 'child' LIMIT 1`,
    [childId, parentId],
  )
  if (!rows.length) return { ok: false, error: 'Forbidden' }
  return { ok: true }
}

function ageFromDob(dobStr, birthYear) {
  const normalized =
    dobStr instanceof Date ? dobStr.toISOString().slice(0, 10) : dobStr != null ? String(dobStr).slice(0, 10) : null
  if (normalized) {
    const d = new Date(`${normalized}T12:00:00Z`)
    if (!Number.isNaN(d.getTime())) {
      const t = new Date()
      let a = t.getFullYear() - d.getUTCFullYear()
      const m = t.getMonth() - d.getUTCMonth()
      if (m < 0 || (m === 0 && t.getDate() < d.getUTCDate())) a -= 1
      return a
    }
  }
  if (birthYear != null) return new Date().getFullYear() - Number(birthYear)
  return null
}

function metaProfile(row) {
  const m = row?.metadata_json
  if (m && typeof m === 'object' && m.profile != null) return m.profile
  return row?.top_aptitude ?? null
}

export async function listChildrenSummary(req, res) {
  try {
    const pool = getPool()
    const { rows: children } = await pool.query(
      `SELECT id, full_name, date_of_birth, birth_year
       FROM public.users
       WHERE parent_user_id = $1 AND role = 'child'
       ORDER BY created_at ASC`,
      [req.user.id],
    )
    const rows = []
    for (const c of children) {
      const cntRes = await pool.query(
        `SELECT COUNT(*)::int AS n FROM public.quiz_sessions
         WHERE user_id = $1 AND status = 'completed'`,
        [c.id],
      )
      const totalSessions = cntRes.rows[0]?.n ?? 0
      const latestRes = await pool.query(
        `SELECT completed_at, metadata_json, top_aptitude
         FROM public.quiz_sessions
         WHERE user_id = $1 AND status = 'completed' AND completed_at IS NOT NULL
         ORDER BY completed_at DESC
         LIMIT 1`,
        [c.id],
      )
      const latest = latestRes.rows[0]
      rows.push({
        child_id: c.id,
        full_name: c.full_name,
        total_sessions: totalSessions,
        latest_profile: latest ? metaProfile(latest) : null,
        last_active: latest?.completed_at ?? null,
      })
    }
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

export async function getChildAnalytics(req, res) {
  try {
    const childId = String(req.params.childId || '')
    const ok = await assertParentOwnsChild(req.user.id, childId)
    if (!ok.ok) {
      res.status(403).json({ error: ok.error })
      return
    }
    const pool = getPool()
    const chRes = await pool.query(
      `SELECT full_name, date_of_birth, birth_year FROM public.users WHERE id = $1 LIMIT 1`,
      [childId],
    )
    const child = chRes.rows[0]
    if (!child) {
      res.status(404).json({ error: 'Child not found' })
      return
    }
    const sRes = await pool.query(
      `SELECT started_at, completed_at, scores_json, top_aptitude, metadata_json
       FROM public.quiz_sessions
       WHERE user_id = $1 AND status = 'completed'
       ORDER BY completed_at ASC NULLS LAST`,
      [childId],
    )
    const list = sRes.rows
    const last = list.length ? list[list.length - 1] : null
    const topForCareers = last?.top_aptitude
    let careers = []
    if (topForCareers) {
      const crRes = await pool.query(
        `SELECT id, title, aptitude_type FROM public.careers
         WHERE aptitude_type = $1 ORDER BY sort_order ASC`,
        [topForCareers],
      )
      careers = crRes.rows
    }
    const currentProfile = last ? metaProfile(last) : null
    res.json({
      child: {
        full_name: child.full_name,
        date_of_birth: child.date_of_birth,
        birth_year: child.birth_year,
        age: ageFromDob(child.date_of_birth, child.birth_year),
      },
      sessions: list,
      current_profile: currentProfile,
      careers,
    })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

import { getPool } from '../db/pool.js'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

function parsePage(raw) {
  const n = Number.parseInt(String(raw ?? '1'), 10)
  return Number.isFinite(n) && n >= 1 ? n : 1
}

function parseLimit(raw) {
  const n = Number.parseInt(String(raw ?? DEFAULT_LIMIT), 10)
  if (!Number.isFinite(n) || n < 1) return DEFAULT_LIMIT
  return Math.min(n, MAX_LIMIT)
}

export async function listAdminSessions(req, res) {
  try {
    const pool = getPool()
    const page = parsePage(req.query.page)
    const limit = parseLimit(req.query.limit)
    const offset = (page - 1) * limit
    const status = req.query.status ? String(req.query.status).trim() : null
    const userId = req.query.userId ? String(req.query.userId).trim() : null
    const quizId = req.query.quizId ? String(req.query.quizId).trim() : null
    const from = req.query.from ? String(req.query.from).trim() : null
    const to = req.query.to ? String(req.query.to).trim() : null

    const conditions = []
    const params = []
    let i = 1

    if (status && ['in_progress', 'completed', 'abandoned'].includes(status)) {
      conditions.push(`qs.status = $${i++}`)
      params.push(status)
    }
    if (userId) {
      conditions.push(`qs.user_id = $${i++}`)
      params.push(userId)
    }
    if (quizId) {
      conditions.push(`qs.quiz_id = $${i++}`)
      params.push(quizId)
    }
    if (from) {
      conditions.push(`(qs.completed_at >= $${i}::timestamptz OR qs.started_at >= $${i}::timestamptz)`)
      params.push(from)
      i += 1
    }
    if (to) {
      conditions.push(`(qs.completed_at <= $${i}::timestamptz OR qs.started_at <= $${i}::timestamptz)`)
      params.push(to)
      i += 1
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS n
       FROM public.quiz_sessions qs
       JOIN public.users u ON u.id = qs.user_id
       JOIN public.quizzes q ON q.id = qs.quiz_id
       ${where}`,
      params,
    )
    const total = countRes.rows[0]?.n ?? 0

    params.push(limit, offset)
    const limIdx = i
    const offIdx = i + 1

    const { rows } = await pool.query(
      `SELECT qs.id, qs.quiz_id, qs.user_id, qs.started_at, qs.completed_at, qs.status,
              qs.top_aptitude, qs.scores_json, qs.metadata_json, qs.attribution_json,
              u.full_name AS user_name, u.email::text AS user_email, u.role AS user_role,
              q.title AS quiz_title, q.slug AS quiz_slug,
              (qs.metadata_json->>'ai_provider') AS ai_provider
       FROM public.quiz_sessions qs
       JOIN public.users u ON u.id = qs.user_id
       JOIN public.quizzes q ON q.id = qs.quiz_id
       ${where}
       ORDER BY qs.started_at DESC
       LIMIT $${limIdx} OFFSET $${offIdx}`,
      params,
    )

    res.json({
      sessions: rows,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
}

export async function getAdminSession(req, res) {
  try {
    const sessionId = String(req.params.id || '')
    const pool = getPool()
    const sRes = await pool.query(
      `SELECT qs.id, qs.quiz_id, qs.user_id, qs.started_at, qs.completed_at, qs.status,
              qs.top_aptitude, qs.scores_json, qs.metadata_json, qs.attribution_json,
              u.full_name AS user_name, u.email::text AS user_email, u.role AS user_role,
              q.title AS quiz_title, q.slug AS quiz_slug, q.description AS quiz_description
       FROM public.quiz_sessions qs
       JOIN public.users u ON u.id = qs.user_id
       JOIN public.quizzes q ON q.id = qs.quiz_id
       WHERE qs.id = $1 LIMIT 1`,
      [sessionId],
    )
    const session = sRes.rows[0]
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }

    const aRes = await pool.query(
      `SELECT qa.id, qa.question_id, qa.question_option_id, qa.aptitude_type,
              qa.response_time_ms, qa.skipped, qa.answered_at,
              q.body AS question_body, q.order_index AS question_order,
              qo.label AS option_label
       FROM public.quiz_answers qa
       JOIN public.questions q ON q.id = qa.question_id
       LEFT JOIN public.question_options qo ON qo.id = qa.question_option_id
       WHERE qa.session_id = $1
       ORDER BY qa.answered_at ASC`,
      [sessionId],
    )

    res.json({
      ...session,
      answers: aRes.rows,
    })
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
}

import { randomUUID } from 'node:crypto'
import { getPool } from './lib/db.js'

export function registerParentApi(app) {
  app.post('/api/users/sync', async (req, res) => {
    try {
      const { id, email, fullName, role, parentUserId } = req.body ?? {}
      if (!id || !email || !fullName || !role) {
        res.status(400).json({ error: 'id, email, fullName, and role are required' })
        return
      }
      const pool = getPool()
      await pool.query(
        `INSERT INTO public.users (id, email, full_name, role, parent_user_id, updated_at)
         VALUES ($1, $2::citext, $3, $4, $5, now())
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           full_name = EXCLUDED.full_name,
           role = EXCLUDED.role,
           parent_user_id = EXCLUDED.parent_user_id,
           updated_at = now()`,
        [id, String(email).trim(), String(fullName).trim(), role, parentUserId ?? null],
      )
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })

  app.get('/api/users/by-email', async (req, res) => {
    try {
      const email = req.query.email
      if (!email || typeof email !== 'string') {
        res.status(400).json({ error: 'email query required' })
        return
      }
      const pool = getPool()
      const { rows } = await pool.query(
        `SELECT id, email, full_name, role, parent_user_id, birth_year
         FROM public.users WHERE email = $1::citext LIMIT 1`,
        [email.trim().toLowerCase()],
      )
      const row = rows[0]
      if (!row) {
        res.status(404).json({ error: 'No account for this email' })
        return
      }
      res.json({
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        parentUserId: row.parent_user_id,
        birthYear: row.birth_year,
      })
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })

  app.post('/api/parent/children', async (req, res) => {
    try {
      const { parentUserId, fullName, birthYear } = req.body ?? {}
      if (!parentUserId || !fullName?.trim()) {
        res.status(400).json({ error: 'parentUserId and fullName are required' })
        return
      }
      const pool = getPool()
      const parentCheck = await pool.query(
        `SELECT id FROM public.users WHERE id = $1 AND role = 'parent' LIMIT 1`,
        [parentUserId],
      )
      if (!parentCheck.rows[0]) {
        res.status(404).json({ error: 'Parent account not found' })
        return
      }

      const childId = `c-${randomUUID()}`
      const emailLocal = `${childId.replace(/-/g, '')}@child.kidscareerdecoder.internal`
      const by = birthYear != null && birthYear !== '' ? Number(birthYear) : null
      const birthYearVal =
        by != null && Number.isFinite(by) && by >= 1900 && by <= new Date().getFullYear()
          ? Math.floor(by)
          : null

      await pool.query(
        `INSERT INTO public.users (id, email, full_name, role, parent_user_id, birth_year, updated_at)
         VALUES ($1, $2::citext, $3, 'child', $4, $5, now())`,
        [childId, emailLocal, fullName.trim(), parentUserId, birthYearVal],
      )

      res.status(201).json({
        id: childId,
        fullName: fullName.trim(),
        birthYear: birthYearVal,
        signInEmail: emailLocal,
      })
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })

  app.get('/api/parent/dashboard', async (req, res) => {
    try {
      const parentUserId = req.query.parentUserId
      if (!parentUserId || typeof parentUserId !== 'string') {
        res.status(400).json({ error: 'parentUserId query required' })
        return
      }
      const pool = getPool()
      const { rows: children } = await pool.query(
        `SELECT id, full_name, birth_year, created_at
         FROM public.users
         WHERE parent_user_id = $1 AND role = 'child'
         ORDER BY created_at ASC`,
        [parentUserId],
      )

      const out = []
      for (const c of children) {
        const { rows: sessions } = await pool.query(
          `SELECT id, completed_at, top_aptitude
           FROM public.quiz_sessions
           WHERE user_id = $1 AND status = 'completed' AND completed_at IS NOT NULL
           ORDER BY completed_at DESC
           LIMIT 20`,
          [c.id],
        )
        const quizzesCompleted = sessions.length
        const latest = sessions[0]
        const topKey = latest?.top_aptitude ?? null
        out.push({
          id: c.id,
          fullName: c.full_name,
          birthYear: c.birth_year,
          quizzesCompleted,
          topAptitudeKey: topKey,
          recentSessions: sessions.map((s) => ({
            sessionId: s.id,
            completedAt: s.completed_at
              ? new Date(s.completed_at).toISOString().slice(0, 10)
              : null,
            topAptitudeKey: s.top_aptitude,
          })),
        })
      }

      res.json({ children: out })
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })

  app.post('/api/quiz-sessions/complete', async (req, res) => {
    try {
      const { userId, quizId, answers, scores, topAptitude } = req.body ?? {}
      if (!userId || !quizId || !Array.isArray(answers)) {
        res
          .status(400)
          .json({ error: 'userId, quizId, and answers[] are required' })
        return
      }
      const pool = getPool()
      const userRow = await pool.query(
        `SELECT id, role FROM public.users WHERE id = $1 LIMIT 1`,
        [userId],
      )
      if (!userRow.rows[0]) {
        res.status(404).json({ error: 'User not found' })
        return
      }
      if (userRow.rows[0].role !== 'child') {
        res.status(400).json({ error: 'Quiz results can only be saved for child accounts' })
        return
      }

      const sessionId = `s-${randomUUID()}`
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        await client.query(
          `INSERT INTO public.quiz_sessions
           (id, quiz_id, user_id, started_at, completed_at, status, top_aptitude, scores_json)
           VALUES ($1, $2, $3, now(), now(), 'completed', $4, $5::jsonb)`,
          [
            sessionId,
            quizId,
            userId,
            topAptitude ?? null,
            JSON.stringify(scores && typeof scores === 'object' ? scores : {}),
          ],
        )
        for (const a of answers) {
          const qid = a?.questionId
          if (!qid) continue
          const skipped = !a?.aptitudeType
          await client.query(
            `INSERT INTO public.quiz_answers
             (id, session_id, question_id, question_option_id, aptitude_type, skipped)
             VALUES ($1, $2, $3, NULL, $4, $5)`,
            [
              `a-${randomUUID()}`,
              sessionId,
              qid,
              skipped ? null : a.aptitudeType,
              skipped,
            ],
          )
        }
        await client.query('COMMIT')
        res.status(201).json({ sessionId })
      } catch (e) {
        await client.query('ROLLBACK')
        throw e
      } finally {
        client.release()
      }
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })
}

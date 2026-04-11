import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import cors from 'cors'
import express from 'express'
import { getPool } from './lib/db.js'
import { registerParentApi } from './parentApi.js'
import authRoutes from '../backend/routes/auth.js'
import quizRoutes from '../backend/routes/quiz.js'
import sessionRoutes from '../backend/routes/session.js'
import analyticsRoutes from '../backend/routes/analytics.js'
import adminRoutes from '../backend/routes/admin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const port = Number(process.env.PORT) || 3001
const app = express()

app.use(cors({ origin: true }))
app.use(express.json())

registerParentApi(app)

app.use('/api/auth', authRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/session', sessionRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', async (_req, res) => {
  try {
    const pool = getPool()
    const { rows } = await pool.query(
      'SELECT COUNT(*)::int AS n FROM public.quizzes',
    )
    res.json({
      ok: true,
      quizzes: rows[0]?.n ?? 0,
      jwtConfigured: Boolean(process.env.JWT_SECRET?.trim()),
    })
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    })
  }
})

app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const pool = getPool()
    const id = req.params.id

    const quizResult = await pool.query(
      `SELECT id, slug, title, description, time_per_question_seconds
       FROM public.quizzes WHERE id = $1`,
      [id],
    )
    const quiz = quizResult.rows[0]
    if (!quiz) {
      res.status(404).json({
        error: 'Quiz not found',
        hint:
          'Run supabase/migrations/20250404000000_initial_schema.sql in Supabase. Check quiz id quiz-aptitude-v1 exists.',
      })
      return
    }

    const qResult = await pool.query(
      `SELECT id, body, order_index
       FROM public.questions WHERE quiz_id = $1
       ORDER BY order_index ASC`,
      [id],
    )
    const questions = qResult.rows
    const qids = questions.map((q) => q.id)

    let options = []
    if (qids.length > 0) {
      const oResult = await pool.query(
        `SELECT id, question_id, label, aptitude_type, order_index
         FROM public.question_options
         WHERE question_id = ANY($1::text[])
         ORDER BY question_id, order_index ASC`,
        [qids],
      )
      options = oResult.rows
    }

    const byQuestion = new Map()
    for (const o of options) {
      const list = byQuestion.get(o.question_id) ?? []
      list.push(o)
      byQuestion.set(o.question_id, list)
    }

    const payload = {
      id: quiz.id,
      slug: quiz.slug,
      title: quiz.title,
      description: quiz.description,
      timePerQuestionSeconds: quiz.time_per_question_seconds,
      questions: questions.map((q) => ({
        id: q.id,
        text: q.body,
        options: (byQuestion.get(q.id) ?? []).map((o) => ({
          id: o.id,
          text: o.label,
          aptitudeType: o.aptitude_type,
        })),
      })),
    }
    res.json(payload)
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    })
  }
})

app.get('/api/careers', async (req, res) => {
  try {
    const pool = getPool()
    const aptitude =
      typeof req.query.aptitude === 'string' ? req.query.aptitude : null

    const { rows } = aptitude
      ? await pool.query(
          `SELECT title, aptitude_type, sort_order
           FROM public.careers
           WHERE aptitude_type = $1
           ORDER BY sort_order ASC`,
          [aptitude],
        )
      : await pool.query(
          `SELECT title, aptitude_type, sort_order
           FROM public.careers
           ORDER BY aptitude_type ASC, sort_order ASC`,
        )

    res.json(
      rows.map((r) => ({
        title: r.title,
        aptitudeType: r.aptitude_type,
      })),
    )
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    })
  }
})

const distDir = path.join(__dirname, '..', 'dist')
const distIndex = path.join(distDir, 'index.html')

if (existsSync(distIndex)) {
  app.use(express.static(distDir))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      next()
      return
    }
    res.sendFile(distIndex)
  })
} else {
  app.get('/', (_req, res) => {
    res.json({
      ok: true,
      name: 'KidsCareerDecoder API',
      message: 'Run npm run build to serve the React app from this server.',
      try: ['/api/health', '/api/quizzes/quiz-aptitude-v1'],
    })
  })
}

app.listen(port, async () => {
  console.log(`Listening on port ${port}`)
  try {
    const pool = getPool()
    const { rows } = await pool.query(
      'SELECT COUNT(*)::int AS n FROM public.quizzes',
    )
    const n = rows[0]?.n ?? 0
    console.log(`Database OK — quizzes: ${n}`)
    if (n === 0) {
      console.warn(
        'No quizzes found. Run supabase/migrations/20250404000000_initial_schema.sql in the Supabase SQL editor.',
      )
    }
  } catch (err) {
    console.error(
      'Database check failed:',
      err instanceof Error ? err.message : err,
    )
    console.error(
      'Set DATABASE_URL in .env (Supabase → Project Settings → Database → Connection string → URI).',
    )
  }
})

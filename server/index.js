import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import cors from 'cors'
import express from 'express'
import { getSupabase } from './lib/supabase.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const port = Number(process.env.PORT) || 3001
const app = express()

app.use(cors({ origin: true }))
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    name: 'KidsCareerDecoder API',
    try: ['/api/health', '/api/quizzes/quiz-aptitude-v1'],
  })
})

app.get('/api/health', async (_req, res) => {
  try {
    const supabase = getSupabase()
    const { count, error } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    res.json({ ok: true, quizzes: count ?? 0 })
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    })
  }
})

app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const supabase = getSupabase()
    const id = req.params.id

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, slug, title, description, time_per_question_seconds')
      .eq('id', id)
      .maybeSingle()

    if (quizError) throw quizError
    if (!quiz) {
      res.status(404).json({
        error: 'Quiz not found',
        hint:
          'Confirm the migration ran in Supabase (quiz id quiz-aptitude-v1). Use SUPABASE_SERVICE_ROLE_KEY in .env (not the anon key), or RLS will hide rows.',
      })
      return
    }

    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('id, body, order_index')
      .eq('quiz_id', id)
      .order('order_index', { ascending: true })

    if (qError) throw qError

    const qids = (questions ?? []).map((q) => q.id)
    let options = []
    if (qids.length > 0) {
      const { data: opts, error: oError } = await supabase
        .from('question_options')
        .select('id, question_id, label, aptitude_type, order_index')
        .in('question_id', qids)
        .order('order_index', { ascending: true })
      if (oError) throw oError
      options = opts ?? []
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
      questions: (questions ?? []).map((q) => ({
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
    const supabase = getSupabase()
    const aptitude =
      typeof req.query.aptitude === 'string' ? req.query.aptitude : null

    const base = supabase.from('careers').select('title, aptitude_type, sort_order')
    const { data: rows, error } = aptitude
      ? await base
          .eq('aptitude_type', aptitude)
          .order('sort_order', { ascending: true })
      : await base
          .order('aptitude_type', { ascending: true })
          .order('sort_order', { ascending: true })
    if (error) throw error

    res.json(
      (rows ?? []).map((r) => ({
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

app.listen(port, async () => {
  console.log(`API http://localhost:${port}`)
  try {
    const supabase = getSupabase()
    const { count, error } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    console.log(`Supabase OK — quizzes in DB: ${count ?? 0}`)
    if ((count ?? 0) === 0) {
      console.warn(
        'No quizzes found. Run supabase/migrations/20250404000000_initial_schema.sql in the Supabase SQL editor.',
      )
    }
  } catch (err) {
    console.error(
      'Supabase check failed:',
      err instanceof Error ? err.message : err,
    )
    console.error(
      'Fix .env at project root: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (service_role, not anon).',
    )
  }
})

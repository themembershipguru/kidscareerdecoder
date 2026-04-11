import { getPool } from '../db/pool.js'

function nestQuestionsFromRows(quizRow, qRows, optRows) {
  const byQ = new Map()
  for (const r of qRows) {
    byQ.set(r.id, {
      id: r.id,
      quiz_id: r.quiz_id,
      body: r.body,
      order_index: r.order_index,
      difficulty_level: r.difficulty_level,
      aptitude_tag: r.aptitude_tag,
      created_at: r.created_at,
      options: [],
    })
  }
  for (const o of optRows) {
    const q = byQ.get(o.question_id)
    if (q) {
      q.options.push({
        id: o.id,
        question_id: o.question_id,
        label: o.label,
        aptitude_type: o.aptitude_type,
        order_index: o.order_index,
        is_correct: o.is_correct,
        created_at: o.created_at,
      })
    }
  }
  const questions = [...byQ.values()].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  for (const q of questions) {
    q.options.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  }
  return {
    quiz: {
      id: quizRow.id,
      slug: quizRow.slug,
      title: quizRow.title,
      description: quizRow.description,
      created_by_user_id: quizRow.created_by_user_id,
      default_difficulty: quizRow.default_difficulty,
      time_per_question_seconds: quizRow.time_per_question_seconds,
      is_published: quizRow.is_published,
      created_at: quizRow.created_at,
      updated_at: quizRow.updated_at,
      questions,
    },
  }
}

export async function listPublishedQuizzes(_req, res) {
  try {
    const pool = getPool()
    const { rows } = await pool.query(
      `SELECT id, slug, title, description, time_per_question_seconds
       FROM public.quizzes
       WHERE is_published = true
       ORDER BY title ASC`,
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

export async function getQuizBySlug(req, res) {
  try {
    const slug = String(req.params.slug || '')
    const pool = getPool()
    const quizRes = await pool.query(
      `SELECT id, slug, title, description, created_by_user_id, default_difficulty,
              time_per_question_seconds, is_published, created_at, updated_at
       FROM public.quizzes WHERE slug = $1 LIMIT 1`,
      [slug],
    )
    const quizRow = quizRes.rows[0]
    if (!quizRow) {
      res.status(404).json({ error: 'Quiz not found' })
      return
    }
    const qRes = await pool.query(
      `SELECT id, quiz_id, body, order_index, difficulty_level, aptitude_tag, created_at
       FROM public.questions WHERE quiz_id = $1 ORDER BY order_index ASC`,
      [quizRow.id],
    )
    const qIds = qRes.rows.map((r) => r.id)
    let optRows = []
    if (qIds.length) {
      const oRes = await pool.query(
        `SELECT id, question_id, label, aptitude_type, order_index, is_correct, created_at
         FROM public.question_options
         WHERE question_id = ANY($1::text[])
         ORDER BY question_id, order_index ASC`,
        [qIds],
      )
      optRows = oRes.rows
    }
    res.json(nestQuestionsFromRows(quizRow, qRes.rows, optRows))
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

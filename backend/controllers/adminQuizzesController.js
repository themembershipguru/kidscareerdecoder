import { v4 as uuidv4 } from 'uuid'
import { getPool } from '../db/pool.js'
import { nestQuestionsFromRows } from './quizController.js'

const APTITUDE_TYPES = new Set([
  'logical',
  'creative',
  'verbal',
  'social',
  'scientific',
  'practical',
])

function slugify(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'quiz'
}

async function loadQuizWithNested(pool, quizId) {
  const quizRes = await pool.query(
    `SELECT id, slug, title, description, created_by_user_id, default_difficulty,
            time_per_question_seconds, is_published, created_at, updated_at
     FROM public.quizzes WHERE id = $1 LIMIT 1`,
    [quizId],
  )
  const quizRow = quizRes.rows[0]
  if (!quizRow) return null
  const qRes = await pool.query(
    `SELECT id, quiz_id, body, order_index, difficulty_level, aptitude_tag, created_at
     FROM public.questions WHERE quiz_id = $1 ORDER BY order_index ASC`,
    [quizId],
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
  return nestQuestionsFromRows(quizRow, qRes.rows, optRows)
}

export async function listAdminQuizzes(_req, res) {
  try {
    const pool = getPool()
    const { rows } = await pool.query(
      `SELECT q.id, q.slug, q.title, q.description, q.is_published, q.time_per_question_seconds,
              q.created_at, q.updated_at,
              (SELECT COUNT(*)::int FROM public.questions qn WHERE qn.quiz_id = q.id) AS question_count
       FROM public.quizzes q
       ORDER BY q.updated_at DESC`,
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

export async function getAdminQuiz(req, res) {
  try {
    const pool = getPool()
    const id = String(req.params.id || '')
    const data = await loadQuizWithNested(pool, id)
    if (!data) {
      res.status(404).json({ error: 'Quiz not found' })
      return
    }
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

async function assertQuizHasContent(pool, quizId) {
  const { rows } = await pool.query(
    `SELECT q.id,
            (SELECT COUNT(*)::int FROM public.question_options o WHERE o.question_id = q.id) AS opt_n
     FROM public.questions q WHERE q.quiz_id = $1`,
    [quizId],
  )
  if (!rows.length) return { ok: false, error: 'Quiz has no questions' }
  const bad = rows.some((r) => Number(r.opt_n) < 1)
  if (bad) return { ok: false, error: 'Each question needs at least one option' }
  return { ok: true }
}

export async function createAdminQuiz(req, res) {
  try {
    const { title, slug, description, time_per_question_seconds: tps, default_difficulty: dd, is_published } =
      req.body || {}
    if (!title || !String(title).trim()) {
      res.status(400).json({ error: 'title is required' })
      return
    }
    const pool = getPool()
    const id = uuidv4()
    let finalSlug = slug ? slugify(slug) : slugify(title)
    const base = finalSlug
    let n = 0
    for (;;) {
      const check = await pool.query(
        `SELECT id FROM public.quizzes WHERE slug = $1 LIMIT 1`,
        [finalSlug],
      )
      if (!check.rows.length) break
      n += 1
      finalSlug = `${base}-${n}`
    }
    const sec = tps != null ? Number(tps) : 60
    const diff = dd != null ? Number(dd) : 0.5
    const published = Boolean(is_published)
    if (published) {
      res.status(400).json({ error: 'Publish after adding questions' })
      return
    }
    await pool.query(
      `INSERT INTO public.quizzes (
         id, slug, title, description, created_by_user_id, default_difficulty,
         time_per_question_seconds, is_published, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())`,
      [
        id,
        finalSlug,
        String(title).trim(),
        description != null ? String(description) : null,
        req.user?.id ?? null,
        diff,
        Number.isFinite(sec) && sec > 0 ? Math.floor(sec) : 60,
        false,
      ],
    )
    const data = await loadQuizWithNested(pool, id)
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

export async function patchAdminQuiz(req, res) {
  try {
    const id = String(req.params.id || '')
    const pool = getPool()
    const { rows: ex } = await pool.query(`SELECT id FROM public.quizzes WHERE id = $1`, [id])
    if (!ex.length) {
      res.status(404).json({ error: 'Quiz not found' })
      return
    }
    const body = req.body || {}
    const sets = []
    const vals = []
    let p = 1

    if (body.title != null) {
      const t = String(body.title).trim()
      if (!t) {
        res.status(400).json({ error: 'title cannot be empty' })
        return
      }
      sets.push(`title = $${p++}`)
      vals.push(t)
    }
    if (body.slug != null) {
      const s = slugify(body.slug)
      if (!s) {
        res.status(400).json({ error: 'Invalid slug' })
        return
      }
      const clash = await pool.query(
        `SELECT id FROM public.quizzes WHERE slug = $1 AND id <> $2 LIMIT 1`,
        [s, id],
      )
      if (clash.rows.length) {
        res.status(409).json({ error: 'Slug already in use' })
        return
      }
      sets.push(`slug = $${p++}`)
      vals.push(s)
    }
    if (body.description !== undefined) {
      sets.push(`description = $${p++}`)
      vals.push(body.description == null ? null : String(body.description))
    }
    if (body.time_per_question_seconds != null) {
      const sec = Number(body.time_per_question_seconds)
      if (!Number.isFinite(sec) || sec < 1) {
        res.status(400).json({ error: 'Invalid time_per_question_seconds' })
        return
      }
      sets.push(`time_per_question_seconds = $${p++}`)
      vals.push(Math.floor(sec))
    }
    if (body.default_difficulty != null) {
      const d = Number(body.default_difficulty)
      if (!Number.isFinite(d) || d < 0 || d > 1) {
        res.status(400).json({ error: 'default_difficulty must be between 0 and 1' })
        return
      }
      sets.push(`default_difficulty = $${p++}`)
      vals.push(d)
    }
    if (body.is_published != null) {
      const pub = Boolean(body.is_published)
      if (pub) {
        const check = await assertQuizHasContent(pool, id)
        if (!check.ok) {
          res.status(400).json({ error: check.error })
          return
        }
      }
      sets.push(`is_published = $${p++}`)
      vals.push(pub)
    }

    if (!sets.length) {
      res.status(400).json({ error: 'No valid fields' })
      return
    }
    sets.push(`updated_at = now()`)
    vals.push(id)
    await pool.query(
      `UPDATE public.quizzes SET ${sets.join(', ')} WHERE id = $${p}`,
      vals,
    )
    const data = await loadQuizWithNested(pool, id)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

export async function deleteAdminQuiz(req, res) {
  try {
    const id = String(req.params.id || '')
    const pool = getPool()
    const r = await pool.query(`DELETE FROM public.quizzes WHERE id = $1 RETURNING id`, [id])
    if (!r.rows.length) {
      res.status(404).json({ error: 'Quiz not found' })
      return
    }
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

async function assertQuestionBelongs(pool, quizId, questionId) {
  const { rows } = await pool.query(
    `SELECT id FROM public.questions WHERE id = $1 AND quiz_id = $2 LIMIT 1`,
    [questionId, quizId],
  )
  return rows.length > 0
}

export async function createAdminQuestion(req, res) {
  try {
    const quizId = String(req.params.quizId || '')
    const { body, order_index: orderIndex, difficulty_level: diff, aptitude_tag: tag } = req.body || {}
    if (!body || !String(body).trim()) {
      res.status(400).json({ error: 'body is required' })
      return
    }
    const pool = getPool()
    const qz = await pool.query(`SELECT id FROM public.quizzes WHERE id = $1`, [quizId])
    if (!qz.rows.length) {
      res.status(404).json({ error: 'Quiz not found' })
      return
    }
    const qid = uuidv4()
    const oi =
      orderIndex != null && Number.isFinite(Number(orderIndex))
        ? Math.floor(Number(orderIndex))
        : 0
    const dl = diff != null && Number.isFinite(Number(diff)) ? Number(diff) : null
    await pool.query(
      `INSERT INTO public.questions (id, quiz_id, body, order_index, difficulty_level, aptitude_tag)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [qid, quizId, String(body).trim(), oi, dl, tag != null ? String(tag) : null],
    )
    await pool.query(`UPDATE public.quizzes SET updated_at = now() WHERE id = $1`, [quizId])
    const data = await loadQuizWithNested(pool, quizId)
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

export async function patchAdminQuestion(req, res) {
  try {
    const quizId = String(req.params.quizId || '')
    const questionId = String(req.params.questionId || '')
    const pool = getPool()
    if (!(await assertQuestionBelongs(pool, quizId, questionId))) {
      res.status(404).json({ error: 'Question not found' })
      return
    }
    const body = req.body || {}
    const sets = []
    const vals = []
    let p = 1
    if (body.body != null) {
      const b = String(body.body).trim()
      if (!b) {
        res.status(400).json({ error: 'body cannot be empty' })
        return
      }
      sets.push(`body = $${p++}`)
      vals.push(b)
    }
    if (body.order_index != null) {
      sets.push(`order_index = $${p++}`)
      vals.push(Math.floor(Number(body.order_index)))
    }
    if (body.difficulty_level !== undefined) {
      sets.push(`difficulty_level = $${p++}`)
      vals.push(
        body.difficulty_level == null ? null : Number(body.difficulty_level),
      )
    }
    if (body.aptitude_tag !== undefined) {
      sets.push(`aptitude_tag = $${p++}`)
      vals.push(body.aptitude_tag == null ? null : String(body.aptitude_tag))
    }
    if (!sets.length) {
      res.status(400).json({ error: 'No valid fields' })
      return
    }
    vals.push(questionId)
    await pool.query(
      `UPDATE public.questions SET ${sets.join(', ')} WHERE id = $${p}`,
      vals,
    )
    await pool.query(`UPDATE public.quizzes SET updated_at = now() WHERE id = $1`, [quizId])
    res.json(await loadQuizWithNested(pool, quizId))
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

export async function deleteAdminQuestion(req, res) {
  try {
    const quizId = String(req.params.quizId || '')
    const questionId = String(req.params.questionId || '')
    const pool = getPool()
    if (!(await assertQuestionBelongs(pool, quizId, questionId))) {
      res.status(404).json({ error: 'Question not found' })
      return
    }
    await pool.query(`DELETE FROM public.questions WHERE id = $1`, [questionId])
    await pool.query(`UPDATE public.quizzes SET updated_at = now() WHERE id = $1`, [quizId])
    res.json(await loadQuizWithNested(pool, quizId))
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

export async function createAdminOption(req, res) {
  try {
    const quizId = String(req.params.quizId || '')
    const questionId = String(req.params.questionId || '')
    const { label, aptitude_type: apt, order_index: orderIndex, is_correct: isCorrect } = req.body || {}
    if (!label || !String(label).trim()) {
      res.status(400).json({ error: 'label is required' })
      return
    }
    const at = String(apt || '').trim()
    if (!APTITUDE_TYPES.has(at)) {
      res.status(400).json({ error: 'Invalid aptitude_type' })
      return
    }
    const pool = getPool()
    if (!(await assertQuestionBelongs(pool, quizId, questionId))) {
      res.status(404).json({ error: 'Question not found' })
      return
    }
    const oid = uuidv4()
    const oi =
      orderIndex != null && Number.isFinite(Number(orderIndex))
        ? Math.floor(Number(orderIndex))
        : 0
    await pool.query(
      `INSERT INTO public.question_options (id, question_id, label, aptitude_type, order_index, is_correct)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [oid, questionId, String(label).trim(), at, oi, isCorrect == null ? null : Boolean(isCorrect)],
    )
    await pool.query(`UPDATE public.quizzes SET updated_at = now() WHERE id = $1`, [quizId])
    res.status(201).json(await loadQuizWithNested(pool, quizId))
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

async function assertOptionBelongs(pool, quizId, questionId, optionId) {
  const { rows } = await pool.query(
    `SELECT o.id FROM public.question_options o
     JOIN public.questions q ON q.id = o.question_id
     WHERE o.id = $1 AND q.id = $2 AND q.quiz_id = $3 LIMIT 1`,
    [optionId, questionId, quizId],
  )
  return rows.length > 0
}

export async function patchAdminOption(req, res) {
  try {
    const quizId = String(req.params.quizId || '')
    const questionId = String(req.params.questionId || '')
    const optionId = String(req.params.optionId || '')
    const pool = getPool()
    if (!(await assertOptionBelongs(pool, quizId, questionId, optionId))) {
      res.status(404).json({ error: 'Option not found' })
      return
    }
    const body = req.body || {}
    const sets = []
    const vals = []
    let p = 1
    if (body.label != null) {
      const l = String(body.label).trim()
      if (!l) {
        res.status(400).json({ error: 'label cannot be empty' })
        return
      }
      sets.push(`label = $${p++}`)
      vals.push(l)
    }
    if (body.aptitude_type != null) {
      const at = String(body.aptitude_type).trim()
      if (!APTITUDE_TYPES.has(at)) {
        res.status(400).json({ error: 'Invalid aptitude_type' })
        return
      }
      sets.push(`aptitude_type = $${p++}`)
      vals.push(at)
    }
    if (body.order_index != null) {
      sets.push(`order_index = $${p++}`)
      vals.push(Math.floor(Number(body.order_index)))
    }
    if (body.is_correct !== undefined) {
      sets.push(`is_correct = $${p++}`)
      vals.push(body.is_correct == null ? null : Boolean(body.is_correct))
    }
    if (!sets.length) {
      res.status(400).json({ error: 'No valid fields' })
      return
    }
    vals.push(optionId)
    await pool.query(
      `UPDATE public.question_options SET ${sets.join(', ')} WHERE id = $${p}`,
      vals,
    )
    await pool.query(`UPDATE public.quizzes SET updated_at = now() WHERE id = $1`, [quizId])
    res.json(await loadQuizWithNested(pool, quizId))
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

export async function deleteAdminOption(req, res) {
  try {
    const quizId = String(req.params.quizId || '')
    const questionId = String(req.params.questionId || '')
    const optionId = String(req.params.optionId || '')
    const pool = getPool()
    if (!(await assertOptionBelongs(pool, quizId, questionId, optionId))) {
      res.status(404).json({ error: 'Option not found' })
      return
    }
    await pool.query(`DELETE FROM public.question_options WHERE id = $1`, [optionId])
    await pool.query(`UPDATE public.quizzes SET updated_at = now() WHERE id = $1`, [quizId])
    res.json(await loadQuizWithNested(pool, quizId))
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

import { v4 as uuidv4 } from 'uuid'
import { getPool } from '../db/pool.js'
import { getAptitudeProfile } from '../services/aiProfiler.js'
import {
  adjustAbility,
  normalizeQuizDefault,
  pickNextQuestionId,
} from '../services/adaptiveDifficulty.js'

const aptitudeTypes = [
  'logical',
  'creative',
  'verbal',
  'social',
  'scientific',
  'practical',
]

async function loadUser(userId) {
  const pool = getPool()
  const { rows } = await pool.query(
    `SELECT id, role, parent_user_id, date_of_birth, birth_year
     FROM public.users WHERE id = $1 LIMIT 1`,
    [userId],
  )
  const data = rows[0]
  if (!data) return { error: 'User not found' }
  return { user: data }
}

async function assertCanActForChild(parentId, childId) {
  const pool = getPool()
  const { rows } = await pool.query(
    `SELECT id FROM public.users
     WHERE id = $1 AND parent_user_id = $2 AND role = 'child' LIMIT 1`,
    [childId, parentId],
  )
  if (!rows.length) return { ok: false, error: 'Forbidden' }
  return { ok: true }
}

function dobToString(dobVal) {
  if (dobVal == null) return null
  if (dobVal instanceof Date) return dobVal.toISOString().slice(0, 10)
  return String(dobVal).slice(0, 10)
}

function computeAgeFromDob(dobStr, birthYear) {
  const normalized = dobToString(dobStr)
  if (normalized) {
    const d = new Date(`${normalized}T12:00:00Z`)
    if (!Number.isNaN(d.getTime())) {
      const t = new Date()
      let a = t.getFullYear() - d.getUTCFullYear()
      const m = t.getMonth() - d.getUTCMonth()
      if (m < 0 || (m === 0 && t.getDate() < d.getUTCDate())) a -= 1
      return Math.min(14, Math.max(3, a))
    }
  }
  if (birthYear != null) {
    const a = new Date().getFullYear() - Number(birthYear)
    return Math.min(14, Math.max(3, a))
  }
  return 10
}

async function assertSessionReadable(session, reqUser) {
  if (session.user_id === reqUser.id) return true
  if (reqUser.role === 'parent') {
    const r = await assertCanActForChild(reqUser.id, session.user_id)
    return r.ok
  }
  return false
}

function parseSessionMetadata(raw) {
  if (raw == null) return {}
  if (typeof raw === 'string') {
    try {
      const o = JSON.parse(raw)
      return typeof o === 'object' && o && !Array.isArray(o) ? o : {}
    } catch {
      return {}
    }
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) return { ...raw }
  return {}
}

async function loadQuestionPayload(pool, questionId) {
  const qRes = await pool.query(
    `SELECT id, quiz_id, body, order_index, difficulty_level, aptitude_tag, created_at
     FROM public.questions WHERE id = $1 LIMIT 1`,
    [questionId],
  )
  const q = qRes.rows[0]
  if (!q) return null
  const oRes = await pool.query(
    `SELECT id, question_id, label, aptitude_type, order_index, is_correct, created_at
     FROM public.question_options
     WHERE question_id = $1
     ORDER BY order_index ASC`,
    [questionId],
  )
  return {
    id: q.id,
    quiz_id: q.quiz_id,
    body: q.body,
    order_index: q.order_index,
    difficulty_level: q.difficulty_level,
    aptitude_tag: q.aptitude_tag,
    created_at: q.created_at,
    options: oRes.rows.map((o) => ({
      id: o.id,
      question_id: o.question_id,
      label: o.label,
      aptitude_type: o.aptitude_type,
      order_index: o.order_index,
      is_correct: o.is_correct,
      created_at: o.created_at,
    })),
  }
}

async function persistAdaptiveMetadata(pool, sessionId, baseMeta, adaptivePatch) {
  const meta = parseSessionMetadata(baseMeta)
  const next = {
    ...meta,
    adaptive: {
      ...(meta.adaptive && typeof meta.adaptive === 'object' ? meta.adaptive : {}),
      ...adaptivePatch,
    },
  }
  await pool.query(
    `UPDATE public.quiz_sessions SET metadata_json = $1::jsonb WHERE id = $2`,
    [JSON.stringify(next), sessionId],
  )
  return next
}

async function loadAdaptiveContext(pool, quizId, sessionId) {
  const qList = await pool.query(
    `SELECT id, order_index, difficulty_level FROM public.questions WHERE quiz_id = $1 ORDER BY order_index ASC`,
    [quizId],
  )
  const aRes = await pool.query(
    `SELECT question_id FROM public.quiz_answers WHERE session_id = $1`,
    [sessionId],
  )
  const answeredSet = new Set(aRes.rows.map((r) => r.question_id))
  const questionsById = new Map(qList.rows.map((r) => [r.id, r]))
  const allIds = qList.rows.map((r) => r.id)
  const remainingIds = allIds.filter((id) => !answeredSet.has(id))
  return {
    allIds,
    answeredSet,
    remainingIds,
    questionsById,
    totalQuestions: allIds.length,
    answeredCount: answeredSet.size,
  }
}

export async function startSession(req, res) {
  try {
    const { quiz_id: quizId, user_id: userId } = req.body
    if (!quizId || !userId) {
      res.status(400).json({ error: 'quiz_id and user_id are required' })
      return
    }
    const u = await loadUser(userId)
    if (u.error) {
      res.status(400).json({ error: u.error })
      return
    }
    const childUser = u.user
    if (req.user.role === 'child') {
      if (req.user.id !== userId) {
        res.status(403).json({ error: 'Forbidden' })
        return
      }
    } else if (req.user.role === 'parent') {
      const ok = await assertCanActForChild(req.user.id, userId)
      if (!ok.ok) {
        res.status(403).json({ error: ok.error })
        return
      }
    } else {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    if (childUser.role !== 'child') {
      res.status(400).json({ error: 'Sessions are for child profiles' })
      return
    }
    const pool = getPool()
    const qRes = await pool.query(
      `SELECT id FROM public.quizzes WHERE id = $1 AND is_published = true LIMIT 1`,
      [quizId],
    )
    if (!qRes.rows.length) {
      res.status(404).json({ error: 'Quiz not found' })
      return
    }
    const sessionId = uuidv4()
    const sessionAttr = buildSessionAttribution(req.body)
    await pool.query(
      `INSERT INTO public.quiz_sessions (id, quiz_id, user_id, status, attribution_json)
       VALUES ($1, $2, $3, 'in_progress', $4::jsonb)`,
      [sessionId, quizId, userId, sessionAttr ? JSON.stringify(sessionAttr) : null],
    )
    res.status(201).json({ session_id: sessionId })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

export async function getCurrentQuestion(req, res) {
  try {
    const sessionId = String(req.params.sessionId || '')
    const slug = String(req.query.slug || '').trim()
    if (!slug) {
      res.status(400).json({ error: 'slug query parameter is required' })
      return
    }
    const pool = getPool()
    const sRes = await pool.query(
      `SELECT qs.id, qs.user_id, qs.quiz_id, qs.status, qs.metadata_json,
              q.title, q.time_per_question_seconds, q.default_difficulty
       FROM public.quiz_sessions qs
       JOIN public.quizzes q ON q.id = qs.quiz_id
       WHERE qs.id = $1 AND q.slug = $2
       LIMIT 1`,
      [sessionId, slug],
    )
    const row = sRes.rows[0]
    if (!row) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    const session = {
      id: row.id,
      user_id: row.user_id,
      quiz_id: row.quiz_id,
      status: row.status,
    }
    const readable = await assertSessionReadable(session, req.user)
    if (!readable) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    if (row.status !== 'in_progress') {
      res.status(400).json({ error: 'Session is not active' })
      return
    }

    const ctx = await loadAdaptiveContext(pool, row.quiz_id, sessionId)
    if (ctx.remainingIds.length === 0) {
      res.json({
        done: true,
        total_questions: ctx.totalQuestions,
        answered_count: ctx.answeredCount,
        quiz_title: row.title,
        time_per_question_seconds: Number(row.time_per_question_seconds) || 60,
      })
      return
    }

    const meta = parseSessionMetadata(row.metadata_json)
    const adaptive = meta.adaptive && typeof meta.adaptive === 'object' ? meta.adaptive : {}
    const ability =
      typeof adaptive.ability === 'number' && Number.isFinite(adaptive.ability)
        ? adaptive.ability
        : normalizeQuizDefault(row.default_difficulty)

    const pending = adaptive.pending_question_id
    let nextId = null
    if (pending && typeof pending === 'string' && ctx.remainingIds.includes(pending)) {
      nextId = pending
    } else {
      nextId = pickNextQuestionId(ctx.remainingIds, ctx.questionsById, ability)
      await persistAdaptiveMetadata(pool, sessionId, row.metadata_json, {
        ability,
        pending_question_id: nextId,
      })
    }

    const question = await loadQuestionPayload(pool, nextId)
    if (!question) {
      res.status(500).json({ error: 'Question not found' })
      return
    }

    res.json({
      done: false,
      quiz_title: row.title,
      time_per_question_seconds: Number(row.time_per_question_seconds) || 60,
      total_questions: ctx.totalQuestions,
      progress_index: ctx.answeredCount + 1,
      question,
    })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

export async function submitAnswer(req, res) {
  try {
    const sessionId = String(req.params.sessionId || '')
    const { question_id: questionId, question_option_id: optionId, response_time_ms: responseTimeMs, skipped } =
      req.body
    if (!questionId) {
      res.status(400).json({ error: 'question_id is required' })
      return
    }
    const pool = getPool()
    const sRes = await pool.query(
      `SELECT qs.id, qs.user_id, qs.quiz_id, qs.status, qs.metadata_json,
              q.time_per_question_seconds, q.default_difficulty
       FROM public.quiz_sessions qs
       JOIN public.quizzes q ON q.id = qs.quiz_id
       WHERE qs.id = $1 LIMIT 1`,
      [sessionId],
    )
    const sessionRow = sRes.rows[0]
    if (!sessionRow) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    const session = {
      id: sessionRow.id,
      user_id: sessionRow.user_id,
      quiz_id: sessionRow.quiz_id,
      status: sessionRow.status,
    }
    const readable = await assertSessionReadable(session, req.user)
    if (!readable) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    if (sessionRow.status !== 'in_progress') {
      res.status(400).json({ error: 'Session is not active' })
      return
    }

    const qRes = await pool.query(
      `SELECT id, quiz_id, difficulty_level FROM public.questions WHERE id = $1 LIMIT 1`,
      [questionId],
    )
    const qrow = qRes.rows[0]
    if (!qrow || qrow.quiz_id !== sessionRow.quiz_id) {
      res.status(400).json({ error: 'Invalid question for this quiz' })
      return
    }

    let aptitudeType = null
    let resolvedOptionId = null
    const isSkipped = Boolean(skipped)
    if (!isSkipped) {
      if (!optionId) {
        res.status(400).json({ error: 'question_option_id is required when not skipped' })
        return
      }
      const oRes = await pool.query(
        `SELECT id, question_id, aptitude_type FROM public.question_options WHERE id = $1 LIMIT 1`,
        [optionId],
      )
      const opt = oRes.rows[0]
      if (!opt || opt.question_id !== questionId) {
        res.status(400).json({ error: 'Invalid option for question' })
        return
      }
      aptitudeType = opt.aptitude_type
      resolvedOptionId = opt.id
    }
    await pool.query(
      `INSERT INTO public.quiz_answers (
         id, session_id, question_id, question_option_id, aptitude_type, response_time_ms, skipped
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        uuidv4(),
        sessionId,
        questionId,
        resolvedOptionId,
        aptitudeType,
        responseTimeMs != null ? Number(responseTimeMs) : null,
        isSkipped,
      ],
    )

    const meta = parseSessionMetadata(sessionRow.metadata_json)
    const adaptive = meta.adaptive && typeof meta.adaptive === 'object' ? meta.adaptive : {}
    let ability =
      typeof adaptive.ability === 'number' && Number.isFinite(adaptive.ability)
        ? adaptive.ability
        : normalizeQuizDefault(sessionRow.default_difficulty)

    ability = adjustAbility(ability, {
      skipped: isSkipped,
      responseTimeMs,
      timeLimitSec: sessionRow.time_per_question_seconds,
      questionDifficulty: qrow.difficulty_level,
    })

    const ctx = await loadAdaptiveContext(pool, sessionRow.quiz_id, sessionId)
    const tps = Number(sessionRow.time_per_question_seconds) || 60

    if (ctx.remainingIds.length === 0) {
      await persistAdaptiveMetadata(pool, sessionId, sessionRow.metadata_json, {
        ability,
        pending_question_id: null,
      })
      res.json({
        success: true,
        next_question: null,
        total_questions: ctx.totalQuestions,
        answered_count: ctx.answeredCount,
        time_per_question_seconds: tps,
      })
      return
    }

    const nextId = pickNextQuestionId(ctx.remainingIds, ctx.questionsById, ability)
    const nextQuestion = await loadQuestionPayload(pool, nextId)
    if (!nextQuestion) {
      res.status(500).json({ error: 'Next question not found' })
      return
    }
    await persistAdaptiveMetadata(pool, sessionId, sessionRow.metadata_json, {
      ability,
      pending_question_id: nextId,
    })
    res.json({
      success: true,
      next_question: nextQuestion,
      total_questions: ctx.totalQuestions,
      answered_count: ctx.answeredCount,
      time_per_question_seconds: tps,
    })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

function tallyAnswers(answers) {
  const counts = Object.fromEntries(aptitudeTypes.map((t) => [t, 0]))
  let answered = 0
  for (const a of answers) {
    if (a.skipped) continue
    if (a.aptitude_type && counts[a.aptitude_type] != null) {
      counts[a.aptitude_type] += 1
      answered += 1
    }
  }
  return { counts, answered }
}

function pickTopAptitude(counts) {
  let best = aptitudeTypes[0]
  let bestVal = counts[best]
  for (const t of aptitudeTypes) {
    const v = counts[t]
    if (v > bestVal || (v === bestVal && t.localeCompare(best) < 0)) {
      best = t
      bestVal = v
    }
  }
  return best
}

function normalizeCountsToScores(counts, total) {
  const out = {}
  for (const t of aptitudeTypes) {
    const pct = total > 0 ? (counts[t] / total) * 100 : 0
    out[t] = Math.round(pct * 100) / 100
  }
  return out
}

function buildSessionAttribution(body) {
  if (!body || typeof body !== 'object') return null
  const fromNested =
    body.attribution && typeof body.attribution === 'object' && !Array.isArray(body.attribution)
      ? body.attribution
      : body
  const keys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'referrer',
    'landing_path',
  ]
  const out = {}
  for (const k of keys) {
    const v = fromNested[k]
    if (v != null && String(v).trim()) {
      out[k] = String(v).trim().slice(0, 500)
    }
  }
  return Object.keys(out).length ? out : null
}

function toProfilerPayload(scoresObj) {
  return {
    logical_pct: scoresObj.logical,
    creative_pct: scoresObj.creative,
    verbal_pct: scoresObj.verbal,
    social_pct: scoresObj.social,
    scientific_pct: scoresObj.scientific,
    practical_pct: scoresObj.practical,
  }
}

async function fetchCareersForAptitude(aptitudeType) {
  const pool = getPool()
  try {
    const { rows } = await pool.query(
      `SELECT id, title, aptitude_type FROM public.careers
       WHERE aptitude_type = $1 ORDER BY sort_order ASC`,
      [aptitudeType],
    )
    return { careers: rows }
  } catch (e) {
    return { careers: [], error: e instanceof Error ? e.message : String(e) }
  }
}

export async function completeSession(req, res) {
  try {
    const sessionId = String(req.params.sessionId || '')
    const pool = getPool()
    const sRes = await pool.query(
      `SELECT id, user_id, quiz_id, status, metadata_json FROM public.quiz_sessions WHERE id = $1 LIMIT 1`,
      [sessionId],
    )
    const session = sRes.rows[0]
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    const readable = await assertSessionReadable(session, req.user)
    if (!readable) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    if (session.status !== 'in_progress') {
      res.status(400).json({ error: 'Session is not active' })
      return
    }
    const prevMeta = parseSessionMetadata(session.metadata_json)
    const aRes = await pool.query(
      `SELECT aptitude_type, skipped FROM public.quiz_answers WHERE session_id = $1`,
      [sessionId],
    )
    const { counts, answered } = tallyAnswers(aRes.rows)
    const topAptitude = pickTopAptitude(counts)
    const scores = normalizeCountsToScores(counts, answered)
    const profilerScores = toProfilerPayload(scores)
    const u = await loadUser(session.user_id)
    const age = u.user ? computeAgeFromDob(u.user.date_of_birth, u.user.birth_year) : 10
    const aiResult = await getAptitudeProfile(profilerScores, age)
    let careersList = []
    if (Array.isArray(aiResult.careers) && aiResult.careers.length > 0) {
      careersList = aiResult.careers.map((c) =>
        typeof c === 'string' ? { title: c } : { title: String(c?.title ?? c) },
      )
    } else {
      const { careers, error: ce } = await fetchCareersForAptitude(topAptitude)
      if (ce) {
        res.status(500).json({ error: ce })
        return
      }
      careersList = careers.map((r) => ({
        id: r.id,
        title: r.title,
        aptitude_type: r.aptitude_type,
      }))
    }
    let adaptiveOut = null
    if (prevMeta.adaptive && typeof prevMeta.adaptive === 'object') {
      const { pending_question_id: _drop, ...rest } = prevMeta.adaptive
      adaptiveOut = Object.keys(rest).length ? rest : null
    }
    const metadataJson = {
      ...prevMeta,
      ...(adaptiveOut ? { adaptive: adaptiveOut } : {}),
      ai_provider: aiResult.ai_provider,
      profile: aiResult.profile,
      explanation: aiResult.explanation,
      top_strength: aiResult.top_strength,
    }
    if (!adaptiveOut) {
      delete metadataJson.adaptive
    }
    await pool.query(
      `UPDATE public.quiz_sessions SET
         status = 'completed',
         completed_at = now(),
         scores_json = $1::jsonb,
         top_aptitude = $2,
         metadata_json = $3::jsonb
       WHERE id = $4`,
      [JSON.stringify(scores), topAptitude, JSON.stringify(metadataJson), sessionId],
    )
    res.json({
      scores,
      top_aptitude: topAptitude,
      profile: aiResult.profile,
      careers: careersList,
      explanation: aiResult.explanation,
    })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

export async function getSession(req, res) {
  try {
    const sessionId = String(req.params.sessionId || '')
    const pool = getPool()
    const sRes = await pool.query(
      `SELECT id, quiz_id, user_id, started_at, completed_at, status, top_aptitude, scores_json, metadata_json
       FROM public.quiz_sessions WHERE id = $1 LIMIT 1`,
      [sessionId],
    )
    const session = sRes.rows[0]
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    const readable = await assertSessionReadable(session, req.user)
    if (!readable) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    res.json(session)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' })
  }
}

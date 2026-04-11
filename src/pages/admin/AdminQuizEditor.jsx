import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, getApiError } from '../../utils/api.js'

const APTITUDE_OPTIONS = [
  'logical',
  'creative',
  'verbal',
  'social',
  'scientific',
  'practical',
]

export function AdminQuizEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [meta, setMeta] = useState({
    title: '',
    slug: '',
    description: '',
    time_per_question_seconds: 60,
    default_difficulty: 0.5,
    is_published: false,
  })
  const [newQuestion, setNewQuestion] = useState('')
  const [optionDrafts, setOptionDrafts] = useState({})

  const load = useCallback(async () => {
    setLoadState('loading')
    setError('')
    try {
      const { data } = await api.get(`/admin/quizzes/${id}`)
      const q = data.quiz
      setQuiz(q)
      setMeta({
        title: q.title ?? '',
        slug: q.slug ?? '',
        description: q.description ?? '',
        time_per_question_seconds: q.time_per_question_seconds ?? 60,
        default_difficulty: q.default_difficulty ?? 0.5,
        is_published: Boolean(q.is_published),
      })
      setLoadState('ready')
    } catch (err) {
      setError(getApiError(err))
      setLoadState('error')
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  async function saveMeta(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { data } = await api.patch(`/admin/quizzes/${id}`, {
        title: meta.title.trim(),
        slug: meta.slug.trim() || undefined,
        description: meta.description,
        time_per_question_seconds: Number(meta.time_per_question_seconds),
        default_difficulty: Number(meta.default_difficulty),
        is_published: meta.is_published,
      })
      setQuiz(data.quiz)
      setMeta((m) => ({
        ...m,
        title: data.quiz.title,
        slug: data.quiz.slug,
        description: data.quiz.description ?? '',
        time_per_question_seconds: data.quiz.time_per_question_seconds,
        default_difficulty: data.quiz.default_difficulty,
        is_published: Boolean(data.quiz.is_published),
      }))
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  async function addQuestion(e) {
    e.preventDefault()
    if (!newQuestion.trim()) return
    setError('')
    try {
      await api.post(`/admin/quizzes/${id}/questions`, {
        body: newQuestion.trim(),
        order_index: (quiz?.questions?.length ?? 0) + 1,
      })
      setNewQuestion('')
      await load()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  async function deleteQuestion(questionId) {
    if (!confirm('Delete this question and all its options?')) return
    setError('')
    try {
      await api.delete(`/admin/quizzes/${id}/questions/${questionId}`)
      await load()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  function setDraft(qid, field, value) {
    setOptionDrafts((d) => ({
      ...d,
      [qid]: { ...d[qid], [field]: value },
    }))
  }

  async function addOption(questionId, e) {
    e.preventDefault()
    const draft = optionDrafts[questionId] || {}
    const label = String(draft.label || '').trim()
    const aptitude_type = draft.aptitude_type || 'logical'
    if (!label) return
    setError('')
    try {
      await api.post(
        `/admin/quizzes/${id}/questions/${questionId}/options`,
        { label, aptitude_type },
      )
      setOptionDrafts((d) => ({ ...d, [questionId]: { label: '', aptitude_type } }))
      await load()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  async function deleteOption(questionId, optionId) {
    if (!confirm('Delete this option?')) return
    setError('')
    try {
      await api.delete(
        `/admin/quizzes/${id}/questions/${questionId}/options/${optionId}`,
      )
      await load()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  async function deleteQuiz() {
    if (!confirm('Delete entire quiz? This cannot be undone.')) return
    setError('')
    try {
      await api.delete(`/admin/quizzes/${id}`)
      navigate('/admin/quizzes')
    } catch (err) {
      setError(getApiError(err))
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="px-4 py-10 text-center text-slate-600">Loading…</div>
    )
  }
  if (loadState === 'error' || !quiz) {
    return (
      <div className="px-4 py-10">
        <p className="text-rose-700">{error || 'Not found'}</p>
        <Link to="/admin/quizzes" className="mt-4 inline-block text-sky-600">
          Back to quizzes
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/admin/quizzes"
          className="text-sm font-semibold text-sky-600 hover:underline"
        >
          ← All quizzes
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold text-slate-900">Edit quiz</h1>
        <p className="font-mono text-xs text-slate-500">{quiz.id}</p>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => void saveMeta(e)}
          className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="text-xs font-bold text-slate-500">Title</label>
            <input
              value={meta.title}
              onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">Slug</label>
            <input
              value={meta.slug}
              onChange={(e) => setMeta((m) => ({ ...m, slug: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">Description</label>
            <textarea
              value={meta.description}
              onChange={(e) =>
                setMeta((m) => ({ ...m, description: e.target.value }))
              }
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-500">
                Seconds per question
              </label>
              <input
                type="number"
                min={5}
                value={meta.time_per_question_seconds}
                onChange={(e) =>
                  setMeta((m) => ({
                    ...m,
                    time_per_question_seconds: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500">
                Default difficulty (0–1)
              </label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={1}
                value={meta.default_difficulty}
                onChange={(e) =>
                  setMeta((m) => ({ ...m, default_difficulty: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={meta.is_published}
              onChange={(e) =>
                setMeta((m) => ({ ...m, is_published: e.target.checked }))
              }
            />
            Published (requires every question to have at least one option)
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-cyan-300 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save quiz settings'}
            </button>
            <button
              type="button"
              onClick={() => void deleteQuiz()}
              className="rounded-xl border border-rose-300 bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-800"
            >
              Delete quiz
            </button>
          </div>
        </form>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">Questions</h2>
          <div className="mt-4 space-y-6">
            {(quiz.questions ?? []).map((q, idx) => (
              <div
                key={q.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-xs font-bold text-slate-400">Q{idx + 1}</p>
                  <button
                    type="button"
                    onClick={() => void deleteQuestion(q.id)}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Delete question
                  </button>
                </div>
                <p className="mt-2 font-medium text-slate-900">{q.body}</p>
                <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  {(q.options ?? []).map((o) => (
                    <li
                      key={o.id}
                      className="flex flex-wrap items-center justify-between gap-2 text-sm"
                    >
                      <span>
                        <span className="font-medium text-slate-800">{o.label}</span>
                        <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-600">
                          {o.aptitude_type}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => void deleteOption(q.id, o.id)}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <form
                  onSubmit={(e) => void addOption(q.id, e)}
                  className="mt-4 flex flex-wrap items-end gap-2 border-t border-dashed border-slate-200 pt-4"
                >
                  <input
                    placeholder="New option label"
                    value={optionDrafts[q.id]?.label ?? ''}
                    onChange={(e) => setDraft(q.id, 'label', e.target.value)}
                    className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <select
                    value={optionDrafts[q.id]?.aptitude_type ?? 'logical'}
                    onChange={(e) =>
                      setDraft(q.id, 'aptitude_type', e.target.value)
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm capitalize"
                  >
                    {APTITUDE_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-bold text-cyan-200"
                  >
                    Add option
                  </button>
                </form>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => void addQuestion(e)}
            className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"
          >
            <label className="text-xs font-bold text-slate-500">
              Add question
            </label>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Question text for the child…"
            />
            <button
              type="submit"
              className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-cyan-300"
            >
              Add question
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

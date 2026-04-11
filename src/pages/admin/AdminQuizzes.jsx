import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, getApiError } from '../../utils/api.js'

function formatWhen(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

export function AdminQuizzes() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loadState, setLoadState] = useState('loading')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const load = useCallback(async () => {
    setLoadState('loading')
    setError('')
    try {
      const { data } = await api.get('/admin/quizzes')
      setRows(Array.isArray(data) ? data : [])
      setLoadState('ready')
    } catch (err) {
      setError(getApiError(err))
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleCreate(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    setError('')
    try {
      const { data } = await api.post('/admin/quizzes', { title: newTitle.trim() })
      setNewTitle('')
      await load()
      navigate(`/admin/quizzes/${data.quiz.id}`)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-extrabold text-slate-900">Quizzes</h1>
        <p className="mt-1 text-slate-600">
          Create quizzes, add questions and options, then publish when ready.
        </p>

        <form
          onSubmit={(e) => void handleCreate(e)}
          className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="min-w-[200px] flex-1">
            <label htmlFor="newQuizTitle" className="text-xs font-bold text-slate-500">
              New quiz title
            </label>
            <input
              id="newQuizTitle"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="e.g. Spring strengths check-in"
            />
          </div>
          <button
            type="submit"
            disabled={creating || !newTitle.trim()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-cyan-300 disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Create draft'}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        {loadState === 'loading' && (
          <p className="mt-8 text-center text-slate-600">Loading…</p>
        )}

        {loadState === 'ready' && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-700">Title</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Slug</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Questions</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Published</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No quizzes yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((q) => (
                    <tr key={q.id} className="border-b border-slate-100">
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/quizzes/${q.id}`}
                          className="font-medium text-sky-700 hover:underline"
                        >
                          {q.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {q.slug}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {q.question_count ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        {q.is_published ? (
                          <span className="text-emerald-700 font-semibold">Yes</span>
                        ) : (
                          <span className="text-slate-400">Draft</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatWhen(q.updated_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getApiError } from '../../utils/api.js'

function formatWhen(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

export function AdminSessions() {
  const [sessions, setSessions] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState('')
  const [loadState, setLoadState] = useState('loading')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoadState('loading')
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: '30' })
      if (status) params.set('status', status)
      const { data } = await api.get(`/admin/sessions?${params}`)
      setSessions(data.sessions ?? [])
      setTotalPages(data.totalPages ?? 1)
      setLoadState('ready')
    } catch (err) {
      setError(getApiError(err))
      setLoadState('error')
    }
  }, [page, status])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async list fetch
    void load()
  }, [load])

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-extrabold text-slate-900">Sessions</h1>
        <p className="mt-1 text-slate-600">
          All quiz attempts with scores and AI provider used at completion.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In progress</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>

        {loadState === 'loading' && (
          <p className="mt-8 text-center text-slate-600">Loading…</p>
        )}
        {loadState === 'error' && (
          <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
            {error}
          </div>
        )}

        {loadState === 'ready' && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-700">Started</th>
                  <th className="px-4 py-3 font-bold text-slate-700">User</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Quiz</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Status</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Top</th>
                  <th className="px-4 py-3 font-bold text-slate-700">AI</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No sessions.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 text-slate-700">
                        <Link
                          to={`/admin/sessions/${s.id}`}
                          className="font-medium text-sky-700 hover:underline"
                        >
                          {formatWhen(s.started_at)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{s.user_name}</span>
                        <span className="block text-xs text-slate-500">
                          {s.user_email}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-800">{s.quiz_title}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold uppercase text-slate-700">
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        {s.top_aptitude ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {s.ai_provider ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="py-1 text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

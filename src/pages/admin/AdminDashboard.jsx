import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getApiError } from '../../utils/api.js'

function formatWhen(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

export function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadState('loading')
      setError('')
      try {
        const { data: body } = await api.get('/admin/summary')
        if (cancelled) return
        setData(body)
        setLoadState('ready')
      } catch (err) {
        if (cancelled) return
        setError(getApiError(err))
        setLoadState('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function reload() {
    setLoadState('loading')
    setError('')
    try {
      const { data: body } = await api.get('/admin/summary')
      setData(body)
      setLoadState('ready')
    } catch (err) {
      setError(getApiError(err))
      setLoadState('error')
    }
  }

  return (
    <div className="min-h-full bg-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
              Platform overview
            </h1>
            <p className="mt-1 text-slate-600">
              Users and completed quiz sessions across the database.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void reload()}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-cyan-300 transition hover:bg-slate-800"
            >
              Refresh
            </button>
            <Link
              to="/parent/dashboard"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
            >
              Parent dashboard
            </Link>
          </div>
        </div>

        {loadState === 'loading' && (
          <p className="mt-10 text-center font-medium text-slate-600">Loading…</p>
        )}

        {loadState === 'error' && (
          <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-6">
            <p className="font-semibold text-rose-900">{error}</p>
          </div>
        )}

        {loadState === 'ready' && data && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Total users', data.stats.totalUsers],
                ['Parents', data.stats.parentCount],
                ['Children', data.stats.childCount],
                ['Completed quizzes', data.stats.completedSessions],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-semibold text-slate-500">{label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <section className="mt-10">
              <h2 className="text-lg font-bold text-slate-900">
                Recent completed sessions
              </h2>
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-700">When</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Child</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Quiz</th>
                      <th className="px-4 py-3 font-bold text-slate-700">
                        Top aptitude
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.recentSessions ?? []).length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-center text-slate-500"
                        >
                          No completed sessions yet.
                        </td>
                      </tr>
                    ) : (
                      data.recentSessions.map((s) => (
                        <tr
                          key={s.session_id}
                          className="border-b border-slate-100"
                        >
                          <td className="px-4 py-3 text-slate-800">
                            {formatWhen(s.completed_at)}
                          </td>
                          <td className="px-4 py-3 text-slate-800">
                            <span className="font-medium">{s.child_name}</span>
                            <span className="mt-0.5 block break-all text-xs text-slate-500">
                              {s.child_email}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-800">
                            {s.quiz_title}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {s.top_aptitude ?? '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-lg font-bold text-slate-900">Recent users</h2>
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-700">Created</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Name</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Email</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.recentUsers ?? []).map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-slate-100"
                      >
                        <td className="px-4 py-3 text-slate-600">
                          {formatWhen(u.created_at)}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {u.full_name}
                        </td>
                        <td className="break-all px-4 py-3 text-slate-700">
                          {u.email}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold uppercase text-slate-800">
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

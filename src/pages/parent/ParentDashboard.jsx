import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context'
import { api, getApiError } from '../../utils/api.js'
import {
  ageFromBirthYear,
  ageFromDateOfBirth,
  labelForAptitudeKey,
} from '../../lib/aptitudeLabels.js'

function formatQuizDate(isoDate) {
  if (!isoDate) return '—'
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    parsed,
  )
}

export function ParentDashboard() {
  const { user, token } = useAuth()
  const [rows, setRows] = useState([])
  const [loadState, setLoadState] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id || !token) return
    let cancelled = false

    async function fetchDashboard() {
      setLoadState('loading')
      setError('')
      try {
        const [childrenRes, analyticsRes] = await Promise.all([
          api.get('/auth/children'),
          api.get('/analytics/children'),
        ])
        if (cancelled) return
        const byA = new Map(
          (analyticsRes.data ?? []).map((x) => [x.child_id, x]),
        )
        const merged = (childrenRes.data ?? []).map((c) => ({
          id: c.id,
          fullName: c.full_name,
          birthYear: c.birth_year,
          dateOfBirth: c.date_of_birth,
          signInEmail: c.email,
          ...byA.get(c.id),
        }))
        setRows(merged)
        setLoadState('ready')
      } catch (err) {
        if (cancelled) return
        setError(getApiError(err))
        setLoadState('error')
      }
    }

    void fetchDashboard()
    return () => {
      cancelled = true
    }
  }, [user?.id, token])

  async function retry() {
    if (!user?.id || !token) return
    setLoadState('loading')
    setError('')
    try {
      const [childrenRes, analyticsRes] = await Promise.all([
        api.get('/auth/children'),
        api.get('/analytics/children'),
      ])
      const byA = new Map(
        (analyticsRes.data ?? []).map((x) => [x.child_id, x]),
      )
      const merged = (childrenRes.data ?? []).map((c) => ({
        id: c.id,
        fullName: c.full_name,
        birthYear: c.birth_year,
        dateOfBirth: c.date_of_birth,
        signInEmail: c.email,
        ...byA.get(c.id),
      }))
      setRows(merged)
      setLoadState('ready')
    } catch (err) {
      setError(getApiError(err))
      setLoadState('error')
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-100 via-white to-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 border-b border-slate-200 pb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">
            Parent overview
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Children &amp; progress
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            Data loads from your database through the API. Open a child for
            charts and session history.
          </p>
        </header>

        {loadState === 'loading' && (
          <p className="rounded-xl border border-slate-200 bg-white px-6 py-8 text-center font-medium text-slate-600 shadow-sm">
            Loading…
          </p>
        )}

        {loadState === 'error' && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-6 shadow-sm">
            <p className="font-semibold text-rose-900">{error}</p>
            <button
              type="button"
              onClick={() => void retry()}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-cyan-300 transition hover:bg-slate-800"
            >
              Retry
            </button>
          </div>
        )}

        {loadState === 'ready' && rows.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-bold text-slate-900">No children yet</p>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Add a child to create their account. You will get a sign-in email
              and initial password to share with them.
            </p>
            <Link
              to="/parent/add-child"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-cyan-300 shadow-md transition hover:bg-slate-800"
            >
              Add your first child
            </Link>
          </div>
        )}

        {loadState === 'ready' && rows.length > 0 && (
          <ul className="flex flex-col gap-8">
            {rows.map((child) => {
              const age =
                ageFromDateOfBirth(child.dateOfBirth) ??
                ageFromBirthYear(child.birthYear)
              const sessions = child.total_sessions ?? 0
              const profileLabel =
                typeof child.latest_profile === 'string'
                  ? child.latest_profile
                  : labelForAptitudeKey(child.latest_profile)
              return (
                <li
                  key={child.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/60"
                >
                  <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5 sm:px-8">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {child.fullName}
                      </h2>
                      {age != null && (
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-300">
                          Age {age}
                        </span>
                      )}
                      <span className="text-sm font-medium text-slate-500">
                        {sessions} quiz{sessions === 1 ? '' : 'es'} completed
                      </span>
                    </div>
                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Latest profile
                      </p>
                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {sessions > 0 ? profileLabel : '—'}
                      </p>
                      {sessions > 0 && (
                        <p className="mt-1 text-sm text-slate-600">
                          Last active: {formatQuizDate(child.last_active)}
                        </p>
                      )}
                    </div>
                    {sessions === 0 && (
                      <p className="mt-3 text-sm text-slate-600">
                        No quizzes taken yet. Have them sign in with their child
                        email and pick a quiz.
                      </p>
                    )}
                  </div>

                  <div className="px-6 py-5 sm:px-8">
                    <Link
                      to={`/parent/child/${child.id}`}
                      className="inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-cyan-300 transition hover:bg-slate-800"
                    >
                      View full report
                    </Link>
                    {child.signInEmail && (
                      <p className="mt-3 break-all text-xs text-slate-500">
                        Child sign-in:{' '}
                        <span className="font-mono text-slate-700">
                          {child.signInEmail}
                        </span>
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {loadState === 'ready' && (
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/parent/add-child"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-cyan-300 shadow transition hover:bg-slate-800"
            >
              Add another child
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

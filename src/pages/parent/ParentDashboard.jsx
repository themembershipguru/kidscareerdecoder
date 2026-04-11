import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context'
import { apiFetch } from '../../lib/api.js'
import { ageFromBirthYear, labelForAptitudeKey } from '../../lib/aptitudeLabels.js'

function formatQuizDate(isoDate) {
  if (!isoDate) return '—'
  const parsed = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return isoDate
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    parsed,
  )
}

export function ParentDashboard() {
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [loadState, setLoadState] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const parentId = user?.id
    if (!parentId) return

    let cancelled = false

    ;(async () => {
      await Promise.resolve()
      if (cancelled) return
      setLoadState('loading')
      setError('')
      try {
        const data = await apiFetch(
          `/api/parent/dashboard?parentUserId=${encodeURIComponent(parentId)}`,
        )
        if (cancelled) return
        setChildren(Array.isArray(data.children) ? data.children : [])
        setLoadState('ready')
      } catch (err) {
        if (cancelled) return
        setError(
          err instanceof Error ? err.message : 'Could not load dashboard data.',
        )
        setLoadState('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  async function retry() {
    const parentId = user?.id
    if (!parentId) return
    await Promise.resolve()
    setLoadState('loading')
    setError('')
    try {
      const data = await apiFetch(
        `/api/parent/dashboard?parentUserId=${encodeURIComponent(parentId)}`,
      )
      setChildren(Array.isArray(data.children) ? data.children : [])
      setLoadState('ready')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load dashboard data.',
      )
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
            Every row below comes from your database: children you added and
            quiz sessions they completed while signed in as that child.
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
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-cyan-300 hover:bg-slate-800"
            >
              Retry
            </button>
          </div>
        )}

        {loadState === 'ready' && children.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-bold text-slate-900">No children yet</p>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Add a child to create their account. You&apos;ll get a sign-in
              email to use on the login page so quiz results save to their
              profile.
            </p>
            <Link
              to="/parent/add-child"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-cyan-300 shadow-md transition hover:bg-slate-800"
            >
              Add your first child
            </Link>
          </div>
        )}

        {loadState === 'ready' && children.length > 0 && (
          <ul className="flex flex-col gap-8">
            {children.map((child) => {
              const age = ageFromBirthYear(child.birthYear)
              const topLabel = labelForAptitudeKey(child.topAptitudeKey)
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
                        {child.quizzesCompleted} quiz
                        {child.quizzesCompleted === 1 ? '' : 'es'} completed
                      </span>
                    </div>
                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Strongest signal (latest quiz)
                      </p>
                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {child.quizzesCompleted > 0 ? topLabel : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-5 sm:px-8">
                    <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      Recent sessions
                    </h3>
                    {child.recentSessions.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-600">
                        No completed quizzes yet. Have them sign in with their
                        child email and take the quiz.
                      </p>
                    ) : (
                      <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
                        {child.recentSessions.map((s) => (
                          <li
                            key={s.sessionId}
                            className="flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <span className="text-sm font-semibold text-slate-900">
                              {formatQuizDate(s.completedAt)}
                            </span>
                            <span className="text-sm text-slate-600">
                              Top profile:{' '}
                              <span className="font-bold text-slate-900">
                                {labelForAptitudeKey(s.topAptitudeKey)}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
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

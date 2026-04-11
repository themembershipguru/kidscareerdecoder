import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context'
import { apiPost } from '../../lib/api.js'

export function AddChild() {
  const { user, token } = useAuth()
  const [fullName, setFullName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState(null)

  if (!token || !user || user.role !== 'parent') {
    return <Navigate to="/login" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    if (!fullName.trim()) {
      setFormError('Please enter the child’s name.')
      return
    }
    setSubmitting(true)
    try {
      const row = await apiPost('/api/parent/children', {
        parentUserId: user.id,
        fullName: fullName.trim(),
        birthYear: birthYear.trim() || null,
      })
      setCreated(row)
      setFullName('')
      setBirthYear('')
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Could not create child account.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-100 to-white px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-lg">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">
          Family
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
          Add a child
        </h1>
        <p className="mt-2 text-slate-600">
          We create a real account in your database. Use the sign-in email on
          the login page so quiz results link to this child.
        </p>

        {created && (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
            <p className="font-bold text-emerald-900">
              {created.fullName} is ready
            </p>
            <p className="mt-2 text-sm text-emerald-800">
              <span className="font-semibold">Sign-in email</span> (copy exactly
              into the login form):
            </p>
            <p className="mt-2 break-all rounded-lg bg-white px-3 py-2 font-mono text-sm font-medium text-slate-900">
              {created.signInEmail}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/parent/dashboard"
                className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-cyan-300 hover:bg-slate-800"
              >
                Back to dashboard
              </Link>
              <button
                type="button"
                onClick={() => setCreated(null)}
                className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Add another child
              </button>
            </div>
          </div>
        )}

        {!created && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-md sm:p-8"
          >
            <div>
              <label
                htmlFor="childName"
                className="block text-sm font-bold text-slate-900"
              >
                Child’s name
              </label>
              <input
                id="childName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/25"
                placeholder="Sam Rivera"
              />
            </div>
            <div>
              <label
                htmlFor="birthYear"
                className="block text-sm font-bold text-slate-900"
              >
                Birth year <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <input
                id="birthYear"
                name="birthYear"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/25"
                placeholder="2016"
              />
            </div>
            {formError && (
              <p className="text-sm font-medium text-rose-600" role="alert">
                {formError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-cyan-300 hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create child account'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-slate-600">
          <Link
            to="/parent/dashboard"
            className="font-semibold text-cyan-700 underline-offset-2 hover:underline"
          >
            ← Dashboard
          </Link>
        </p>
      </div>
    </div>
  )
}

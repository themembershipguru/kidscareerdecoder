import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context'
import { api, getApiError } from '../../utils/api.js'

export function AddChild() {
  const { user, token } = useAuth()
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
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
    if (!dateOfBirth) {
      setFormError('Please enter their date of birth.')
      return
    }
    const dob = new Date(dateOfBirth)
    if (Number.isNaN(dob.getTime())) {
      setFormError('Please enter a valid date of birth.')
      return
    }
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1
    if (age < 3 || age > 14) {
      setFormError('Child must be between 3 and 14 years old.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/auth/add-child', {
        full_name: fullName.trim(),
        date_of_birth: dateOfBirth,
      })
      setCreated(data)
      setFullName('')
      setDateOfBirth('')
    } catch (err) {
      setFormError(getApiError(err))
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
          We save a child profile in your database. Copy the sign-in email and
          initial password for your child to use on the login page.
        </p>

        {created && (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
            <p className="font-bold text-emerald-900">
              {created.full_name} is ready
            </p>
            <p className="mt-2 text-sm text-emerald-800">
              <span className="font-semibold">Sign-in email</span>
            </p>
            <p className="mt-2 break-all rounded-lg bg-white px-3 py-2 font-mono text-sm font-medium text-slate-900">
              {created.email}
            </p>
            <p className="mt-4 text-sm text-emerald-800">
              <span className="font-semibold">Initial password</span> (save it
              somewhere safe; it is not shown again)
            </p>
            <p className="mt-2 break-all rounded-lg bg-white px-3 py-2 font-mono text-sm font-medium text-slate-900">
              {created.initialPassword}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/parent/dashboard"
                className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-cyan-300 transition hover:bg-slate-800"
              >
                Back to dashboard
              </Link>
              <button
                type="button"
                onClick={() => setCreated(null)}
                className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
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
                htmlFor="dob"
                className="block text-sm font-bold text-slate-900"
              >
                Date of birth
              </label>
              <input
                id="dob"
                name="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/25"
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
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-cyan-300 transition hover:bg-slate-800 disabled:opacity-60"
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

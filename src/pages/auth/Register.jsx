import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context'
import { apiPost } from '../../lib/api.js'
import { stableParentId } from '../../lib/userIds.js'

function makeMockToken() {
  return `mock.${globalThis.crypto?.randomUUID?.() ?? Date.now()}`
}

export function Register() {
  const { login, user, token } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user && token) {
    return <Navigate to="/parent/dashboard" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    if (!fullName.trim()) {
      setFormError('Please enter your name.')
      return
    }
    if (!email.trim()) {
      setFormError('Please enter your email.')
      return
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const id = await stableParentId(email)
      await apiPost('/api/users/sync', {
        id,
        email: email.trim(),
        fullName: fullName.trim(),
        role: 'parent',
        parentUserId: null,
      })
      login(
        {
          id,
          name: fullName.trim(),
          role: 'parent',
          parentId: null,
        },
        makeMockToken(),
      )
      navigate('/parent/dashboard', { replace: true })
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Could not reach the server. Check your connection and try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-[#1A1A2E]/10 bg-white p-8 shadow-lg shadow-[#1A1A2E]/5">
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
          Create account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#1A1A2E]/65">
          Parents sign up here to add children and review quiz progress stored in
          your database.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="registerName"
              className="block text-sm font-semibold text-[#1A1A2E]"
            >
              Full name
            </label>
            <input
              id="registerName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#1A1A2E]/15 bg-slate-50 px-3 py-2.5 text-[#1A1A2E] outline-none ring-[#00D4FF]/0 transition focus:border-[#00D4FF]/50 focus:ring-2 focus:ring-[#00D4FF]/25"
              placeholder="Taylor Morgan"
            />
          </div>
          <div>
            <label
              htmlFor="registerEmail"
              className="block text-sm font-semibold text-[#1A1A2E]"
            >
              Email
            </label>
            <input
              id="registerEmail"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#1A1A2E]/15 bg-slate-50 px-3 py-2.5 text-[#1A1A2E] outline-none ring-[#00D4FF]/0 transition focus:border-[#00D4FF]/50 focus:ring-2 focus:ring-[#00D4FF]/25"
              placeholder="parent@family.com"
            />
          </div>
          <div>
            <label
              htmlFor="registerPassword"
              className="block text-sm font-semibold text-[#1A1A2E]"
            >
              Password
            </label>
            <input
              id="registerPassword"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#1A1A2E]/15 bg-slate-50 px-3 py-2.5 text-[#1A1A2E] outline-none ring-[#00D4FF]/0 transition focus:border-[#00D4FF]/50 focus:ring-2 focus:ring-[#00D4FF]/25"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label
              htmlFor="registerConfirm"
              className="block text-sm font-semibold text-[#1A1A2E]"
            >
              Confirm password
            </label>
            <input
              id="registerConfirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#1A1A2E]/15 bg-slate-50 px-3 py-2.5 text-[#1A1A2E] outline-none ring-[#00D4FF]/0 transition focus:border-[#00D4FF]/50 focus:ring-2 focus:ring-[#00D4FF]/25"
              placeholder="Repeat password"
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
            className="w-full rounded-lg bg-[#1A1A2E] py-3 text-sm font-bold text-[#00D4FF] transition hover:bg-[#252542] disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Create account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#1A1A2E]/65">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#00D4FF] underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

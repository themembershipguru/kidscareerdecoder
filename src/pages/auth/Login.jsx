import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context'
import { apiFetch } from '../../lib/api.js'

function makeMockToken() {
  return `mock.${globalThis.crypto?.randomUUID?.() ?? Date.now()}`
}

export function Login() {
  const { login, user, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user && token) {
    return (
      <Navigate
        to={user.role === 'child' ? '/child/quiz' : '/parent/dashboard'}
        replace
      />
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    if (!email.trim()) {
      setFormError('Please enter your email.')
      return
    }
    if (!password) {
      setFormError('Please enter your password.')
      return
    }
    setSubmitting(true)
    try {
      const row = await apiFetch(
        `/api/users/by-email?email=${encodeURIComponent(email.trim())}`,
      )
      login(
        {
          id: row.id,
          name: row.fullName,
          role: row.role,
          parentId: row.parentUserId ?? null,
        },
        makeMockToken(),
      )
      const fromPath = location.state?.from?.pathname
      if (
        fromPath &&
        fromPath !== '/login' &&
        fromPath !== '/register'
      ) {
        navigate(fromPath, { replace: true })
        return
      }
      navigate(
        row.role === 'child' ? '/child/quiz' : '/parent/dashboard',
        { replace: true },
      )
    } catch {
      setFormError(
        'No account found for that email. Register as a parent, or use the child sign-in email shown on the parent dashboard after adding a child.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-[#1A1A2E]/10 bg-white p-8 shadow-lg shadow-[#1A1A2E]/5">
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#1A1A2E]/65">
          Sign in with the email you used to register, or the unique child
          sign-in email from your parent dashboard. Password is not verified
          yet—use any value until secure login is enabled.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="loginEmail"
              className="block text-sm font-semibold text-[#1A1A2E]"
            >
              Email
            </label>
            <input
              id="loginEmail"
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
              htmlFor="loginPassword"
              className="block text-sm font-semibold text-[#1A1A2E]"
            >
              Password
            </label>
            <input
              id="loginPassword"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#1A1A2E]/15 bg-slate-50 px-3 py-2.5 text-[#1A1A2E] outline-none ring-[#00D4FF]/0 transition focus:border-[#00D4FF]/50 focus:ring-2 focus:ring-[#00D4FF]/25"
              placeholder="••••••••"
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
            {submitting ? 'Signing in…' : 'Continue'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#1A1A2E]/65">
          New to KidsCareerDecoder?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#00D4FF] underline-offset-2 hover:underline"
          >
            Create a parent account
          </Link>
        </p>
      </div>
    </div>
  )
}

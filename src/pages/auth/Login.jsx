import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { DEMO_ACCOUNTS, isDemoLoginEnabled } from '../../config/demoLogins.js'
import { useAuth } from '../../context'
import { api, getApiError } from '../../utils/api.js'

export function Login() {
  const { login, user, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user && token) {
    const home =
      user.role === 'child'
        ? '/child/quiz'
        : user.role === 'admin'
          ? '/admin'
          : '/parent/dashboard'
    return <Navigate to={home} replace />
  }

  const completeLogin = async (loginEmail, loginPassword) => {
    const { data } = await api.post('/auth/login', {
      email: loginEmail.trim(),
      password: loginPassword,
    })
    login(
      {
        id: data.user.id,
        full_name: data.user.full_name,
        name: data.user.full_name,
        role: data.user.role,
        email: data.user.email,
      },
      data.token,
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
    const home =
      data.user.role === 'child'
        ? '/child/quiz'
        : data.user.role === 'admin'
          ? '/admin'
          : '/parent/dashboard'
    navigate(home, { replace: true })
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
      await completeLogin(email, password)
    } catch (err) {
      setFormError(getApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const fillDemo = (account) => {
    setEmail(account.email)
    setPassword(account.password)
    setFormError('')
  }

  const signInDemo = async (account) => {
    setFormError('')
    setEmail(account.email)
    setPassword(account.password)
    setSubmitting(true)
    try {
      await completeLogin(account.email, account.password)
    } catch (err) {
      setFormError(getApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const showDemo = isDemoLoginEnabled()

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-[#1A1A2E]/10 bg-white p-8 shadow-lg shadow-[#1A1A2E]/5">
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#1A1A2E]/65">
          Parents use the email and password from registration. Children use
          the sign-in email from the parent dashboard and the initial password
          shown when the parent added them.
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
            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-[#00D4FF] underline-offset-2 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
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

        {showDemo && (
          <div
            className="mt-8 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4"
            data-demo-login-panel
          >
            <p className="text-xs font-bold uppercase tracking-wide text-amber-900">
              Reviewer quick sign-in
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-900/75">
              For project evaluation only. One-click login — remove after
              approval (unset <code className="text-[10px]">VITE_ENABLE_DEMO_LOGIN</code>{' '}
              and rebuild).
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {DEMO_ACCOUNTS.map((account) => (
                <div
                  key={account.id}
                  className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg border border-amber-200/60 bg-white/80 p-2.5"
                >
                  <div>
                    <span className="text-sm font-bold text-[#1A1A2E]">
                      {account.label}
                    </span>
                    {account.name && (
                      <span className="ml-1.5 text-xs font-medium text-[#1A1A2E]/70">
                        {account.name}
                      </span>
                    )}
                    <p className="text-xs text-[#1A1A2E]/55">{account.hint}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => fillDemo(account)}
                      disabled={submitting}
                      className="rounded-md border border-[#1A1A2E]/15 px-2 py-1 text-xs font-semibold text-[#1A1A2E]/80 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Fill
                    </button>
                    <button
                      type="button"
                      onClick={() => signInDemo(account)}
                      disabled={submitting}
                      className="rounded-md bg-amber-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                      Sign in
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

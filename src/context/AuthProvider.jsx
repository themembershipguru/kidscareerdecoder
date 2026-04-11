import { useMemo, useState } from 'react'
import { AuthContext } from './auth-context.js'

const storageTokenKey = 'kidsCareerDecoderAuthToken'
const storageUserKey = 'kidsCareerDecoderAuthUser'

function readStoredAuth() {
  try {
    const token = localStorage.getItem(storageTokenKey)
    const raw = localStorage.getItem(storageUserKey)
    if (!raw) return { user: null, token: null }
    const user = JSON.parse(raw)
    if (!token || !user || typeof user !== 'object') {
      return { user: null, token: null }
    }
    return { user, token }
  } catch {
    return { user: null, token: null }
  }
}

function normalizeUser(u) {
  if (!u) return u
  const fullName = u.full_name ?? u.name ?? ''
  return {
    ...u,
    full_name: fullName,
    name: fullName,
  }
}

export function AuthProvider({ children }) {
  const initial = readStoredAuth()
  const [user, setUser] = useState(() => normalizeUser(initial.user))
  const [token, setToken] = useState(initial.token)

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login(nextUser, nextToken) {
        const normalized = normalizeUser(nextUser)
        localStorage.setItem(storageTokenKey, nextToken)
        localStorage.setItem(storageUserKey, JSON.stringify(normalized))
        setUser(normalized)
        setToken(nextToken)
      },
      logout() {
        localStorage.removeItem(storageTokenKey)
        localStorage.removeItem(storageUserKey)
        setUser(null)
        setToken(null)
      },
    }),
    [user, token],
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

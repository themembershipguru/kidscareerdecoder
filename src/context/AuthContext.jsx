import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

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

export function AuthProvider({ children }) {
  const initial = readStoredAuth()
  const [user, setUser] = useState(initial.user)
  const [token, setToken] = useState(initial.token)

  const value = useMemo(
    () => ({
      user,
      token,
      login(nextUser, nextToken) {
        localStorage.setItem(storageTokenKey, nextToken)
        localStorage.setItem(storageUserKey, JSON.stringify(nextUser))
        setUser(nextUser)
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

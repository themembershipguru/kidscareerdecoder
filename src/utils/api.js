import axios from 'axios'

const storageTokenKey = 'kidsCareerDecoderAuthToken'

function resolveBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return '/api'
}

export const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(storageTokenKey)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(storageTokenKey)
      localStorage.removeItem('kidsCareerDecoderAuthUser')
      const path = window.location?.pathname ?? ''
      if (!path.startsWith('/login') && !path.startsWith('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  },
)

export function getApiError(err) {
  const d = err?.response?.data
  if (typeof d?.error === 'string') return d.error
  if (typeof d?.message === 'string') return d.message
  if (err?.message) return err.message
  return 'Something went wrong. Please try again.'
}

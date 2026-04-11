const API_ORIGIN = import.meta.env.VITE_API_URL ?? ''

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  if (API_ORIGIN) {
    return `${API_ORIGIN.replace(/\/$/, '')}${p}`
  }
  return p
}

export async function apiFetch(path, init = {}) {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function apiPost(path, body) {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `${res.status} ${res.statusText}`)
  }
  return res.json()
}

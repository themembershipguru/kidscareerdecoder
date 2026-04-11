const STORAGE_KEY = 'kcd_utm'

/**
 * Persist first-touch UTM params from the current URL into sessionStorage.
 */
export function captureAttributionToStorage() {
  if (typeof window === 'undefined') return
  const p = new URLSearchParams(window.location.search)
  const utmKeys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
  ]
  const o = {}
  for (const k of utmKeys) {
    const v = p.get(k)
    if (v) o[k] = v.slice(0, 500)
  }
  if (!Object.keys(o).length) return
  try {
    const prev = sessionStorage.getItem(STORAGE_KEY)
    const merged = { ...(prev ? JSON.parse(prev) : {}), ...o }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch {
    /* ignore quota / private mode */
  }
}

export function readStoredAttribution() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/** Payload for register / session start: stored UTMs + referrer + current path. */
export function buildAttributionPayload() {
  const stored = readStoredAttribution()
  const out = { ...stored }
  if (typeof document !== 'undefined' && document.referrer) {
    out.referrer = document.referrer.slice(0, 500)
  }
  if (typeof window !== 'undefined') {
    out.landing_path = `${window.location.pathname}${window.location.search}`.slice(
      0,
      500,
    )
  }
  return Object.keys(out).length ? out : undefined
}

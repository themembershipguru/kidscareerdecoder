import axios from 'axios'

function stripV4Mapped(ip) {
  if (!ip) return ''
  return String(ip).replace(/^::ffff:/i, '')
}

function isNonPublicIp(ip) {
  const x = stripV4Mapped(ip)
  if (!x) return true
  if (x === '127.0.0.1' || x === '::1') return true
  if (x.startsWith('10.')) return true
  if (x.startsWith('192.168.')) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(x)) return true
  return false
}

export function getClientIpFromRequest(req) {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.trim()) {
    return stripV4Mapped(xff.split(',')[0].trim())
  }
  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string' && realIp.trim()) {
    return stripV4Mapped(realIp.trim())
  }
  if (req.ip) return stripV4Mapped(req.ip)
  if (req.socket?.remoteAddress) return stripV4Mapped(req.socket.remoteAddress)
  return ''
}

function countryNameFromIso2(code) {
  const c = String(code).toUpperCase()
  if (c === 'US') return 'United States'
  if (c === 'IN') return 'India'
  try {
    const name = new Intl.DisplayNames(['en'], { type: 'region' }).of(c)
    return (name || c).slice(0, 80)
  } catch {
    return c.slice(0, 80)
  }
}

export async function fetchCountryFromIpinfo(clientIp) {
  const token = process.env.IPINFO_TOKEN?.trim()
  if (!token || !clientIp || isNonPublicIp(clientIp)) return null
  try {
    const { data, status } = await axios.get(
      `https://ipinfo.io/${encodeURIComponent(clientIp)}/json`,
      { params: { token }, timeout: 5000, validateStatus: () => true },
    )
    if (status !== 200 || !data?.country) return null
    return countryNameFromIso2(data.country)
  } catch {
    return null
  }
}

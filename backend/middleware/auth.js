import jwt from 'jsonwebtoken'

export function verifyToken(req, res, next) {
  const header = req.headers.authorization
  const token =
    header && header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      res.status(500).json({ error: 'Server misconfiguration' })
      return
    }
    req.user = jwt.verify(token, secret)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    next()
  }
}

/** @param {string[]} roles */
export function requireAnyRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    next()
  }
}

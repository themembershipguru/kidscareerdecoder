const LABELS = {
  logical: 'Logical',
  creative: 'Creative',
  verbal: 'Verbal',
  social: 'Social',
  scientific: 'Scientific',
  practical: 'Practical',
}

export function labelForAptitudeKey(key) {
  if (!key || typeof key !== 'string') return '—'
  return LABELS[key.toLowerCase()] ?? key
}

export function ageFromBirthYear(birthYear) {
  if (birthYear == null || Number.isNaN(Number(birthYear))) return null
  const y = Number(birthYear)
  const current = new Date().getFullYear()
  const age = current - y
  return age >= 0 && age < 120 ? age : null
}

export function ageFromDateOfBirth(dob) {
  if (dob == null) return null
  const s = dob instanceof Date ? dob.toISOString().slice(0, 10) : String(dob).slice(0, 10)
  const d = new Date(`${s}T12:00:00Z`)
  if (Number.isNaN(d.getTime())) return null
  const t = new Date()
  let a = t.getFullYear() - d.getUTCFullYear()
  const m = t.getMonth() - d.getUTCMonth()
  if (m < 0 || (m === 0 && t.getDate() < d.getUTCDate())) a -= 1
  return a >= 0 && a < 120 ? a : null
}

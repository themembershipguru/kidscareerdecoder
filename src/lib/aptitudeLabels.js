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

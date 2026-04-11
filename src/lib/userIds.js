/**
 * Stable parent id from email so the same address always maps to one DB row.
 */
export async function stableParentId(email) {
  const normalized = email.trim().toLowerCase()
  const data = new TextEncoder().encode(normalized)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const hex = [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `p-${hex.slice(0, 28)}`
}

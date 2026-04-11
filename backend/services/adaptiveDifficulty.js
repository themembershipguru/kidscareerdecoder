/**
 * Rule-based adaptive difficulty (ML-ready: swap adjustAbility for a trained model).
 * Maps quiz default_difficulty (1–5) and question difficulty_level to 0–1 scale.
 */

export function normalizeQuizDefault(level) {
  if (level == null || Number.isNaN(Number(level))) return 0.5
  const n = Number(level)
  if (n <= 1) return 0.15
  if (n >= 5) return 0.85
  return (n - 1) / 4
}

export function normalizeQuestionDifficulty(level) {
  if (level == null || Number.isNaN(Number(level))) return 0.5
  const n = Number(level)
  if (n <= 1) return 0.15
  if (n >= 5) return 0.85
  return (n - 1) / 4
}

/**
 * Update latent "ability" from response time vs limit and question difficulty.
 * Fast answers on harder items raise ability more; skips lower it.
 */
export function adjustAbility(ability, { skipped, responseTimeMs, timeLimitSec, questionDifficulty }) {
  let a = Number(ability)
  if (!Number.isFinite(a)) a = 0.5
  a = Math.min(0.95, Math.max(0.05, a))

  const limitMs = Math.max(5000, (Number(timeLimitSec) || 60) * 1000)
  const qDiff = normalizeQuestionDifficulty(questionDifficulty)

  if (skipped) {
    a -= 0.09
    return Math.min(0.95, Math.max(0.05, a))
  }

  const rt = responseTimeMs != null ? Number(responseTimeMs) : limitMs * 0.5
  const timeRatio = Math.min(1, Math.max(0, rt / limitMs))
  const challenge = qDiff - 0.5
  let delta = (0.42 - timeRatio) * 0.18 + challenge * 0.06
  if (timeRatio < 0.3 && qDiff > 0.55) delta += 0.04
  if (timeRatio > 0.92) delta -= 0.05

  delta = Math.min(0.14, Math.max(-0.12, delta))
  a += delta
  return Math.min(0.95, Math.max(0.05, a))
}

/**
 * Pick next question id: closest difficulty to current ability; tie-break order_index.
 */
export function pickNextQuestionId(remainingIds, questionsById, ability) {
  if (!remainingIds.length) return null
  let bestId = remainingIds[0]
  let bestScore = Infinity
  let bestOrder = Infinity

  for (const id of remainingIds) {
    const row = questionsById.get(id)
    const d = row ? normalizeQuestionDifficulty(row.difficulty_level) : 0.5
    const dist = Math.abs(d - ability)
    const ord = row?.order_index ?? 0
    if (dist < bestScore || (dist === bestScore && ord < bestOrder)) {
      bestScore = dist
      bestOrder = ord
      bestId = id
    }
  }
  return bestId
}

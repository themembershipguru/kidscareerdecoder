export const aptitudeOrder = [
  'logical',
  'creative',
  'verbal',
  'social',
  'scientific',
  'practical',
]

export function buildScoresFromAnswers(quizAnswers) {
  const scores = Object.fromEntries(aptitudeOrder.map((k) => [k, 0]))
  for (const answer of quizAnswers) {
    const t = answer?.aptitudeType
    if (t && Object.prototype.hasOwnProperty.call(scores, t)) {
      scores[t] += 1
    }
  }
  return scores
}

export function rankAptitudes(scores) {
  return [...aptitudeOrder].sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a]
    return aptitudeOrder.indexOf(a) - aptitudeOrder.indexOf(b)
  })
}

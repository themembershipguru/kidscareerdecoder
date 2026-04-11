import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context'
import { apiFetch, apiPost } from '../../lib/api.js'
import { aptitudeOrder, buildScoresFromAnswers, rankAptitudes } from '../../lib/quizScoring.js'

const friendlyTypeLabels = {
  logical: 'Logical',
  creative: 'Creative',
  verbal: 'Verbal',
  social: 'Social',
  scientific: 'Scientific',
  practical: 'Practical',
}

const heroHeadingByType = {
  logical: "You're a Puzzle-Solving Star!",
  creative: "You're a Creative Thinker!",
  verbal: "You're a Word Wizard!",
  social: "You're a Friendship Builder!",
  scientific: "You're a Curious Explorer!",
  practical: "You're a Hands-On Builder!",
}

const secondSpotlightByType = {
  logical: 'Your brain loves patterns and clever plans.',
  creative: 'Your imagination loves to color outside the lines.',
  verbal: 'Stories and ideas find their way through you.',
  social: 'You lift people up when you work together.',
  scientific: 'Questions and experiments are your playground.',
  practical: 'You make real things work in the real world.',
}

const barColorsByType = {
  logical: 'bg-sky-400',
  creative: 'bg-fuchsia-400',
  verbal: 'bg-amber-400',
  social: 'bg-rose-400',
  scientific: 'bg-emerald-400',
  practical: 'bg-orange-400',
}

const sampleCareersByTopAptitude = {
  logical: ['Puzzle Game Designer', 'City Traffic Planner', 'Detective Scientist'],
  creative: ['Animator', 'Toy Inventor', 'Mural Artist'],
  verbal: ['Podcast Host', "Children's Book Author", 'News Reporter'],
  social: ['Team Coach', 'School Counselor', 'Community Event Host'],
  scientific: ['Marine Biologist', 'Weather Researcher', 'Robotics Tinkerer'],
  practical: ['Carpenter', 'Bike Mechanic', 'Chef'],
}

export function Results() {
  const { user } = useAuth()
  const location = useLocation()
  const saveSentRef = useRef(false)
  const quizAnswers = useMemo(
    () => location.state?.quizAnswers ?? [],
    [location.state?.quizAnswers],
  )

  /** Loaded titles for `type`; stale entries ignored unless `type === topType`. */
  const [careerData, setCareerData] = useState(null)

  const {
    scores,
    topType,
    barScaleMax,
    heroHeading,
    topSpotlightLine,
    runnerTagline,
    hasQuizSignals,
  } = useMemo(() => {
    const nextScores = buildScoresFromAnswers(quizAnswers)
    const ranked = rankAptitudes(nextScores)
    const primary = ranked[0]
    const secondary = ranked[1]
    const totalTagged = aptitudeOrder.reduce((sum, k) => sum + nextScores[k], 0)
    const maxCount = Math.max(...aptitudeOrder.map((k) => nextScores[k]), 0)
    const scale = maxCount > 0 ? maxCount : 1
    const signals = totalTagged > 0
    return {
      scores: nextScores,
      topType: primary,
      barScaleMax: scale,
      heroHeading: signals
        ? heroHeadingByType[primary]
        : 'Your sparkle map is ready when you are!',
      topSpotlightLine: signals
        ? secondSpotlightByType[primary]
        : 'Finish the fun quiz to see your strengths light up here.',
      runnerTagline: signals
        ? `Your next-brightest spark is ${friendlyTypeLabels[secondary]} — ${secondSpotlightByType[secondary]}`
        : 'Every path you pick in the quiz adds another colorful stripe.',
      hasQuizSignals: signals,
    }
  }, [quizAnswers])

  useEffect(() => {
    if (!hasQuizSignals || !topType) return
    let cancelled = false
    ;(async () => {
      try {
        const rows = await apiFetch(
          `/api/careers?aptitude=${encodeURIComponent(topType)}`,
        )
        if (cancelled || !Array.isArray(rows)) return
        const titles = rows.map((r) => r.title).filter(Boolean)
        setCareerData({ type: topType, titles: titles.length > 0 ? titles : null })
      } catch {
        if (!cancelled) setCareerData({ type: topType, titles: null })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [hasQuizSignals, topType])

  const topCareers = useMemo(() => {
    if (!hasQuizSignals) return sampleCareersByTopAptitude.creative
    if (
      careerData?.type === topType &&
      careerData.titles &&
      careerData.titles.length > 0
    ) {
      return careerData.titles
    }
    return (
      sampleCareersByTopAptitude[topType] ?? sampleCareersByTopAptitude.creative
    )
  }, [hasQuizSignals, topType, careerData])

  const quizIdForSave = location.state?.quizId ?? 'quiz-aptitude-v1'
  const answersKey = JSON.stringify(quizAnswers)

  useEffect(() => {
    if (!hasQuizSignals || user?.role !== 'child' || !user?.id) return
    if (!quizAnswers.length) return

    const fingerprint = `${user.id}|${quizIdForSave}|${answersKey}`
    const key = 'kcd-saved-quiz'
    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key) === fingerprint) {
        return
      }
    } catch {
      /* ignore */
    }

    if (saveSentRef.current) return
    saveSentRef.current = true

    const scores = buildScoresFromAnswers(quizAnswers)
    const ranked = rankAptitudes(scores)
    const topAptitude = ranked[0] ?? null
    ;(async () => {
      try {
        await apiPost('/api/quiz-sessions/complete', {
          userId: user.id,
          quizId: quizIdForSave,
          answers: quizAnswers,
          scores,
          topAptitude,
        })
        try {
          sessionStorage.setItem(key, fingerprint)
        } catch {
          /* ignore */
        }
      } catch {
        saveSentRef.current = false
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- answersKey tracks quizAnswers
  }, [hasQuizSignals, user?.id, user?.role, quizIdForSave, answersKey])

  const handleShareWithParent = () => {}

  return (
    <div className="relative min-h-full overflow-hidden bg-gradient-to-b from-[#e8fbff] via-[#fff7fb] to-[#fff9e6] px-4 py-10 sm:px-6">
      <div
        className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-[#00D4FF]/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-24 h-64 w-64 rounded-full bg-fuchsia-300/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-2xl space-y-8">
        <header className="rounded-[2rem] border-4 border-white/80 bg-white/70 p-8 text-center shadow-xl shadow-[#1A1A2E]/10 backdrop-blur-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#00D4FF]">
            Your sparkle map
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#1A1A2E] sm:text-4xl">
            {heroHeading}
          </h1>
          <p className="mt-4 text-lg font-semibold text-[#1A1A2E]/80">
            {topSpotlightLine}
          </p>
          <p className="mt-3 text-sm font-medium leading-relaxed text-[#1A1A2E]/65">
            {runnerTagline}
          </p>
        </header>

        <section className="rounded-[2rem] border-4 border-white/80 bg-white/80 p-6 shadow-lg shadow-[#1A1A2E]/10 backdrop-blur-sm">
          <h2 className="text-center text-lg font-bold text-[#1A1A2E]">
            All your strength stripes
          </h2>
          <p className="mt-1 text-center text-sm text-[#1A1A2E]/60">
            Taller stripes mean you picked more paths in that zone.
          </p>
          <ul className="mt-6 space-y-4">
            {aptitudeOrder.map((key) => {
              const count = scores[key]
              const widthPercent = Math.round((count / barScaleMax) * 100)
              const barClass = barColorsByType[key]
              return (
                <li key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm font-semibold text-[#1A1A2E]">
                    <span>{friendlyTypeLabels[key]}</span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-[#1A1A2E]/10">
                    <div
                      className={`h-full rounded-full ${barClass} transition-all duration-500`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section
          className={`rounded-[2rem] border-4 border-dashed border-[#00D4FF]/45 bg-white/75 p-6 shadow-inner shadow-[#00D4FF]/10 ${!hasQuizSignals ? 'opacity-95' : ''}`}
        >
          <h2 className="text-center text-lg font-bold text-[#1A1A2E]">
            Three careers that might love your style
          </h2>
          <p className="mt-1 text-center text-sm text-[#1A1A2E]/60">
            Just a fun starter list to dream about.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {(hasQuizSignals ? topCareers : sampleCareersByTopAptitude.creative).map(
              (career) => (
                <li
                  key={career}
                  className="rounded-2xl bg-gradient-to-br from-[#00D4FF]/15 to-fuchsia-200/40 px-4 py-4 text-center text-sm font-bold text-[#1A1A2E] shadow-sm"
                >
                  {career}
                </li>
              ),
            )}
          </ul>
        </section>

        <div className="flex justify-center pb-6">
          <button
            type="button"
            onClick={handleShareWithParent}
            className="rounded-full bg-[#1A1A2E] px-8 py-4 text-base font-bold text-[#00D4FF] shadow-lg transition hover:bg-[#252542] hover:shadow-xl"
          >
            Share with Parent
          </button>
        </div>
      </div>
    </div>
  )
}

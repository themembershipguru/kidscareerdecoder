import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import { CareerResultCard } from '../../components/CareerResultCard.jsx'
import { api, getApiError } from '../../utils/api.js'
import { aptitudeOrder } from '../../lib/quizScoring.js'

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

function normalizeScores(raw) {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }
  return raw
}

function headlineFromProfile(profile, topAptitude) {
  if (profile && typeof profile === 'string') {
    const part = profile.split('-')[0]?.trim()
    if (part) return `You're a ${part} Explorer!`
  }
  return heroHeadingByType[topAptitude] ?? "You're one of a kind!"
}

export function Results() {
  const { sessionId } = useParams()
  const location = useLocation()
  const [fetched, setFetched] = useState(null)
  const [fetchErr, setFetchErr] = useState('')

  const inlineResult = location.state?.result

  useEffect(() => {
    if (inlineResult || !sessionId) return
    let cancelled = false
    ;(async () => {
      setFetchErr('')
      try {
        const { data } = await api.get(`/session/${sessionId}`)
        if (cancelled) return
        setFetched(data)
      } catch (err) {
        if (!cancelled) setFetchErr(getApiError(err))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [inlineResult, sessionId])

  const view = useMemo(() => {
    if (inlineResult) {
      return {
        scores: normalizeScores(inlineResult.scores),
        topAptitude: inlineResult.top_aptitude,
        profile: inlineResult.profile,
        explanation: inlineResult.explanation,
        careers: inlineResult.careers ?? [],
      }
    }
    if (fetched) {
      const meta = fetched.metadata_json
      const profile = meta?.profile ?? fetched.top_aptitude
      const explanation = meta?.explanation ?? ''
      const careers = Array.isArray(meta?.careers) ? meta.careers : []
      return {
        scores: normalizeScores(fetched.scores_json),
        topAptitude: fetched.top_aptitude,
        profile,
        explanation,
        careers,
      }
    }
    return null
  }, [inlineResult, fetched])

  const scores = view?.scores ?? {}
  const topAptitude = view?.topAptitude ?? 'creative'
  const hasSignals = aptitudeOrder.some((k) => Number(scores[k] ?? 0) > 0)

  const heroHeading = hasSignals
    ? headlineFromProfile(view?.profile, topAptitude)
    : 'Your sparkle map is ready when you are!'

  const topSpotlightLine = hasSignals
    ? view?.explanation || secondSpotlightByType[topAptitude] || ''
    : 'Finish the fun quiz to see your strengths light up here.'

  const ranked = [...aptitudeOrder].sort(
    (a, b) => Number(scores[b] ?? 0) - Number(scores[a] ?? 0),
  )
  const secondary = ranked[1] ?? ranked[0]
  const runnerTagline = hasSignals
    ? `Your next-brightest spark is ${friendlyTypeLabels[secondary]} — ${secondSpotlightByType[secondary]}`
    : 'Every path you pick in the quiz adds another colorful stripe.'

  const barScaleMax = Math.max(
    ...aptitudeOrder.map((k) => Number(scores[k] ?? 0)),
    1,
  )

  const radarData = aptitudeOrder.map((k) => ({
    dimension: friendlyTypeLabels[k],
    value: Number(scores[k] ?? 0),
  }))

  const cardCareers =
    view?.careers?.length > 0
      ? view.careers.slice(0, 3)
      : (
          hasSignals
            ? sampleCareersByTopAptitude[topAptitude] ??
              sampleCareersByTopAptitude.creative
            : sampleCareersByTopAptitude.creative
        ).slice(0, 3)
  const shareCareerLines = cardCareers.map((c) => {
    if (typeof c === 'string') return `• ${c}`
    const t = c?.title ?? ''
    let line = `• ${t}`
    if (c?.salary) line += ` (${c.salary})`
    if (c?.pathway) line += ` — ${c.pathway}`
    return line
  })

  async function handleShareWithParent() {
    const lines = [
      'KidsCareerDecoder — quiz snapshot',
      '',
      heroHeading,
      '',
      topSpotlightLine,
      '',
      'Strength stripes (%):',
      ...aptitudeOrder.map(
        (k) => `${friendlyTypeLabels[k]}: ${scores[k] ?? 0}%`,
      ),
      '',
      'Career ideas:',
      ...shareCareerLines,
    ]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
    } catch {
      /* ignore */
    }
  }

  if (!sessionId) {
    return (
      <div className="p-8 text-center text-slate-900">
        <p>Missing session.</p>
        <Link to="/child/quiz" className="mt-4 inline-block font-semibold text-sky-600">
          Back to quizzes
        </Link>
      </div>
    )
  }

  if (!view && !fetchErr) {
    return (
      <div className="p-12 text-center font-medium text-slate-600">
        Loading your results…
      </div>
    )
  }

  if (fetchErr && !view) {
    return (
      <div className="mx-auto w-full max-w-xl p-8 text-center">
        <p className="text-rose-600">{fetchErr}</p>
        <Link to="/child/quiz" className="mt-4 inline-block font-semibold text-sky-600">
          Back to quizzes
        </Link>
      </div>
    )
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-gradient-to-b from-sky-100 via-rose-50 to-amber-50 px-4 py-10 sm:px-6 lg:px-10">
      <div
        className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-[#00D4FF]/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-24 h-64 w-64 rounded-full bg-fuchsia-300/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-5xl space-y-8">
        <header className="rounded-[2rem] border-4 border-white/90 bg-white/85 p-8 text-center shadow-xl shadow-slate-300/40 backdrop-blur-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
            Your sparkle map
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            {heroHeading}
          </h1>
          <p className="mt-4 text-lg font-semibold text-slate-800">
            {topSpotlightLine}
          </p>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
            {runnerTagline}
          </p>
        </header>

        <section className="rounded-[2rem] border-4 border-white/90 bg-white/90 p-4 shadow-lg shadow-slate-300/40 backdrop-blur-sm sm:p-6">
          <h2 className="text-center text-lg font-bold text-slate-900">
            All six strengths
          </h2>
          <div className="mt-4 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#94a3b866" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: '#0f172a', fontSize: 11 }}
                />
                <Radar
                  name="You"
                  dataKey="value"
                  stroke="#0f172a"
                  fill="#0ea5e9"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-[2rem] border-4 border-white/90 bg-white/90 p-6 shadow-lg shadow-slate-300/40 backdrop-blur-sm">
          <h2 className="text-center text-lg font-bold text-slate-900">
            Strength stripes
          </h2>
          <p className="mt-1 text-center text-sm text-slate-600">
            Taller bars show higher scores from your answers.
          </p>
          <ul className="mt-6 space-y-4">
            {aptitudeOrder.map((key) => {
              const val = Number(scores[key] ?? 0)
              const widthPercent = Math.round((val / barScaleMax) * 100)
              const barClass = barColorsByType[key]
              return (
                <li key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                    <span>{friendlyTypeLabels[key]}</span>
                    <span>{val}%</span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
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

        <section className="rounded-[2rem] border-4 border-dashed border-sky-300/80 bg-white/85 p-6 shadow-inner shadow-sky-200/50">
          <h2 className="text-center text-lg font-bold text-slate-900">
            Three careers to dream about
          </h2>
          <p className="mt-1 text-center text-sm text-slate-600">
            A fun starter list — not a final answer.
          </p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            {cardCareers.map((career, i) => (
              <CareerResultCard
                key={
                  typeof career === 'object' && career?.title
                    ? `${career.title}-${i}`
                    : String(career)
                }
                career={career}
                index={i}
                variant="child"
              />
            ))}
          </ul>
        </section>

        <div className="flex flex-col items-center justify-center gap-4 pb-6 sm:flex-row">
          <button
            type="button"
            onClick={() => void handleShareWithParent()}
            className="rounded-full bg-[#1A1A2E] px-8 py-4 text-base font-bold text-[#00D4FF] shadow-lg transition hover:bg-[#252542] hover:shadow-xl"
          >
            Show parent
          </button>
          <Link
            to="/child/quiz"
            className="rounded-full border-2 border-slate-300 bg-white px-8 py-4 text-base font-bold text-slate-900 shadow transition hover:border-sky-400"
          >
            Try another quiz
          </Link>
        </div>
      </div>
    </div>
  )
}

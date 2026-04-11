import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
} from 'recharts'
import { api, getApiError } from '../../utils/api.js'
import { labelForAptitudeKey } from '../../lib/aptitudeLabels.js'
import { aptitudeOrder } from '../../lib/quizScoring.js'

const aptitudeColors = {
  logical: '#0ea5e9',
  creative: '#d946ef',
  verbal: '#f59e0b',
  social: '#f43f5e',
  scientific: '#10b981',
  practical: '#f97316',
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

function sessionProfile(s) {
  const m = s.metadata_json
  if (m && typeof m === 'object' && m.profile) return m.profile
  return s.top_aptitude ?? '—'
}

function formatShortDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function ChildReport() {
  const { id: childId } = useParams()
  const [data, setData] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!childId) return
    let cancelled = false
    ;(async () => {
      setLoadState('loading')
      setError('')
      try {
        const { data: body } = await api.get(`/analytics/child/${childId}`)
        if (cancelled) return
        setData(body)
        setLoadState('ready')
      } catch (err) {
        if (cancelled) return
        setError(getApiError(err))
        setLoadState('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [childId])

  const sessionList = useMemo(() => {
    if (!data?.sessions?.length) return []
    return data.sessions
  }, [data])

  const last = sessionList.length ? sessionList[sessionList.length - 1] : null
  const latestScores = normalizeScores(last?.scores_json)

  const radarData = useMemo(
    () =>
      aptitudeOrder.map((k) => ({
        dimension: labelForAptitudeKey(k),
        value: Number(latestScores[k] ?? 0),
      })),
    [latestScores],
  )

  const lineKeys = useMemo(() => {
    const ranked = [...aptitudeOrder].sort(
      (a, b) => Number(latestScores[b] ?? 0) - Number(latestScores[a] ?? 0),
    )
    return ranked.slice(0, 3)
  }, [latestScores])

  const lineChartData = useMemo(() => {
    return sessionList.map((s, i) => {
      const sc = normalizeScores(s.scores_json)
      const row = {
        label: formatShortDate(s.completed_at),
        idx: i + 1,
      }
      for (const k of lineKeys) {
        row[k] = Number(sc[k] ?? 0)
      }
      return row
    })
  }, [sessionList, lineKeys])

  function downloadReport() {
    if (!data) return
    const lines = [
      'KidsCareerDecoder — child report',
      '',
      `Child: ${data.child?.full_name ?? ''}`,
      `Age: ${data.child?.age ?? '—'}`,
      `Current profile: ${data.current_profile ?? '—'}`,
      '',
      'Sessions:',
      ...sessionList.map(
        (s) =>
          `${formatShortDate(s.completed_at)} | ${sessionProfile(s)} | top: ${s.top_aptitude ?? '—'}`,
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kidscareer-${childId ?? 'report'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loadState === 'loading') {
    return (
      <div className="p-12 text-center font-medium text-slate-600">Loading…</div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="mx-auto max-w-lg p-8">
        <p className="text-rose-600">{error}</p>
        <Link to="/parent/dashboard" className="mt-4 inline-block text-cyan-600">
          ← Dashboard
        </Link>
      </div>
    )
  }

  if (!data) return null

  const child = data.child
  const careers = data.careers ?? []
  const sessions = sessionList

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-100 to-white px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/parent/dashboard"
          className="text-sm font-semibold text-cyan-700 hover:underline"
        >
          ← Dashboard
        </Link>

        <header className="mt-6 border-b border-slate-200 pb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            {child?.full_name}
          </h1>
          <p className="mt-2 text-slate-600">
            Age {child?.age ?? '—'} · Current profile:{' '}
            <span className="font-bold text-slate-900">
              {data.current_profile ?? '—'}
            </span>
          </p>
        </header>

        {sessions.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-lg font-bold text-slate-900">No sessions yet</p>
            <p className="mt-2 text-slate-600">
              When your child completes a quiz while signed in, trends will
              appear here.
            </p>
          </div>
        )}

        {sessions.length > 0 && (
          <>
            <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">
                Latest session radar
              </h2>
              <div className="mt-4 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1e293b33" />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fill: '#1e293b', fontSize: 11 }}
                    />
                    <Radar
                      dataKey="value"
                      stroke="#1A1A2E"
                      fill="#00D4FF"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">
                Score trends (top 3 strengths)
              </h2>
              <div className="mt-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    {lineKeys.map((k) => (
                      <Line
                        key={k}
                        type="monotone"
                        dataKey={k}
                        name={labelForAptitudeKey(k)}
                        stroke={aptitudeColors[k] ?? '#64748b'}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-lg font-bold text-slate-900">
                Career ideas (latest top aptitude)
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {careers.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-xl border-l-4 border-cyan-500 bg-white p-4 shadow-sm"
                  >
                    <p className="font-bold text-slate-900">{c.title}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {labelForAptitudeKey(c.aptitude_type)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-700">Date</th>
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Profile
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Top aptitude
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => (
                    <tr
                      key={`${s.completed_at ?? ''}-${s.started_at ?? ''}-${i}`}
                      className="border-b border-slate-100"
                    >
                      <td className="px-4 py-3 text-slate-800">
                        {formatShortDate(s.completed_at)}
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        {sessionProfile(s)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {labelForAptitudeKey(s.top_aptitude)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={downloadReport}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-cyan-300 transition hover:bg-slate-800"
          >
            Download report
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          For a new quiz, your child signs in with their child email and opens
          the quiz list from their home screen.
        </p>
      </div>
    </div>
  )
}

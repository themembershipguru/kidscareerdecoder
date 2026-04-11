import { Link } from 'react-router-dom'

const mockDashboardChild = {
  name: 'Daksh',
  age: 8,
  quizzesCompleted: 2,
  topAptitudeSoFar: 'Creative',
  recentQuizzes: [
    {
      sessionId: 'sess-02',
      completedAt: '2025-03-15',
      topProfile: 'Verbal',
    },
    {
      sessionId: 'sess-01',
      completedAt: '2025-03-01',
      topProfile: 'Creative',
    },
  ],
}

function formatQuizDate(isoDate) {
  const parsed = new Date(`${isoDate}T12:00:00`)
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(parsed)
}

export function ParentDashboard() {
  const child = mockDashboardChild

  return (
    <div className="mx-auto min-h-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-[#1A1A2E]/10 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00D4FF]">
          Parent overview
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1A1A2E] sm:text-3xl">
          Children and progress
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#1A1A2E]/65">
          Review aptitude signals from recent quizzes. Detailed analytics will
          arrive in a later release.
        </p>
      </div>

      <article className="rounded-2xl border border-[#1A1A2E]/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 border-b border-[#1A1A2E]/8 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-[#1A1A2E]">
                {child.name}
              </h2>
              <span className="rounded-full bg-[#1A1A2E] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#00D4FF]">
                Age {child.age}
              </span>
              <span className="text-sm font-medium text-[#1A1A2E]/55">
                {child.quizzesCompleted} quizzes completed
              </span>
            </div>
            <p className="mt-4 text-sm text-[#1A1A2E]/65">
              Strongest signal to date
            </p>
            <p className="mt-1 text-lg font-semibold text-[#1A1A2E]">
              {child.topAptitudeSoFar}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1A1A2E]/55">
            Recent sessions
          </h3>
          <ul className="mt-4 divide-y divide-[#1A1A2E]/10 rounded-xl border border-[#1A1A2E]/10">
            {child.recentQuizzes.map((quiz) => (
              <li
                key={quiz.sessionId}
                className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-medium text-[#1A1A2E]">
                  {formatQuizDate(quiz.completedAt)}
                </span>
                <span className="text-sm text-[#1A1A2E]/70">
                  Top profile:{' '}
                  <span className="font-semibold text-[#1A1A2E]">
                    {quiz.topProfile}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            to="/parent/add-child"
            className="inline-flex items-center justify-center rounded-lg bg-[#1A1A2E] px-5 py-2.5 text-center text-sm font-semibold text-[#00D4FF] transition hover:bg-[#252542]"
          >
            Add Child
          </Link>
          <span
            className="inline-flex cursor-not-allowed"
            title="Coming in Week 6"
          >
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center rounded-lg border border-[#1A1A2E]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A2E]/40"
            >
              View Full Report
            </button>
          </span>
        </div>
      </article>
    </div>
  )
}

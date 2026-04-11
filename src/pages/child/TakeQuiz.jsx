import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../lib/api.js'

const DEFAULT_QUIZ_ID = 'quiz-aptitude-v1'
const FALLBACK_SECONDS = 60

export function TakeQuiz() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [secPerQuestion, setSecPerQuestion] = useState(FALLBACK_SECONDS)
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState('')

  const [currentIndex, setCurrentIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(FALLBACK_SECONDS)
  const [encouragement, setEncouragement] = useState('')
  const [optionsLocked, setOptionsLocked] = useState(false)
  const answersRef = useRef([])
  const intervalRef = useRef(null)
  const answeredCurrentRef = useRef(false)
  const finishQuestionRef = useRef(() => {})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadState('loading')
      setLoadError('')
      try {
        const data = await apiFetch(`/api/quizzes/${DEFAULT_QUIZ_ID}`)
        if (cancelled) return
        const list = data?.questions
        if (!Array.isArray(list) || list.length === 0) {
          throw new Error('No questions returned from the server.')
        }
        setQuestions(list)
        setSecPerQuestion(
          Number(data.timePerQuestionSeconds) || FALLBACK_SECONDS,
        )
        setCurrentIndex(0)
        answersRef.current = []
        setLoadState('ready')
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : 'Could not load the quiz.',
          )
          setLoadState('error')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const totalQuestions = questions.length
  const currentQuestion = questions[currentIndex]

  const finishQuestion = useCallback(
    (aptitudeType) => {
      const q = questions[currentIndex]
      if (!q) return
      const next = [...answersRef.current, { questionId: q.id, aptitudeType }]
      answersRef.current = next
      const isLast = currentIndex === totalQuestions - 1
      if (isLast) {
        navigate('/child/results', {
          replace: true,
          state: { quizAnswers: next, quizId: DEFAULT_QUIZ_ID },
        })
        return
      }
      setCurrentIndex((i) => i + 1)
    },
    [currentIndex, navigate, questions, totalQuestions],
  )

  useEffect(() => {
    finishQuestionRef.current = finishQuestion
  }, [finishQuestion])

  useEffect(() => {
    if (loadState !== 'ready' || totalQuestions === 0) return

    answeredCurrentRef.current = false
    setOptionsLocked(false)
    setSecondsLeft(secPerQuestion)
    setEncouragement('')
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          queueMicrotask(() => {
            if (!answeredCurrentRef.current) {
              answeredCurrentRef.current = true
              finishQuestionRef.current(null)
            }
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [currentIndex, loadState, secPerQuestion, totalQuestions])

  const handlePick = (aptitudeType) => {
    if (answeredCurrentRef.current || optionsLocked) return
    answeredCurrentRef.current = true
    setOptionsLocked(true)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setEncouragement('Great choice! Keep going.')
    window.setTimeout(() => {
      setEncouragement('')
      finishQuestion(aptitudeType)
    }, 1500)
  }

  const handleRetry = () => {
    setLoadState('loading')
    setLoadError('')
    ;(async () => {
      try {
        const data = await apiFetch(`/api/quizzes/${DEFAULT_QUIZ_ID}`)
        const list = data?.questions
        if (!Array.isArray(list) || list.length === 0) {
          throw new Error('No questions returned from the server.')
        }
        setQuestions(list)
        setSecPerQuestion(
          Number(data.timePerQuestionSeconds) || FALLBACK_SECONDS,
        )
        setCurrentIndex(0)
        answersRef.current = []
        setLoadState('ready')
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : 'Could not load the quiz.',
        )
        setLoadState('error')
      }
    })()
  }

  if (loadState === 'loading' || loadState === 'error') {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
        {loadState === 'loading' && (
          <p className="text-center text-base font-medium text-[#1A1A2E]/70">
            Loading your quiz…
          </p>
        )}
        {loadState === 'error' && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-rose-800">
              {loadError || 'Something went wrong.'}
            </p>
            <p className="mt-2 text-xs text-rose-700/90">
              Start the API with{' '}
              <code className="rounded bg-white/80 px-1 py-0.5">npm run server</code>{' '}
              (and ensure Supabase env is set), then retry.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-4 rounded-lg bg-[#1A1A2E] px-5 py-2.5 text-sm font-bold text-[#00D4FF] transition hover:bg-[#252542]"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    )
  }

  const questionProgressPercent = ((currentIndex + 1) / totalQuestions) * 100
  const timerPercent = (secondsLeft / secPerQuestion) * 100

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium text-[#1A1A2E]/80">
          <span>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="tabular-nums text-[#00D4FF]">{secondsLeft}s</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[#1A1A2E]/10">
          <div
            className="h-full rounded-full bg-[#00D4FF] transition-[width] duration-500 ease-out"
            style={{ width: `${questionProgressPercent}%` }}
          />
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#1A1A2E]/5">
          <div
            className="h-full rounded-full bg-[#1A1A2E]/40 transition-[width] duration-1000 ease-linear"
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      </div>

      {encouragement && (
        <p className="rounded-2xl border border-[#00D4FF]/30 bg-[#00D4FF]/10 px-4 py-3 text-center text-base font-semibold text-[#1A1A2E]">
          {encouragement}
        </p>
      )}

      <div className="rounded-3xl border border-[#1A1A2E]/10 bg-white p-6 shadow-lg shadow-[#1A1A2E]/5">
        <h1 className="text-xl font-bold leading-snug text-[#1A1A2E] sm:text-2xl">
          {currentQuestion?.text}
        </h1>
        <ul className="mt-6 flex flex-col gap-3">
          {(currentQuestion?.options ?? []).map((option) => (
            <li key={option.id ?? option.text}>
              <button
                type="button"
                onClick={() => handlePick(option.aptitudeType)}
                disabled={optionsLocked}
                className="w-full rounded-2xl border-2 border-[#1A1A2E]/10 bg-slate-50 px-4 py-4 text-left text-base font-medium text-[#1A1A2E] transition hover:border-[#00D4FF]/60 hover:bg-[#00D4FF]/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {option.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

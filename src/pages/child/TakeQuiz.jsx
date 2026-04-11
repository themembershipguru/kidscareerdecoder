import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { api, getApiError } from '../../utils/api.js'

const FALLBACK_SECONDS = 60
const CHEERS = [
  'Great choice!',
  'Awesome!',
  'Keep going!',
  'Nice pick!',
  'You rock!',
]

function pickCheer() {
  return CHEERS[Math.floor(Math.random() * CHEERS.length)]
}

export function TakeQuiz() {
  const { slug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const sessionId = location.state?.sessionId

  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [progressIndex, setProgressIndex] = useState(1)
  const [secPerQuestion, setSecPerQuestion] = useState(FALLBACK_SECONDS)
  const [quizTitle, setQuizTitle] = useState('')
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState('')

  const [secondsLeft, setSecondsLeft] = useState(FALLBACK_SECONDS)
  const [encouragement, setEncouragement] = useState('')
  const [optionsLocked, setOptionsLocked] = useState(false)
  const intervalRef = useRef(null)
  const answeredCurrentRef = useRef(false)
  const finishQuestionRef = useRef(() => {})
  const questionStartedAtRef = useRef(0)
  const currentQuestionIdRef = useRef(null)

  useEffect(() => {
    if (!sessionId) {
      navigate('/child/quiz', { replace: true })
    }
  }, [sessionId, navigate])

  const fetchCurrentQuestion = useCallback(async () => {
    const { data } = await api.get(
      `/session/${encodeURIComponent(sessionId)}/current-question`,
      { params: { slug } },
    )
    if (data?.done) {
      return { done: true, data }
    }
    if (!data?.question) {
      throw new Error('No question returned from the server.')
    }
    return { done: false, data }
  }, [sessionId, slug])

  useEffect(() => {
    if (!slug || !sessionId) return
    let cancelled = false
    ;(async () => {
      setLoadState('loading')
      setLoadError('')
      try {
        const result = await fetchCurrentQuestion()
        if (cancelled) return
        if (result.done) {
          const { data } = result
          setQuizTitle(data?.quiz_title ?? '')
          setSecPerQuestion(
            Number(data?.time_per_question_seconds) || FALLBACK_SECONDS,
          )
          setTotalQuestions(Number(data?.total_questions) || 0)
          try {
            const { data: completeData } = await api.post(
              `/session/${encodeURIComponent(sessionId)}/complete`,
            )
            navigate(`/child/results/${sessionId}`, {
              replace: true,
              state: { result: completeData },
            })
          } catch (err) {
            setLoadError(getApiError(err))
            setLoadState('error')
          }
          return
        }
        const { data } = result
        setQuizTitle(data.quiz_title ?? '')
        setSecPerQuestion(
          Number(data.time_per_question_seconds) || FALLBACK_SECONDS,
        )
        setTotalQuestions(Number(data.total_questions) || 0)
        setProgressIndex(Number(data.progress_index) || 1)
        setCurrentQuestion(data.question)
        currentQuestionIdRef.current = data.question.id
        setLoadState('ready')
      } catch (err) {
        if (!cancelled) {
          setLoadError(getApiError(err))
          setLoadState('error')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug, sessionId, fetchCurrentQuestion, navigate])

  const finishQuestion = useCallback(
    async (payload) => {
      const qid = currentQuestionIdRef.current
      if (!qid || !sessionId) return
      const isSkip = payload?.skipped === true
      let submitRes
      try {
        const { data } = await api.post(`/session/${sessionId}/answer`, {
          question_id: qid,
          question_option_id: isSkip ? undefined : payload?.optionId,
          response_time_ms: payload?.responseTimeMs ?? null,
          skipped: isSkip,
        })
        submitRes = data
      } catch {
        return
      }

      if (submitRes?.next_question) {
        setCurrentQuestion(submitRes.next_question)
        currentQuestionIdRef.current = submitRes.next_question.id
        setProgressIndex((n) => n + 1)
        if (submitRes.time_per_question_seconds != null) {
          setSecPerQuestion(
            Number(submitRes.time_per_question_seconds) || FALLBACK_SECONDS,
          )
        }
        return
      }

      try {
        const { data } = await api.post(`/session/${sessionId}/complete`)
        navigate(`/child/results/${sessionId}`, {
          replace: true,
          state: { result: data },
        })
      } catch (err) {
        setLoadError(getApiError(err))
        setLoadState('error')
      }
    },
    [navigate, sessionId],
  )

  useEffect(() => {
    finishQuestionRef.current = finishQuestion
  }, [finishQuestion])

  useEffect(() => {
    questionStartedAtRef.current = Date.now()
  }, [currentQuestion?.id])

  useEffect(() => {
    if (loadState !== 'ready' || !currentQuestion || totalQuestions === 0) return

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
              const elapsed = Date.now() - questionStartedAtRef.current
              finishQuestionRef.current({
                skipped: true,
                responseTimeMs: elapsed,
              })
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
    // Timer resets only when the active question id changes (not full question object identity).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  }, [currentQuestion?.id, loadState, secPerQuestion, totalQuestions])

  const handlePick = (option) => {
    if (answeredCurrentRef.current || optionsLocked) return
    answeredCurrentRef.current = true
    setOptionsLocked(true)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setEncouragement(pickCheer())
    window.setTimeout(() => {
      setEncouragement('')
      const started = questionStartedAtRef.current
      const elapsed =
        typeof started === 'number' && started > 0 ? Date.now() - started : 0
      void finishQuestion({
        optionId: option.id,
        responseTimeMs: elapsed,
        skipped: false,
      })
    }, 1000)
  }

  const handleRetry = () => {
    if (!slug || !sessionId) return
    setLoadState('loading')
    setLoadError('')
    ;(async () => {
      try {
        const result = await fetchCurrentQuestion()
        if (result.done) {
          const { data } = result
          setQuizTitle(data?.quiz_title ?? '')
          setSecPerQuestion(
            Number(data?.time_per_question_seconds) || FALLBACK_SECONDS,
          )
          setTotalQuestions(Number(data?.total_questions) || 0)
          const { data: completeData } = await api.post(
            `/session/${encodeURIComponent(sessionId)}/complete`,
          )
          navigate(`/child/results/${sessionId}`, {
            replace: true,
            state: { result: completeData },
          })
          return
        }
        const { data } = result
        setQuizTitle(data.quiz_title ?? '')
        setSecPerQuestion(
          Number(data.time_per_question_seconds) || FALLBACK_SECONDS,
        )
        setTotalQuestions(Number(data.total_questions) || 0)
        setProgressIndex(Number(data.progress_index) || 1)
        setCurrentQuestion(data.question)
        currentQuestionIdRef.current = data.question.id
        setLoadState('ready')
      } catch (err) {
        setLoadError(getApiError(err))
        setLoadState('error')
      }
    })()
  }

  if (!sessionId) {
    return null
  }

  if (loadState === 'loading' || loadState === 'error') {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
        {loadState === 'loading' && (
          <p className="text-center text-base font-medium text-slate-600">
            Loading your quiz…
          </p>
        )}
        {loadState === 'error' && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-rose-800">
              {loadError || 'Something went wrong.'}
            </p>
            <p className="mt-2 text-xs text-rose-700/90">
              Run{' '}
              <code className="rounded bg-white/80 px-1 py-0.5">npm run backend</code>{' '}
              on port 5000, then retry.
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

  const questionProgressPercent = (progressIndex / totalQuestions) * 100
  const timerPercent = (secondsLeft / secPerQuestion) * 100
  const urgent = secondsLeft <= 10

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {quizTitle && (
        <p className="text-center text-sm font-semibold text-slate-600">
          {quizTitle}
        </p>
      )}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium text-slate-700">
          <span>
            Question {progressIndex} of {totalQuestions}
          </span>
          <span
            className={`tabular-nums ${urgent ? 'animate-pulse font-bold text-rose-600' : 'text-sky-600'}`}
          >
            {secondsLeft}s
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-sky-500 transition-[width] duration-500 ease-out"
            style={{ width: `${questionProgressPercent}%` }}
          />
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${urgent ? 'bg-rose-500' : 'bg-slate-400'}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      </div>

      {encouragement && (
        <p className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-center text-base font-semibold text-slate-900">
          {encouragement}
        </p>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
        <h1 className="text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
          {currentQuestion?.body}
        </h1>
        <ul className="mt-6 flex flex-col gap-3">
          {(currentQuestion?.options ?? []).map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => handlePick(option)}
                disabled={optionsLocked}
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 text-left text-base font-medium text-slate-900 transition hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

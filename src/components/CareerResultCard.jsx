import { labelForAptitudeKey } from '../lib/aptitudeLabels.js'

const emojis = ['🌟', '🚀', '✨']

function salaryBadgeClass(salary) {
  if (!salary || !String(salary).trim()) return 'bg-slate-100 text-slate-700'
  const s = String(salary)
  if (/₹|LPA|lpa|INR|Rs\.?/i.test(s)) return 'bg-emerald-100 text-emerald-800'
  if (/\$|USD|\d+\s*K\b/i.test(s)) return 'bg-blue-100 text-blue-800'
  return 'bg-slate-100 text-slate-700'
}

export function CareerResultCard({ career, index = 0, variant = 'parent' }) {
  const isChild = variant === 'child'
  const title =
    typeof career === 'string' ? career : String(career?.title ?? '')
  const salary =
    typeof career === 'object' && career ? String(career.salary ?? '').trim() : ''
  const pathway =
    typeof career === 'object' && career ? String(career.pathway ?? '').trim() : ''
  const matchReason =
    typeof career === 'object' && career
      ? String(career.match_reason ?? '').trim()
      : ''
  const aptitudeKey =
    typeof career === 'object' && career?.aptitude_type
      ? String(career.aptitude_type)
      : ''
  const aptitudeLine = aptitudeKey ? labelForAptitudeKey(aptitudeKey) : ''

  if (isChild) {
    const hasKidDetail = Boolean(pathway || matchReason)
    return (
      <li className="rounded-2xl border-2 border-sky-200/80 bg-gradient-to-br from-sky-100 via-white to-fuchsia-100 p-4 text-left shadow-md sm:p-5">
        <p className="text-base font-extrabold leading-snug text-slate-900">
          <span className="mr-2 text-2xl" aria-hidden="true">
            {emojis[index % emojis.length]}
          </span>
          {title}
        </p>
        {pathway ? (
          <p className="mt-3 text-sm font-medium text-slate-500">
            How to get there: {pathway}
          </p>
        ) : null}
        {matchReason ? (
          <p className="mt-2 text-sm italic leading-relaxed text-slate-600">
            {matchReason}
          </p>
        ) : null}
        {!hasKidDetail && title ? (
          <p className="mt-2 text-sm font-medium text-sky-700">
            A super-fun direction to imagine and explore!
          </p>
        ) : null}
        {aptitudeLine ? (
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            {aptitudeLine}
          </p>
        ) : null}
      </li>
    )
  }

  const hasDetail = Boolean(salary || pathway || matchReason)
  return (
    <li className="rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-base font-bold text-slate-900">{title}</p>
        {salary ? (
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${salaryBadgeClass(salary)}`}
          >
            {salary}
          </span>
        ) : null}
      </div>
      {pathway ? (
        <p className="mt-3 text-sm text-slate-500">{pathway}</p>
      ) : null}
      {matchReason ? (
        <p className="mt-2 text-sm italic leading-relaxed text-slate-600">
          {matchReason}
        </p>
      ) : null}
      {!hasDetail && title ? (
        <p className="mt-2 text-xs text-slate-500">No AI detail stored.</p>
      ) : null}
      {aptitudeLine ? (
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {aptitudeLine}
        </p>
      ) : null}
    </li>
  )
}

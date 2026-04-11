import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-black text-[#00D4FF]/80">404</p>
      <h1 className="mt-4 text-2xl font-bold text-[#1A1A2E]">Page not found</h1>
      <p className="mt-2 text-[#1A1A2E]/65">
        That path does not exist. Let’s get you back somewhere friendly.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-[#1A1A2E] px-8 py-3 text-sm font-bold text-[#00D4FF] transition hover:bg-[#252542]"
      >
        Go home
      </Link>
    </div>
  )
}

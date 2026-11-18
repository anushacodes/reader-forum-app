import { Link } from 'react-router'
import { BookX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center border border-line bg-surface p-8 text-center my-12">
      <div className="mb-3 border border-line p-3 text-muted bg-surface-subtle">
        <BookX size={36} strokeWidth={1.5} />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-text">Page Not Found</h1>
      <p className="mt-2 text-xs text-muted">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="press mt-5 inline-flex items-center border border-text bg-text px-4 py-2 text-xs font-semibold text-background hover:opacity-90"
      >
        Return to discussions
      </Link>
    </div>
  )
}

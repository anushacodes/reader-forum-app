import { Link } from 'react-router'

export default function Logo({
  className = '',
  showText = false,
  imgClassName = 'h-16 w-auto',
}) {
  return (
    <Link
      to="/"
      aria-label="Dogear home"
      className={`inline-flex items-center gap-3 no-underline ${className}`}
    >
      <img
        src="/logo.png"
        alt="Dogear"
        className={`object-contain shrink-0 ${imgClassName}`}
      />
      {showText && (
        <span aria-hidden="true" className="text-xl font-bold tracking-tight text-text">
          dogear<span className="text-accent-red font-bold">.</span>
        </span>
      )}
    </Link>
  )
}

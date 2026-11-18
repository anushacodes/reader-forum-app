import { Link } from 'react-router'

export default function Logo({
  className = '',
  showText = true,
  imgClassName = 'h-11 w-auto',
}) {
  return (
    <Link
      to="/"
      aria-label="Dogear home"
      className={`inline-flex items-center gap-2 no-underline -ml-1 ${className}`}
    >
      <img
        src="/logo.png"
        alt="Dogear"
        className={`object-contain shrink-0 ${imgClassName}`}
      />
      {showText && (
        <span
          aria-hidden="true"
          className="text-xl font-bold tracking-tight text-text leading-none select-none"
        >
          dogear<span className="text-accent-red font-bold">.</span>
        </span>
      )}
    </Link>
  )
}

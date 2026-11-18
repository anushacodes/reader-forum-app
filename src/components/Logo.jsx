import { Link } from 'react-router'

export default function Logo({
  className = '',
  showText = true,
  imgClassName = 'h-13 w-auto',
}) {
  return (
    <Link
      to="/"
      aria-label="Dogear home"
      className={`inline-flex items-center gap-2.5 no-underline ${className}`}
    >
      <img
        src="/logo.png"
        alt="Dogear"
        className={`object-contain shrink-0 ${imgClassName}`}
      />
      {showText && (
        <span aria-hidden="true" className="text-xl font-black tracking-tight text-text">
          dogear<span className="text-accent-red font-black">.</span>
        </span>
      )}
    </Link>
  )
}

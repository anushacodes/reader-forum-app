import { Link } from 'react-router'

export default function Logo({ className = '' }) {
  return (
    <Link
      to="/"
      aria-label="Dogear home"
      className={`inline-flex flex-none items-center gap-2.5 text-[2.125rem] leading-none font-semibold tracking-[-0.015em] no-underline ${className}`}
    >
      <img src="/logo.png" alt="" width="50" height="38" className="h-[2.375rem] w-[3.125rem] object-cover" />
      <span aria-hidden="true">
        dogear<span className="text-accent">.</span>
      </span>
    </Link>
  )
}

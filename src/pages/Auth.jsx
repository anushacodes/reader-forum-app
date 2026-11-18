import { Link } from 'react-router'
import Logo from '../components/Logo.jsx'

// TODO(TASKS.md §2): email/password login and signup with generated or custom username.
export default function Auth({ mode }) {
  const isSignup = mode === 'signup'
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-8 px-4 py-16">
      <Logo />
      <h1 className="text-2xl font-semibold">{isSignup ? 'Create an account' : 'Log in'}</h1>
      <p className="text-muted">
        {isSignup ? (
          <>
            Already have an account? <Link to="/login" className="underline">Log in</Link>
          </>
        ) : (
          <>
            New here? <Link to="/signup" className="underline">Create an account</Link>
          </>
        )}
      </p>
    </main>
  )
}

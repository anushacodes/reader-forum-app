import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Shuffle, Loader2, AlertCircle, BookOpen } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../lib/auth.jsx'
import { getSafeNextPath } from '../lib/nav.js'
import { generateUsername, validateUsername } from '../lib/username.js'

export default function Auth({ mode = 'login' }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextParam = searchParams.get('next')
  const safeNext = getSafeNextPath(nextParam)

  const { login, signup, isAuthenticated, loading: authLoading, isSupabaseConfigured } = useAuth()

  // Form states
  const [username, setUsername] = useState(() => (isSignup ? generateUsername() : ''))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  // If already logged in, redirect to destination
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(safeNext, { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate, safeNext])

  const handleGenerateUsername = () => {
    const nextUsername = generateUsername(username)
    setUsername(nextUsername)
    setUsernameError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setUsernameError('')
    setInfoMessage('')

    // Validate inputs
    if (isSignup) {
      const validation = validateUsername(username)
      if (!validation.valid) {
        setUsernameError(validation.error)
        return
      }
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.')
      return
    }

    setIsSubmitting(true)

    try {
      if (isSignup) {
        const result = await signup({
          username: username.trim(),
          email: email.trim(),
          password,
        })

        if (!result?.session) {
          setInfoMessage('Account created! Please check your email to confirm your account.')
          setPassword('')
          setIsSubmitting(false)
          return
        }

        navigate(safeNext, { replace: true })
      } else {
        await login({
          email: email.trim(),
          password,
        })
        navigate(safeNext, { replace: true })
      }
    } catch (err) {
      console.error('Authentication error:', err)
      const msg = err?.message || ''

      if (msg.toLowerCase().includes('already taken') || msg.toLowerCase().includes('unique')) {
        setUsernameError('This username is already taken. Try another.')
      } else if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('invalid credentials')) {
        setErrorMessage('Invalid email or password.')
      } else if (msg.toLowerCase().includes('rate limit')) {
        setErrorMessage('Too many attempts. Please wait a few moments and try again.')
      } else {
        setErrorMessage(msg || 'An error occurred. Please try again.')
      }

      setPassword('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const switchQuery = nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation Bar (matching reference layout) */}
      <header className="border-b border-line bg-surface px-6 sm:px-10 h-16 flex items-center justify-between z-20">
        <div className="flex items-center gap-8">
          <Logo showText={true} imgClassName="h-10 w-auto" />
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted">
            <Link to="/" className="hover:text-text">
              Discussions
            </Link>
            <Link to="/?category=Review" className="hover:text-text">
              Reviews
            </Link>
            <Link to="/?category=Recommendation" className="hover:text-text">
              Recommendations
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {isSignup ? (
            <div className="flex items-center gap-2">
              <span className="text-muted hidden sm:inline">Already have an account?</span>
              <Link
                to={`/login${switchQuery}`}
                className="press border border-line-strong bg-surface px-3 py-1.5 font-bold text-text hover:bg-surface-hover"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-muted hidden sm:inline">New here?</span>
              <Link
                to={`/signup${switchQuery}`}
                className="press border border-accent-red bg-accent-red px-3.5 py-1.5 font-bold text-white hover:bg-accent-red-hover"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* LEFT COLUMN: Clean Centered Login / Registration Form */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 py-12 bg-surface">
          <div className="w-full max-w-sm space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-text">
                {isSignup ? 'Create an account' : 'Welcome back'}
              </h1>
              <p className="mt-1.5 text-xs text-muted">
                {isSignup
                  ? 'Join thousands of readers sharing candid book discussions.'
                  : 'Enter your credentials to access your bookshelf discussions.'}
              </p>
            </div>

            {!isSupabaseConfigured && (
              <div className="border border-line bg-surface-subtle p-3 text-xs text-muted">
                <strong>Offline preview mode:</strong> Supabase credentials are not configured yet.
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2 border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800"
              >
                <AlertCircle size={15} className="mt-0.5 shrink-0 text-accent-red" />
                <span>{errorMessage}</span>
              </div>
            )}

            {infoMessage && (
              <div role="status" className="border border-line bg-surface-subtle p-3 text-xs text-text">
                {infoMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div>
                  <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-text mb-1">
                    Username
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value)
                        setUsernameError('')
                      }}
                      maxLength={24}
                      required
                      placeholder="e.g. ReaderJane"
                      autoComplete="username"
                      className={`w-full border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent-blue ${
                        usernameError ? 'border-accent-red' : 'border-line-strong'
                      }`}
                      aria-invalid={Boolean(usernameError)}
                      aria-describedby={usernameError ? 'username-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={handleGenerateUsername}
                      title="Generate another pseudonym"
                      aria-label="Generate another pseudonym"
                      className="press inline-flex h-9.5 w-9.5 shrink-0 items-center justify-center border border-line-strong bg-surface text-muted hover:bg-surface-hover hover:text-text"
                    >
                      <Shuffle size={14} aria-hidden="true" />
                    </button>
                  </div>
                  {usernameError ? (
                    <p id="username-error" className="mt-1 text-xs text-accent-red">
                      {usernameError}
                    </p>
                  ) : (
                    <p className="mt-1 text-[0.7rem] text-muted">
                      3–24 characters. Generated automatically or choose your own handle.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-text mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  className="w-full border border-line-strong bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent-blue"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-text mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  className="w-full border border-line-strong bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent-blue"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="press mt-2 inline-flex h-10 w-full items-center justify-center gap-2 border border-accent-red bg-accent-red text-xs font-bold uppercase tracking-wider text-white hover:bg-accent-red-hover disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    <span>{isSignup ? 'Creating account...' : 'Logging in...'}</span>
                  </>
                ) : (
                  <span>{isSignup ? 'Sign Up' : 'Log In'}</span>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-muted border-t border-line">
              {isSignup ? (
                <>
                  Already have an account?{' '}
                  <Link to={`/login${switchQuery}`} className="font-bold text-accent-blue hover:underline">
                    Log in
                  </Link>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <Link to={`/signup${switchQuery}`} className="font-bold text-accent-blue hover:underline">
                    Sign up
                  </Link>
                </>
              )}
            </div>

            <div className="text-center pt-2">
              <Link to="/" className="text-xs text-muted hover:text-text hover:underline">
                ← Return to discussions
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Pinterest-style Book Gallery & Collage */}
        <div className="hidden lg:flex w-5/12 bg-[#faf8f5] border-l border-line p-8 xl:p-12 relative overflow-hidden items-center justify-center">
          {/* Subtle background grid & decorative starburst */}
          <div className="absolute top-10 right-12 text-black select-none pointer-events-none" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>

          <div className="absolute -bottom-10 -left-10 text-line select-none pointer-events-none" aria-hidden="true">
            <BookOpen size={160} strokeWidth={1} />
          </div>

          {/* Staggered Pinterest-style Book Collage */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md relative z-10">
            {/* Column 1 (offset downward) */}
            <div className="space-y-4 translate-y-4">
              {/* Pin 1: Tomorrow and Tomorrow Cover */}
              <div className="border border-line bg-surface p-2.5 shadow-sm space-y-2">
                <div className="overflow-hidden bg-surface-subtle aspect-[3/4]">
                  <img
                    src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
                    alt="Tomorrow, and Tomorrow, and Tomorrow"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-[0.7rem] space-y-0.5">
                  <span className="font-bold text-text block truncate">Tomorrow, and Tomorrow</span>
                  <span className="text-muted block text-[0.65rem]">★ 4.8 • Gabrielle Zevin</span>
                </div>
              </div>

              {/* Pin 2: Dune Cover */}
              <div className="border border-line bg-surface p-2.5 shadow-sm space-y-2">
                <div className="overflow-hidden bg-surface-subtle aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&w=600&q=80"
                    alt="Dune by Frank Herbert"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-[0.7rem] space-y-0.5">
                  <span className="font-bold text-text block truncate">Dune</span>
                  <span className="text-muted block text-[0.65rem]">Sci-fi Masterpiece</span>
                </div>
              </div>
            </div>

            {/* Column 2 (offset upward) */}
            <div className="space-y-4 -translate-y-4">
              {/* Pin 3: The Secret History */}
              <div className="border border-line bg-surface p-2.5 shadow-sm space-y-2">
                <div className="overflow-hidden bg-surface-subtle aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80"
                    alt="The Secret History by Donna Tartt"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-[0.7rem] space-y-0.5">
                  <span className="font-bold text-text block truncate">The Secret History</span>
                  <span className="text-muted block text-[0.65rem]">Donna Tartt</span>
                </div>
              </div>

              {/* Pin 4: Klara and the Sun */}
              <div className="border border-line bg-surface p-2.5 shadow-sm space-y-2">
                <div className="overflow-hidden bg-surface-subtle aspect-[3/4]">
                  <img
                    src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80"
                    alt="Klara and the Sun"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-[0.7rem] space-y-0.5">
                  <span className="font-bold text-text block truncate">Klara and the Sun</span>
                  <span className="text-muted block text-[0.65rem]">Kazuo Ishiguro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

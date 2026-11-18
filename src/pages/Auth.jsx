import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Shuffle, Loader2, AlertCircle } from 'lucide-react'
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

  // Form states with lazy initializers to avoid setState in effect
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

        // If no immediate session returned (e.g. if email confirmation is enabled on Supabase)
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

      // Clean, actionable error messages
      if (msg.toLowerCase().includes('already taken') || msg.toLowerCase().includes('unique')) {
        setUsernameError('This username is already taken. Try another.')
      } else if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('invalid credentials')) {
        setErrorMessage('Invalid email or password.')
      } else if (msg.toLowerCase().includes('rate limit')) {
        setErrorMessage('Too many attempts. Please wait a few moments and try again.')
      } else {
        setErrorMessage(msg || 'An error occurred. Please try again.')
      }

      // In accordance with plan §5: clear password on authentication failure
      setPassword('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const switchQuery = nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-text">
            {isSignup ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isSignup
              ? 'Join the discussion with your own pseudonymous handle'
              : 'Log in to continue sharing your book discussions'}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6 rounded-ui border border-input-border bg-soft p-3.5 text-xs text-muted">
            <strong>Preview mode:</strong> Supabase credentials are not configured yet. You can sign up or log in
            with any sample credentials to test the interface locally.
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-2.5 rounded-ui border border-accent/40 bg-accent/10 p-3.5 text-sm text-text"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div
            role="status"
            className="mb-6 rounded-ui border border-line bg-soft p-3.5 text-sm text-text"
          >
            {infoMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignup && (
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-text">
                Username
              </label>
              <div className="flex gap-2">
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
                  autoComplete="username"
                  className={`w-full rounded-ui border bg-surface px-3.5 py-2.5 text-base text-text outline-none transition-colors focus:border-text ${
                    usernameError ? 'border-accent' : 'border-input-border'
                  }`}
                  aria-invalid={Boolean(usernameError)}
                  aria-describedby={usernameError ? 'username-error' : undefined}
                />
                <button
                  type="button"
                  onClick={handleGenerateUsername}
                  title="Generate another username"
                  aria-label="Generate another username"
                  className="press inline-flex min-h-11 min-w-11 items-center justify-center rounded-ui border border-input-border bg-surface text-muted transition-colors hover:text-text"
                >
                  <Shuffle size={18} aria-hidden="true" />
                </button>
              </div>
              {usernameError ? (
                <p id="username-error" className="mt-1 text-xs text-accent">
                  {usernameError}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted">
                  3–24 characters. Generated automatically or choose your own.
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-text">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full rounded-ui border border-input-border bg-surface px-3.5 py-2.5 text-base text-text outline-none transition-colors focus:border-text"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-text">
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
              className="w-full rounded-ui border border-input-border bg-surface px-3.5 py-2.5 text-base text-text outline-none transition-colors focus:border-text"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="press mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-ui bg-text font-semibold text-background transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                <span>{isSignup ? 'Creating account...' : 'Logging in...'}</span>
              </>
            ) : (
              <span>{isSignup ? 'Create account' : 'Log in'}</span>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <Link to={`/login${switchQuery}`} className="font-semibold text-text underline">
                Log in
              </Link>
            </>
          ) : (
            <>
              New here?{' '}
              <Link to={`/signup${switchQuery}`} className="font-semibold text-text underline">
                Create an account
              </Link>
            </>
          )}
        </p>

        <p className="mt-4 text-center">
          <Link to="/" className="text-xs text-muted hover:underline">
            ← Back to community feed
          </Link>
        </p>
      </div>
    </div>
  )
}

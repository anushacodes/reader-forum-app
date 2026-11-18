import { Link, Outlet, useNavigate, useLocation } from 'react-router'
import { Moon, Plus, Search, Sun, LogOut } from 'lucide-react'
import Logo from './Logo.jsx'
import { useTheme } from '../lib/theme.js'
import { useAuth } from '../lib/auth.jsx'

export default function Layout() {
  const { theme, toggleTheme } = useTheme()
  const { user, username, isAuthenticated, loading, logout, isSupabaseConfigured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      <a
        href="#main"
        className="fixed top-4 left-4 z-20 -translate-y-[200%] border border-input-border bg-surface px-4 py-3 focus:translate-y-0"
      >
        Skip to content
      </a>

      {!isSupabaseConfigured && (
        <div className="border-b border-line bg-soft py-2 text-center text-xs text-muted">
          <span>Running in local preview mode. Add your Supabase credentials to <code>.env.local</code> to enable live database persistence.</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <header className="flex min-h-[6.5rem] items-center gap-4 border-b border-line md:gap-8">
          <Logo />

          <label className="hidden min-h-12 max-w-[27.5rem] flex-1 items-center gap-3 rounded-ui border border-transparent bg-soft px-4 text-muted focus-within:border-input-border md:flex">
            <Search size={20} strokeWidth={1.5} aria-hidden="true" />
            <span className="sr-only">Search post titles</span>
            <input
              type="search"
              placeholder="Search titles"
              maxLength={160}
              className="w-full min-w-0 border-0 bg-transparent py-2.5 text-base text-text outline-none placeholder:text-muted"
            />
          </label>

          <div className="ml-auto flex items-center gap-3 whitespace-nowrap md:gap-6">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="press inline-flex min-h-12 min-w-12 items-center justify-center rounded-ui text-muted transition-colors hover:text-text"
            >
              {theme === 'dark' ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
            </button>

            {/* Auth area: no flash while loading */}
            {loading ? (
              <div className="h-6 w-16 animate-pulse rounded bg-soft" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="font-semibold text-text" title={`Signed in as ${username || user?.email}`}>
                  {username || 'Reader'}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="press inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <Link
                to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
                className="text-sm font-semibold text-text underline"
              >
                Log in
              </Link>
            )}

            <Link
              to="/create"
              className="press inline-flex min-h-12 items-center gap-2 rounded-ui bg-text px-4 font-semibold text-background no-underline sm:px-5"
            >
              <Plus size={20} strokeWidth={2} aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">New post</span>
            </Link>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="py-8">
          <Outlet />
        </main>
      </div>
    </>
  )
}

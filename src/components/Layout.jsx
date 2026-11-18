import { Link, Outlet } from 'react-router'
import { Moon, Plus, Search, Sun } from 'lucide-react'
import Logo from './Logo.jsx'
import { useTheme } from '../lib/theme.js'

/**
 * Shared header + page shell. Search, auth state and the signed-in username
 * are wired up in later tasks (see TASKS.md).
 */
export default function Layout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <a
        href="#main"
        className="fixed top-4 left-4 z-20 -translate-y-[200%] border border-input-border bg-surface px-4 py-3 focus:translate-y-0"
      >
        Skip to content
      </a>
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
              className="press inline-flex min-h-12 min-w-12 items-center justify-center rounded-ui text-muted"
            >
              {theme === 'dark' ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
            </button>
            <Link to="/login" className="text-muted underline">
              Log in
            </Link>
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

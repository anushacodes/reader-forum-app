import { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation, useSearchParams } from 'react-router'
import { Plus, Search, LogOut, MessageSquare, Tag, Menu, X } from 'lucide-react'
import Logo from './Logo.jsx'
import { useAuth } from '../lib/authContext.js'
import { ALL_CATEGORIES } from '../lib/categories.js'

export default function Layout() {
  const { username, isAuthenticated, loading, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const currentQuery = searchParams.get('q') || ''
  const [headerSearch, setHeaderSearch] = useState(currentQuery)
  const [prevQuery, setPrevQuery] = useState(currentQuery)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (prevQuery !== currentQuery) {
    setPrevQuery(currentQuery)
    setHeaderSearch(currentQuery)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const trimmed = headerSearch.trim()
    if (trimmed) {
      navigate(`/?q=${encodeURIComponent(trimmed)}`)
    } else if (location.pathname === '/' && currentQuery) {
      navigate('/')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isCurrentCategory = (cat) => {
    if (location.pathname !== '/') return false
    if (cat === 'All') return !searchParams.get('category') || searchParams.get('category') === 'All'
    return searchParams.get('category') === cat
  }

  const getTagIndicatorColor = (cat) => {
    switch (cat) {
      case 'Review':
        return 'bg-amber-700'
      case 'Recommendation':
        return 'bg-blue-600'
      case 'Question':
        return 'bg-indigo-600'
      case 'Opinion':
        return 'bg-rose-600'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <>
      <a
        href="#main"
        className="fixed top-2 left-2 z-50 -translate-y-[200%] border border-text bg-surface px-3 py-1 text-xs font-medium focus:translate-y-0"
      >
        Skip to content
      </a>

      {/* Responsive Shell: Left Sidebar + Main Content */}
      <div className="flex min-h-screen bg-background">
        {/* Mobile Header Bar (< md screens) */}
        <div className="flex h-16 w-full items-center justify-between border-b border-line/70 bg-surface px-4 md:hidden fixed top-0 z-40">
          <Logo showText={true} imgClassName="h-10 w-auto" />
          <div className="flex items-center gap-2">
            {!isAuthenticated && !loading && (
              <Link
                to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
                className="press px-2.5 py-2 text-xs font-semibold"
              >
                Log In
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="press p-2 text-text hover:bg-surface-hover"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* LEFT PANEL / SIDEBAR NAVIGATION */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface transition-transform duration-200 md:static md:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Brand */}
          <div className="flex h-16 items-center justify-center px-4">
            <Logo showText={true} imgClassName="h-12 w-auto" className="w-full justify-center" />
          </div>

          {/* Sidebar Action Button */}
          <div className="px-5 py-5">
            <Link
              to="/create"
              onClick={() => setMobileMenuOpen(false)}
              className="press flex w-full items-center justify-center gap-2 bg-accent-red px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-accent-red-hover"
            >
              <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
              <span>Create Post</span>
            </Link>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6" aria-label="Sidebar Navigation">
            {/* Discussions Section */}
            <div>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm font-semibold border-l-2 ${
                  location.pathname === '/' && (!searchParams.get('category') || searchParams.get('category') === 'All') && !currentQuery
                    ? 'border-accent-red bg-surface-subtle text-text'
                    : 'border-transparent text-text hover:bg-surface-subtle'
                }`}
              >
                <MessageSquare size={16} strokeWidth={2.2} />
                <span>All Discussions</span>
              </Link>
            </div>

            {/* Tags / Categories Submenu */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 px-3 text-[0.7rem] font-bold uppercase tracking-wider text-muted">
                <Tag size={12} />
                <span>Browse by Tag</span>
              </div>

              <div className="flex flex-col space-y-1 pt-1">
                {ALL_CATEGORIES.map((cat) => {
                  const active = isCurrentCategory(cat)
                  return (
                    <Link
                      key={cat}
                      to={cat === 'All' ? '/' : `/?category=${encodeURIComponent(cat)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium border-l-2 transition-colors ${
                        active
                          ? 'border-accent-red bg-surface-subtle text-text font-semibold'
                          : 'border-transparent text-muted hover:bg-surface-subtle hover:text-text'
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 shrink-0 ${getTagIndicatorColor(cat)}`} aria-hidden="true" />
                      <span>{cat === 'All' ? 'All Tags' : cat}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* Sidebar Footer: Clean minimal user display */}
          <div className="border-t border-line/70 px-6 py-5">
            {loading ? (
              <div className="h-8 animate-pulse bg-line" />
            ) : isAuthenticated ? (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block min-w-0 text-xs group"
                title="View your profile"
              >
                <div className="min-w-0">
                  <span className="text-muted block text-[0.65rem] font-bold uppercase tracking-wider">
                    Signed in as
                  </span>
                  <strong className="text-text font-bold truncate block group-hover:underline" title={username}>
                    @{username || 'reader'}
                  </strong>
                </div>
              </Link>
            ) : (
              <div className="space-y-2">
                <p className="text-[0.75rem] text-muted">Join the book community.</p>
                <div className="flex gap-2">
                  <Link
                    to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="press flex-1 flex items-center justify-center py-2 text-xs font-bold text-text hover:bg-surface-hover"
                  >
                    Log In
                  </Link>
                  <Link
                    to={`/signup?next=${encodeURIComponent(location.pathname + location.search)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="press flex-1 flex items-center justify-center bg-accent-red py-2 text-xs font-bold text-white hover:bg-accent-red-hover"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile menu backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* RIGHT MAIN AREA */}
        <div className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">
          {/* Top Header Bar: Search on Left, User Profile / Auth on Top Right */}
          <header className="h-16 flex items-center border-b border-line/70 bg-background px-4 sm:px-8">
            <div className="flex w-full items-center justify-between gap-4">
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} role="search" className="min-w-0 flex-1 max-w-md">
                <div className="flex items-center gap-1 rounded-[3px] bg-surface-subtle px-3 py-2.5 text-muted focus-within:ring-1 focus-within:ring-accent-blue">
                  <Search size={14} className="text-muted shrink-0 mr-2" aria-hidden="true" />
                  <label htmlFor="header-search" className="sr-only">Search discussions</label>
                  <input
                    id="header-search"
                    type="search"
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    placeholder="Search discussion titles..."
                    maxLength={160}
                    className="w-full min-w-0 border-0 bg-transparent text-xs text-text outline-none placeholder:text-muted/70"
                  />
                </div>
              </form>

              {/* Account link and sign out */}
              <div className="flex shrink-0 items-center gap-2 text-xs">
                {loading ? (
                  <div className="h-7 w-20 animate-pulse bg-surface-subtle" />
                ) : isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/profile"
                      className="press flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-text hover:bg-surface-hover"
                      title="View profile and settings"
                    >
                      <span className="max-w-24 truncate font-semibold text-text sm:max-w-none" title={username}>
                        @{username || 'reader'}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="press px-2.5 py-2 text-muted hover:text-accent-red hover:bg-surface-subtle"
                      title="Sign out"
                    >
                      <LogOut size={13} className="sm:mr-1 inline" />
                      <span className="hidden sm:inline">Sign out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
                      className="press px-3 py-2 font-semibold text-text hover:bg-surface-hover"
                    >
                      Log In
                    </Link>
                    <Link
                      to={`/signup?next=${encodeURIComponent(location.pathname + location.search)}`}
                      className="press bg-accent-red px-3 py-2 font-semibold text-white hover:bg-accent-red-hover"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Page Route View */}
          <main id="main" className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}

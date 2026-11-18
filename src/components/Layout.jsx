import { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation, useSearchParams } from 'react-router'
import { Plus, Search, LogOut, MessageSquare, Tag, Menu, X, User, KeyRound } from 'lucide-react'
import Logo from './Logo.jsx'
import ChangePasswordModal from './ChangePasswordModal.jsx'
import { useAuth } from '../lib/auth.jsx'
import { ALL_CATEGORIES } from '../lib/posts.js'

export default function Layout() {
  const { username, isAuthenticated, loading, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const currentQuery = searchParams.get('q') || ''
  const [headerSearch, setHeaderSearch] = useState(currentQuery)
  const [prevQuery, setPrevQuery] = useState(currentQuery)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

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

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Responsive Shell: Left Sidebar + Main Content */}
      <div className="flex min-h-screen bg-background">
        {/* Mobile Header Bar (< md screens) */}
        <div className="flex h-16 w-full items-center justify-between border-b border-line bg-surface px-4 md:hidden fixed top-0 z-40">
          <Logo showText={false} imgClassName="h-11 w-auto" />
          <div className="flex items-center gap-2">
            {!isAuthenticated && !loading && (
              <Link
                to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
                className="press border border-line-strong px-2.5 py-1 text-xs font-semibold"
              >
                Log In
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="press p-1.5 border border-line-strong text-text"
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
          {/* Logo Area — Big, prominent dog logo with no text */}
          <div className="flex min-h-[5.5rem] items-center border-b border-line px-5 py-3">
            <Logo showText={false} imgClassName="h-16 sm:h-18 w-auto" />
          </div>

          {/* Sidebar Action Button */}
          <div className="p-4 border-b border-line">
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
                className={`flex items-center gap-2.5 px-3 py-2 text-sm font-bold border ${
                  location.pathname === '/' && (!searchParams.get('category') || searchParams.get('category') === 'All') && !currentQuery
                    ? 'border-text bg-text text-background'
                    : 'border-transparent text-text hover:border-line hover:bg-surface-subtle'
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
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold border transition-colors ${
                        active
                          ? 'border-line-strong bg-surface-hover text-text font-bold'
                          : 'border-transparent text-muted hover:border-line hover:bg-surface-subtle hover:text-text'
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

          {/* Sidebar Footer: User / Auth Profile */}
          <div className="border-t border-line p-4 bg-surface-subtle">
            {loading ? (
              <div className="h-8 animate-pulse bg-line" />
            ) : isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-muted block text-[0.7rem]">Signed in as</span>
                    <strong className="text-text font-bold" title={username}>
                      @{username || 'reader'}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="press flex items-center gap-1 border border-line-strong bg-surface px-2 py-1 text-[0.7rem] font-semibold text-muted hover:text-accent-red hover:border-accent-red"
                    title="Sign out"
                  >
                    <LogOut size={12} />
                    <span>Sign out</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="press flex w-full items-center justify-center gap-1.5 border border-line-strong bg-surface px-2 py-1 text-[0.7rem] font-semibold text-text hover:bg-surface-hover"
                >
                  <KeyRound size={12} />
                  <span>Change Password</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[0.75rem] text-muted">Join the book community.</p>
                <div className="flex gap-2">
                  <Link
                    to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="press flex-1 flex items-center justify-center border border-line-strong bg-surface py-1.5 text-xs font-bold text-text hover:bg-surface-hover"
                  >
                    Log In
                  </Link>
                  <Link
                    to={`/signup?next=${encodeURIComponent(location.pathname + location.search)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="press flex-1 flex items-center justify-center border border-accent-red bg-accent-red py-1.5 text-xs font-bold text-white hover:bg-accent-red-hover"
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
          <header className="border-b border-line bg-surface px-4 sm:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} role="search" className="flex-1 max-w-md">
                <div className="flex items-center border border-line-strong bg-surface px-2.5 py-1.5 text-muted focus-within:border-accent-blue">
                  <Search size={14} className="text-muted shrink-0 mr-2" aria-hidden="true" />
                  <span className="sr-only">Search discussions</span>
                  <input
                    type="search"
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    placeholder="Search books, authors, discussions..."
                    maxLength={160}
                    className="w-full min-w-0 border-0 bg-transparent text-xs text-text outline-none placeholder:text-muted/70"
                  />
                </div>
              </form>

              {/* TOP RIGHT CORNER: Profile name / Change Password / Sign out OR Login + Sign up */}
              <div className="flex items-center gap-2 text-xs">
                {loading ? (
                  <div className="h-7 w-20 animate-pulse bg-surface-subtle" />
                ) : isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 border border-line-strong bg-surface px-2.5 py-1 text-xs">
                      <User size={13} className="text-muted" />
                      <span className="font-bold text-text" title={username}>
                        @{username || 'reader'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="press border border-line-strong bg-surface px-2.5 py-1 font-semibold text-text hover:bg-surface-hover"
                      title="Change your password"
                    >
                      <span className="hidden sm:inline">Change </span>Password
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="press border border-line-strong bg-surface px-2.5 py-1 text-muted hover:text-accent-red hover:border-accent-red"
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
                      className="press border border-line-strong bg-surface px-3 py-1 font-semibold text-text hover:bg-surface-hover"
                    >
                      Log In
                    </Link>
                    <Link
                      to={`/signup?next=${encodeURIComponent(location.pathname + location.search)}`}
                      className="press border border-accent-red bg-accent-red px-3 py-1 font-semibold text-white hover:bg-accent-red-hover"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Outlet */}
          <main id="main" tabIndex={-1} className="flex-1 p-4 sm:p-8 max-w-5xl">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}

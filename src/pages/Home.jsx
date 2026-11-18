import { useState, useEffect, useCallback, useTransition } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { Search, LayoutList, LayoutGrid, AlertCircle, Plus, RefreshCw, X } from 'lucide-react'
import { listPosts, upvotePost, ALL_CATEGORIES } from '../lib/posts.js'
import PostCard from '../components/PostCard.jsx'
import { FeedSkeleton } from '../components/Skeleton.jsx'
import { useAuth } from '../lib/auth.jsx'

const FEED_VIEW_STORAGE_KEY = 'dogear.feedView'
const PAGE_SIZE = 12

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [, startTransition] = useTransition()

  // Read URL query params
  const activeSearch = searchParams.get('q') || ''
  const activeCategory = searchParams.get('category') || 'All'
  const sortMode = searchParams.get('sort') || 'newest'
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

  // Local state for view preference (defaults to compact per CodePath rubric)
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem(FEED_VIEW_STORAGE_KEY)
      return saved === 'visual' ? 'visual' : 'compact'
    } catch {
      return 'compact'
    }
  })

  // Search input state (debounced)
  const [searchInput, setSearchInput] = useState(activeSearch)

  // Posts state
  const [posts, setPosts] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  // Persist view mode preference
  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    try {
      localStorage.setItem(FEED_VIEW_STORAGE_KEY, mode)
    } catch {
      // ignore storage error
    }
  }

  // Update URL params helper
  const updateFilters = useCallback(
    (newParams) => {
      startTransition(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          Object.entries(newParams).forEach(([key, val]) => {
            if (val === null || val === undefined || val === '' || (key === 'category' && val === 'All') || (key === 'page' && val === 1) || (key === 'sort' && val === 'newest')) {
              next.delete(key)
            } else {
              next.set(key, String(val))
            }
          })
          return next
        })
      })
    },
    [setSearchParams]
  )

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== activeSearch) {
        updateFilters({ q: searchInput.trim(), page: 1 })
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [searchInput, activeSearch, updateFilters])

  // Sync search input if URL changes externally
  const [prevSearchParam, setPrevSearchParam] = useState(activeSearch)
  if (prevSearchParam !== activeSearch) {
    setPrevSearchParam(activeSearch)
    setSearchInput(activeSearch)
  }

  // Fetch posts from database
  const loadPosts = useCallback(() => {
    let mounted = true
    setFetchError(null)

    listPosts({
      search: activeSearch,
      category: activeCategory,
      sort: sortMode,
      page: currentPage,
      pageSize: PAGE_SIZE,
    })
      .then(({ posts: fetchedPosts, totalCount: count }) => {
        if (!mounted) return
        setPosts(fetchedPosts)
        setTotalCount(count)
      })
      .catch((err) => {
        if (!mounted) return
        console.error('Failed to fetch posts:', err)
        setFetchError('Could not load discussions. Please try again.')
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [activeSearch, activeCategory, sortMode, currentPage])

  useEffect(() => {
    const cleanup = loadPosts()
    return cleanup
  }, [loadPosts])

  // Handle upvote from feed
  const handleUpvote = async (postId) => {
    if (!isAuthenticated) {
      navigate('/login?next=' + encodeURIComponent(window.location.pathname + window.location.search))
      return
    }

    return await upvotePost(postId)
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const isFiltered = Boolean(activeSearch || activeCategory !== 'All' || sortMode !== 'newest')

  const handleClearFilters = () => {
    setSearchInput('')
    updateFilters({ q: '', category: 'All', sort: 'newest', page: 1 })
  }

  return (
    <div className="space-y-6">
      {/* Feed Toolbar / Controls */}
      <section aria-label="Feed controls" className="flex flex-col gap-4 border-b border-line pb-6">
        {/* Top row: Search input + View mode toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[15rem] max-w-lg">
            <Search
              size={18}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search discussions by title..."
              maxLength={160}
              className="w-full rounded-ui border border-input-border bg-surface py-2.5 pl-10 pr-9 text-base text-text outline-none transition-colors focus:border-text placeholder:text-muted"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher: Compact vs Visual */}
            <div className="flex items-center rounded-ui border border-input-border bg-surface p-1">
              <button
                type="button"
                onClick={() => handleViewModeChange('compact')}
                aria-pressed={viewMode === 'compact'}
                title="Compact view (titles & votes only)"
                aria-label="Compact view"
                className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === 'compact' ? 'bg-text text-background' : 'text-muted hover:text-text'
                }`}
              >
                <LayoutList size={15} />
                <span className="hidden sm:inline">Compact</span>
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('visual')}
                aria-pressed={viewMode === 'visual'}
                title="Visual view (with images)"
                aria-label="Visual view"
                className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === 'visual' ? 'bg-text text-background' : 'text-muted hover:text-text'
                }`}
              >
                <LayoutGrid size={15} />
                <span className="hidden sm:inline">Visual</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom row: Category filter tabs/select & Sort dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            {ALL_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => updateFilters({ category: cat, page: 1 })}
                  className={`press rounded-ui px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-text text-background'
                      : 'border border-line bg-surface text-muted hover:border-input-border hover:text-text'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 text-xs text-muted">
            <label htmlFor="feed-sort" className="font-medium">
              Sort:
            </label>
            <select
              id="feed-sort"
              value={sortMode}
              onChange={(e) => updateFilters({ sort: e.target.value, page: 1 })}
              className="rounded-ui border border-input-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text outline-none transition-colors focus:border-text"
            >
              <option value="newest">Newest first</option>
              <option value="upvotes">Most upvoted</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Feed Content */}
      <section aria-label="Discussions feed" className="min-h-[40vh]">
        {isLoading ? (
          <FeedSkeleton count={6} viewMode={viewMode} />
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertCircle size={32} className="text-accent" aria-hidden="true" />
            <p className="text-sm font-semibold text-text">{fetchError}</p>
            <button
              type="button"
              onClick={loadPosts}
              className="press inline-flex items-center gap-1.5 rounded-ui border border-input-border bg-surface px-4 py-2 text-xs font-semibold text-text hover:border-text"
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            {isFiltered ? (
              <>
                <p className="text-base text-text">No discussions found matching your filters.</p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="press inline-flex items-center rounded-ui border border-input-border bg-surface px-4 py-2 text-xs font-semibold text-text hover:border-text"
                >
                  Clear all filters
                </button>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-text">No discussions yet</p>
                <p className="max-w-sm text-sm text-muted">
                  Be the first to share a thought, ask a question, or review a book!
                </p>
                <Link
                  to="/create"
                  className="press mt-2 inline-flex items-center gap-2 rounded-ui bg-text px-5 py-2.5 font-semibold text-background"
                >
                  <Plus size={18} />
                  <span>Start a discussion</span>
                </Link>
              </>
            )}
          </div>
        ) : viewMode === 'visual' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} viewMode="visual" onUpvote={handleUpvote} />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-line">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} viewMode="compact" onUpvote={handleUpvote} />
            ))}
          </div>
        )}
      </section>

      {/* Pagination Controls */}
      {totalPages > 1 && !isLoading && !fetchError && (
        <nav aria-label="Pagination" className="flex items-center justify-between border-t border-line pt-6">
          <p className="text-xs text-muted">
            Page <span className="font-semibold text-text">{currentPage}</span> of{' '}
            <span className="font-semibold text-text">{totalPages}</span> ({totalCount} total)
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => updateFilters({ page: currentPage - 1 })}
              className="press inline-flex min-h-9 items-center justify-center rounded-ui border border-input-border bg-surface px-3 text-xs font-semibold text-text transition-colors hover:border-text disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => updateFilters({ page: currentPage + 1 })}
              className="press inline-flex min-h-9 items-center justify-center rounded-ui border border-input-border bg-surface px-3 text-xs font-semibold text-text transition-colors hover:border-text disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}

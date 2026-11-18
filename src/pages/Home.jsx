import { useState, useEffect, useCallback, useTransition } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { AlertCircle, RefreshCw, X } from 'lucide-react'
import { listPosts, upvotePost } from '../lib/posts.js'
import PostCard from '../components/PostCard.jsx'
import { FeedSkeleton } from '../components/Skeleton.jsx'
import { useAuth } from '../lib/authContext.js'

const PAGE_SIZE = 50

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [, startTransition] = useTransition()

  // Read URL query params
  const activeSearch = searchParams.get('q') || ''
  const activeCategory = searchParams.get('category') || 'All'
  const sortMode = searchParams.get('sort') || 'newest'
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)

  // Search input state (debounced)
  const [searchInput, setSearchInput] = useState(activeSearch)

  const [retryCount, setRetryCount] = useState(0)
  const requestKey = JSON.stringify([activeSearch, activeCategory, sortMode, currentPage, retryCount])
  const [feed, setFeed] = useState({ posts: [], totalCount: 0, error: null, requestKey: null })
  const { posts, totalCount, error: fetchError } = feed
  const isLoading = feed.requestKey !== requestKey

  // Update URL params helper
  const updateFilters = useCallback(
    (newParams) => {
      startTransition(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          Object.entries(newParams).forEach(([key, val]) => {
            if (
              val === null ||
              val === undefined ||
              val === '' ||
              (key === 'category' && val === 'All') ||
              (key === 'page' && val === 1) ||
              (key === 'sort' && val === 'newest')
            ) {
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

  // One loading path handles filter changes and retries.
  useEffect(() => {
    let ignore = false
    listPosts({
      search: activeSearch,
      category: activeCategory,
      sort: sortMode,
      page: currentPage,
      pageSize: PAGE_SIZE,
    })
      .then(({ posts: fetchedPosts, totalCount: count }) => {
        if (ignore) return
        setFeed({ posts: fetchedPosts, totalCount: count, error: null, requestKey })
      })
      .catch((err) => {
        if (ignore) return
        console.error('Failed to fetch posts:', err)
        setFeed((previous) => ({
          ...previous,
          error: 'Could not load discussions. Please try again.',
          requestKey,
        }))
      })

    return () => {
      ignore = true
    }
  }, [activeSearch, activeCategory, sortMode, currentPage, requestKey])

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
    <div className="space-y-4">
      {/* Top Filter & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-text">
            {activeCategory === 'All' ? 'Discussions' : `${activeCategory}s`}
          </h1>
          <span className="text-xs text-muted">({totalCount})</span>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span>Sort:</span>
          <select
            id="feed-sort"
            value={sortMode}
            onChange={(e) => updateFilters({ sort: e.target.value, page: 1 })}
            aria-label="Sort discussions"
            className="border-0 bg-transparent px-2 py-2 text-xs font-medium text-text outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="upvotes">Most upvoted</option>
          </select>
        </div>
      </div>

      {/* Active Search Summary */}
      {activeSearch && (
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>
            Searching for <strong>"{activeSearch}"</strong>
          </span>
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center gap-0.5 text-accent-red font-semibold hover:underline"
          >
            <X size={12} />
            <span>Clear</span>
          </button>
        </div>
      )}

      {/* Main Reddit-Style List Feed Content */}
      <section aria-label="Discussions list" className="min-h-[40vh]">
        {isLoading ? (
          <FeedSkeleton count={6} />
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
            <AlertCircle size={32} className="text-accent-red" aria-hidden="true" />
            <p className="text-sm font-semibold text-text">{fetchError}</p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="press inline-flex items-center gap-1.5 bg-surface-subtle px-4 py-2 text-xs font-semibold text-text hover:bg-surface-hover"
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-6">
            {isFiltered ? (
              <>
                <p className="text-base font-semibold text-text">No discussions match your filter.</p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="press mt-2 bg-surface-subtle px-3 py-2 text-xs font-semibold text-text hover:bg-surface-hover"
                >
                  Clear all filters
                </button>
              </>
            ) : (
              <>
                <p className="text-base font-bold text-text">No posts yet.</p>
                <p className="text-xs text-muted">Be the first to start a book discussion.</p>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onUpvote={handleUpvote} />
            ))}
          </div>
        )}
      </section>

      {/* Pagination Controls */}
      {totalPages > 1 && !isLoading && !fetchError && (
        <nav aria-label="Pagination" className="flex items-center justify-between border-t border-line pt-4 text-xs">
          <p className="text-muted">
            Page <strong className="text-text">{currentPage}</strong> of{' '}
            <strong className="text-text">{totalPages}</strong>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => updateFilters({ page: currentPage - 1 })}
              className="press px-3 py-2 font-semibold text-text hover:bg-surface-hover disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => updateFilters({ page: currentPage + 1 })}
              className="press px-3 py-2 font-semibold text-text hover:bg-surface-hover disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}

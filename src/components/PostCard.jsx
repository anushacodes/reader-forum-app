import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowUp, BookOpen } from 'lucide-react'
import { formatTimeAgo } from '../lib/date.js'

export default function PostCard({ post, viewMode = 'compact', onUpvote }) {
  const [votes, setVotes] = useState(post.upvotes ?? 0)
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleUpvoteClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isUpvoting || !onUpvote) return

    setIsUpvoting(true)
    try {
      const newTotal = await onUpvote(post.id)
      if (typeof newTotal === 'number') {
        setVotes(newTotal)
      } else {
        setVotes((v) => v + 1)
      }
    } catch (err) {
      console.error('Error upvoting:', err)
    } finally {
      setIsUpvoting(false)
    }
  }

  // --- 1. COMPACT MODE (Default CodePath Rubric) ---
  // "By default, show only each post's creation time, title, and upvote count."
  if (viewMode === 'compact') {
    return (
      <article className="flex items-center justify-between gap-4 border-b border-line py-4 transition-colors hover:bg-soft/40">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">
            <time dateTime={post.created_at}>{formatTimeAgo(post.created_at)}</time>
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-text">
            <Link
              to={`/posts/${post.id}`}
              className="hover:underline focus:underline focus:outline-none"
            >
              {post.title}
            </Link>
          </h2>
        </div>

        <button
          type="button"
          onClick={handleUpvoteClick}
          disabled={isUpvoting}
          aria-label={`Upvote post: ${post.title}. Current count: ${votes}`}
          className="press inline-flex min-h-10 min-w-14 shrink-0 items-center justify-center gap-1.5 rounded-ui border border-input-border bg-surface px-3 text-sm font-semibold text-text transition-colors hover:border-text"
        >
          <ArrowUp size={16} strokeWidth={2} aria-hidden="true" />
          <span>{votes}</span>
        </button>
      </article>
    )
  }

  // --- 2. VISUAL MODE (Opt-in Image Grid) ---
  return (
    <article className="flex flex-col overflow-hidden rounded-ui border border-line bg-surface transition-shadow hover:shadow-sm">
      {/* Image or typographic fallback */}
      <Link to={`/posts/${post.id}`} className="group block overflow-hidden bg-soft" tabIndex={-1}>
        {post.image_url && !imageError ? (
          <div className="flex max-h-56 min-h-48 w-full items-center justify-center overflow-hidden bg-soft">
            <img
              src={post.image_url}
              alt={post.title}
              onError={() => setImageError(true)}
              loading="lazy"
              className="h-48 w-full object-cover transition-transform duration-200 group-hover:scale-102"
            />
          </div>
        ) : (
          <div className="flex h-44 w-full flex-col items-center justify-center gap-2 bg-soft/80 p-6 text-center text-muted">
            <BookOpen size={28} strokeWidth={1.5} className="opacity-60" />
            <span className="text-xs tracking-wider uppercase">{post.category || 'Opinion'}</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span className="rounded bg-soft px-2 py-0.5 font-medium">{post.category}</span>
          <time dateTime={post.created_at}>{formatTimeAgo(post.created_at)}</time>
        </div>

        <h2 className="mb-2 text-lg font-semibold tracking-tight text-text">
          <Link to={`/posts/${post.id}`} className="hover:underline focus:outline-none">
            {post.title}
          </Link>
        </h2>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-line/60">
          <span className="text-xs text-muted">
            by <span className="font-medium text-text">{post.author || 'Reader'}</span>
          </span>

          <button
            type="button"
            onClick={handleUpvoteClick}
            disabled={isUpvoting}
            aria-label={`Upvote post: ${post.title}. Current count: ${votes}`}
            className="press inline-flex min-h-9 min-w-12 items-center justify-center gap-1 rounded-ui border border-input-border bg-surface px-2.5 text-xs font-semibold text-text transition-colors hover:border-text"
          >
            <ArrowUp size={14} strokeWidth={2} aria-hidden="true" />
            <span>{votes}</span>
          </button>
        </div>
      </div>
    </article>
  )
}

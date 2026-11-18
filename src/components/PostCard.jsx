import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowUp, BookOpen, MessageSquare } from 'lucide-react'
import { formatTimeAgo } from '../lib/date.js'
import { getCategoryBadgeClasses } from '../lib/categories.js'

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

  const categoryBadgeClass = getCategoryBadgeClasses(post.category)

  // --- 1. COMPACT MODE (Clean Reddit + forum list, sharp rectilinear borders) ---
  if (viewMode === 'compact') {
    return (
      <article className="flex items-start gap-3.5 border-b border-line bg-surface p-3 transition-colors hover:bg-surface-subtle">
        {/* Sharp Rectangular Upvote Button */}
        <button
          type="button"
          onClick={handleUpvoteClick}
          disabled={isUpvoting}
          aria-label={`Upvote discussion: ${post.title}. Current count: ${votes}`}
          className="press flex h-12 w-10 shrink-0 flex-col items-center justify-center border border-line-strong bg-surface text-muted hover:border-accent-red hover:bg-rose-50 hover:text-accent-red dark:hover:bg-rose-950/30"
        >
          <ArrowUp size={15} strokeWidth={2.5} aria-hidden="true" />
          <span className="text-xs font-bold tabular-nums text-text">{votes}</span>
        </button>

        {/* Content Column */}
        <div className="min-w-0 flex-1">
          {/* Metadata */}
          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
            {post.category && (
              <span className={`inline-block px-1.5 py-0.5 text-[0.7rem] font-bold tracking-wide uppercase ${categoryBadgeClass}`}>
                {post.category}
              </span>
            )}
            <span className="text-muted text-[0.75rem]">
              <time dateTime={post.created_at}>{formatTimeAgo(post.created_at)}</time>
            </span>
            {post.author && (
              <span className="text-muted text-[0.75rem]">
                by <span className="font-medium text-text">{post.author}</span>
              </span>
            )}
          </div>

          {/* Title Link */}
          <h2 className="text-base font-semibold leading-snug text-text">
            <Link
              to={`/posts/${post.id}`}
              className="hover:text-accent-blue hover:underline focus:outline-none"
            >
              {post.title}
            </Link>
          </h2>
        </div>

        {/* Book Thumbnail */}
        {post.image_url && !imageError && (
          <Link
            to={`/posts/${post.id}`}
            className="hidden shrink-0 sm:block"
            tabIndex={-1}
            aria-hidden="true"
          >
            <img
              src={post.image_url}
              alt=""
              onError={() => setImageError(true)}
              loading="lazy"
              className="h-16 w-12 border border-line-strong object-cover"
            />
          </Link>
        )}
      </article>
    )
  }

  // --- 2. VISUAL MODE (Sharp rectilinear book grid) ---
  return (
    <article className="flex flex-col border border-line bg-surface p-4 transition-colors hover:border-line-strong">
      {/* Cover Viewport */}
      <Link
        to={`/posts/${post.id}`}
        className="block border border-line bg-surface-subtle"
        tabIndex={-1}
      >
        {post.image_url && !imageError ? (
          <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-surface-subtle">
            <img
              src={post.image_url}
              alt={post.title}
              onError={() => setImageError(true)}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 bg-surface-subtle p-6 text-center text-muted">
            <BookOpen size={28} strokeWidth={1.5} className="text-accent-blue" />
            <span className="text-xs font-semibold uppercase text-muted">
              {post.category || 'Discussion'}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        {/* Category & Time */}
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className={`inline-block px-1.5 py-0.5 text-[0.7rem] font-bold uppercase ${categoryBadgeClass}`}>
            {post.category}
          </span>
          <time dateTime={post.created_at} className="text-[0.75rem] text-muted">
            {formatTimeAgo(post.created_at)}
          </time>
        </div>

        {/* Title */}
        <h2 className="mb-3 text-base font-semibold text-text leading-snug">
          <Link
            to={`/posts/${post.id}`}
            className="hover:text-accent-blue hover:underline focus:outline-none"
          >
            {post.title}
          </Link>
        </h2>

        {/* Footer: Author, Comments & Upvote */}
        <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
          <span>
            by <strong className="font-semibold text-text">{post.author || 'Reader'}</strong>
          </span>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[0.7rem] text-muted" title={`${post.commentsCount ?? 0} comments`}>
              <MessageSquare size={12} />
              <span>{post.commentsCount ?? 0}</span>
            </span>

            <button
              type="button"
              onClick={handleUpvoteClick}
              disabled={isUpvoting}
              aria-label={`Upvote discussion: ${post.title}. Current count: ${votes}`}
              className="press inline-flex h-7 items-center justify-center gap-1 border border-line-strong bg-surface px-2.5 text-xs font-semibold text-text hover:border-accent-red hover:text-accent-red"
            >
              <ArrowUp size={13} strokeWidth={2.5} aria-hidden="true" />
              <span className="tabular-nums">{votes}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

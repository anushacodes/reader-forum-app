import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowUp, MessageSquare } from 'lucide-react'
import { formatTimeAgo } from '../lib/date.js'
import { getCategoryBadgeClasses } from '../lib/categories.js'

export default function PostCard({ post, onUpvote }) {
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

  return (
    <article className="flex items-start border-b border-line/70 py-5 transition-colors hover:bg-surface/70">
      {/* Upvote */}
      <button
        type="button"
        onClick={handleUpvoteClick}
        disabled={isUpvoting}
        aria-label={`Upvote discussion: ${post.title}. Current count: ${votes}`}
        className="press mt-6 flex min-h-12 w-10 sm:w-12 shrink-0 flex-col items-center justify-center text-muted transition-colors hover:text-accent-red"
      >
        <ArrowUp size={16} strokeWidth={2.5} aria-hidden="true" />
        <span className="text-xs font-bold tabular-nums text-text mt-1">{votes}</span>
      </button>

      {/* Main Content Column */}
      <div className="flex-1 px-3 py-1 sm:px-4 min-w-0 flex flex-col justify-between">
        <div>
          {/* Metadata Row */}
          <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs">
            {post.category && (
              <span className={`inline-block px-1.5 py-0.5 text-[0.7rem] font-bold tracking-wide uppercase ${categoryBadgeClass}`}>
                {post.category}
              </span>
            )}
            <span className="text-muted text-[0.75rem]">
              by <strong className="font-semibold text-text">@{post.author || 'reader'}</strong>
            </span>
            <span className="text-muted/60">•</span>
            <time dateTime={post.created_at} className="text-muted text-[0.75rem]">
              {formatTimeAgo(post.created_at)}
            </time>
          </div>

          {/* Post Title */}
          <h2 className="text-base sm:text-lg font-semibold leading-snug text-text">
            <Link
              to={`/posts/${post.id}`}
              className="hover:text-accent-blue hover:underline"
            >
              {post.title}
            </Link>
          </h2>

          {/* Text preview snippet (only if content exists, no empty gap) */}
          {post.content && (
            <p className="mt-1.5 text-xs sm:text-sm text-muted line-clamp-2 leading-relaxed">
              {post.content}
            </p>
          )}
        </div>

        {/* Footer: Comments link */}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted">
          <Link
            to={`/posts/${post.id}`}
            className="inline-flex items-center gap-1.5 font-semibold text-muted hover:text-text"
          >
            <MessageSquare size={13} />
            <span>{post.commentsCount ?? 0} {post.commentsCount === 1 ? 'comment' : 'comments'}</span>
          </Link>
        </div>
      </div>

      {/* Thumbnail on Right (only if image exists and didn't fail) */}
      {post.image_url && !imageError && (
        <div className="shrink-0 pl-2 pr-2 sm:pr-4 py-1 flex items-center justify-center">
          <Link
            to={`/posts/${post.id}`}
            tabIndex={-1}
            aria-hidden="true"
            className="block"
          >
            <img
              src={post.image_url}
              alt=""
              onError={() => setImageError(true)}
              loading="lazy"
              className="h-20 w-14 sm:h-24 sm:w-18 rounded-[2px] object-cover bg-surface-subtle"
            />
          </Link>
        </div>
      )}
    </article>
  )
}

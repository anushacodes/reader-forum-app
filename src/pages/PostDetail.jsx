import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowUp, Edit3, Trash2, Loader2, MessageSquare, CornerDownRight } from 'lucide-react'
import { getPostById, deletePost, upvotePost } from '../lib/posts.js'
import { listComments, addComment, deleteComment } from '../lib/comments.js'
import { useAuth } from '../lib/auth.jsx'
import { formatTimeAgo } from '../lib/date.js'
import { getCategoryBadgeClasses } from '../lib/categories.js'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  // Post states
  const [post, setPost] = useState(null)
  const [votes, setVotes] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [postError, setPostError] = useState(null)
  const [imageError, setImageError] = useState(false)
  const [isDeletingPost, setIsDeletingPost] = useState(false)
  const [isUpvoting, setIsUpvoting] = useState(false)

  // Comments states
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [deletingCommentId, setDeletingCommentId] = useState(null)

  // Threaded reply state
  const [replyingToCommentId, setReplyingToCommentId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [replyError, setReplyError] = useState('')

  // Fetch post details and comments
  useEffect(() => {
    let ignore = false

    Promise.all([
      getPostById(id),
      listComments(id).catch((err) => {
        console.error('Error loading comments:', err)
        return []
      }),
    ])
      .then(([fetchedPost, fetchedComments]) => {
        if (ignore) return
        if (!fetchedPost) {
          setPostError('Post not found.')
          return
        }
        setPost(fetchedPost)
        setVotes(fetchedPost.upvotes || 0)
        setComments(fetchedComments || [])
      })
      .catch((err) => {
        if (ignore) return
        console.error('Error loading post:', err)
        setPostError(err?.message || 'Failed to load discussion.')
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [id])

  // Handle post upvote
  const handleUpvote = async () => {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (isUpvoting) return
    setIsUpvoting(true)
    try {
      const newTotal = await upvotePost(id)
      setVotes(newTotal)
    } catch (err) {
      console.error('Error upvoting post:', err)
    } finally {
      setIsUpvoting(false)
    }
  }

  // Handle post delete
  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post?')) {
      return
    }

    setIsDeletingPost(true)
    try {
      await deletePost(id)
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Error deleting post:', err)
      alert('Failed to delete post.')
      setIsDeletingPost(false)
    }
  }

  // Handle top-level comment submit
  const handleAddComment = async (e) => {
    e.preventDefault()
    setCommentError('')

    const cleanBody = newComment.trim()
    if (!cleanBody) {
      setCommentError('Comment cannot be empty.')
      return
    }

    if (cleanBody.length > 2000) {
      setCommentError('Comment must be 2,000 characters or less.')
      return
    }

    setIsSubmittingComment(true)
    try {
      const created = await addComment(id, cleanBody)
      setComments((prev) => [...prev, created])
      setNewComment('')
    } catch (err) {
      console.error('Error adding comment:', err)
      setCommentError(err?.message || 'Failed to submit comment.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Handle inline reply click
  const handleStartReply = (comment) => {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    setReplyingToCommentId(comment.id)
    setReplyText(`@${comment.author} `)
    setReplyError('')
  }

  const handleCancelReply = () => {
    setReplyingToCommentId(null)
    setReplyText('')
    setReplyError('')
  }

  // Submit threaded reply
  const handleSubmitReply = async (e) => {
    e.preventDefault()
    setReplyError('')

    const cleanBody = replyText.trim()
    if (!cleanBody) {
      setReplyError('Reply cannot be empty.')
      return
    }

    if (cleanBody.length > 2000) {
      setReplyError('Reply must be 2,000 characters or less.')
      return
    }

    setIsSubmittingReply(true)
    try {
      const created = await addComment(id, cleanBody)
      setComments((prev) => [...prev, created])
      handleCancelReply()
    } catch (err) {
      console.error('Error replying to comment:', err)
      setReplyError(err?.message || 'Failed to submit reply.')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) {
      return
    }

    setDeletingCommentId(commentId)
    try {
      await deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (err) {
      console.error('Error deleting comment:', err)
      alert('Failed to delete comment.')
    } finally {
      setDeletingCommentId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2">
        <Loader2 size={20} className="animate-spin text-muted" aria-hidden="true" />
        <span className="text-xs text-muted">Loading post...</span>
      </div>
    )
  }

  if (postError || !post) {
    return (
      <div className="border border-line bg-surface p-8 text-center">
        <h1 className="text-lg font-bold text-text">Post not found</h1>
      </div>
    )
  }

  const isAuthor = user?.id && post.author_id === user.id
  const categoryBadgeClass = getCategoryBadgeClasses(post.category)

  // Render comment body with formatted @mention badge if it is a reply
  const renderCommentBody = (body) => {
    const mentionMatch = body.match(/^@([A-Za-z0-9_]+)\s(.*)/s)
    if (mentionMatch) {
      const [, mentionedAuthor, rest] = mentionMatch
      return (
        <p className="text-xs leading-relaxed text-text whitespace-pre-line">
          <span className="inline-flex items-center gap-0.5 border border-blue-200 bg-blue-50 px-1 py-0.2 text-[0.7rem] font-bold text-accent-blue mr-1.5">
            @{mentionedAuthor}
          </span>
          {rest}
        </p>
      )
    }
    return (
      <p className="text-xs leading-relaxed text-text whitespace-pre-line">
        {body}
      </p>
    )
  }

  return (
    <article className="space-y-4 max-w-3xl">
      {/* Post Box */}
      <div className="border border-line bg-surface p-5 sm:p-6 space-y-4">
        {/* Header row: Category, author, date & Author actions */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {post.category && (
              <span className={`inline-block px-1.5 py-0.5 text-[0.7rem] font-bold uppercase ${categoryBadgeClass}`}>
                {post.category}
              </span>
            )}
            <span className="text-muted">
              by <strong className="text-text">{post.author || 'Reader'}</strong>
            </span>
            <span className="text-muted/60">•</span>
            <time dateTime={post.created_at} className="text-muted">
              {formatTimeAgo(post.created_at)}
            </time>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => navigate(`/posts/${id}/edit`)}
                className="press inline-flex items-center gap-1 border border-line-strong bg-surface px-2 py-0.5 text-xs font-semibold text-text hover:bg-surface-hover"
              >
                <Edit3 size={11} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={isDeletingPost}
                className="press inline-flex items-center gap-1 border border-rose-300 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
              >
                <Trash2 size={11} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-text leading-snug">
          {post.title}
        </h1>

        {/* Book Cover Image */}
        {post.image_url && !imageError && (
          <div className="flex justify-center border border-line bg-surface-subtle p-3">
            <img
              src={post.image_url}
              alt={post.title}
              onError={() => setImageError(true)}
              className="max-h-96 w-auto border border-line object-contain"
            />
          </div>
        )}

        {/* Body Text */}
        {post.content && (
          <div className="text-[0.95rem] leading-relaxed text-text whitespace-pre-line pt-1">
            {post.content}
          </div>
        )}

        {/* Upvote & Comment Count Bar */}
        <div className="flex items-center justify-between border-t border-line pt-3 text-xs">
          <button
            type="button"
            onClick={handleUpvote}
            disabled={isUpvoting}
            aria-label={`Upvote this post. Current count: ${votes}`}
            className="press inline-flex h-8 items-center gap-1.5 border border-line-strong bg-surface px-3 font-bold text-text hover:border-accent-red hover:text-accent-red"
          >
            <ArrowUp size={14} strokeWidth={2.5} aria-hidden="true" />
            <span className="tabular-nums">{votes}</span>
            <span className="font-normal text-muted">Upvote</span>
          </button>

          <div className="flex items-center gap-1 text-muted">
            <MessageSquare size={14} />
            <span>{comments.length} comments</span>
          </div>
        </div>
      </div>

      {/* Comments Section with Real Threading */}
      <section aria-label="Comments" className="space-y-3 pt-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
          Comments ({comments.length})
        </h2>

        {/* Add Main Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleAddComment} className="border border-line bg-surface p-4 space-y-2">
            <textarea
              rows={3}
              maxLength={2000}
              required
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value)
                setCommentError('')
              }}
              placeholder="Start a thread or write your thoughts on this book..."
              className={`w-full border p-2 text-xs text-text outline-none focus:border-accent-blue ${
                commentError ? 'border-accent-red' : 'border-line-strong'
              }`}
            />
            {commentError && (
              <p className="text-xs text-accent-red" role="alert">
                {commentError}
              </p>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">{newComment.length} / 2,000</span>
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="press bg-text px-3 py-1 font-semibold text-background hover:opacity-90 disabled:opacity-50"
              >
                {isSubmittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="border border-line bg-surface p-3 text-xs text-muted">
            <button
              type="button"
              onClick={() => navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`)}
              className="font-bold text-accent-blue hover:underline"
            >
              Log in
            </button>{' '}
            to join the discussion or reply to comments.
          </div>
        )}

        {/* Threaded Comments Feed */}
        {comments.length > 0 && (
          <div className="space-y-2.5">
            {comments.map((comment) => {
              const isCommentAuthor = user?.id && comment.author_id === user.id
              const isReply = comment.body.trim().startsWith('@')
              const isReplying = replyingToCommentId === comment.id

              return (
                <div
                  key={comment.id}
                  className={`border border-line bg-surface p-3 space-y-2 transition-colors ${
                    isReply ? 'ml-4 sm:ml-6 border-l-4 border-l-accent-blue/60 bg-surface-subtle/40' : ''
                  }`}
                >
                  {/* Comment Author Header */}
                  <div className="flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center gap-1.5">
                      {isReply && (
                        <CornerDownRight size={12} className="text-accent-blue shrink-0" aria-hidden="true" />
                      )}
                      <strong className="text-text font-bold">
                        {comment.author || 'Reader'}
                      </strong>
                      <span>•</span>
                      <time dateTime={comment.created_at}>{formatTimeAgo(comment.created_at)}</time>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartReply(comment)}
                        className="press inline-flex items-center gap-1 text-[0.7rem] font-semibold text-muted hover:text-accent-blue"
                        title={`Reply to ${comment.author}`}
                      >
                        <CornerDownRight size={11} />
                        <span>Reply</span>
                      </button>

                      {isCommentAuthor && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingCommentId === comment.id}
                          title="Delete comment"
                          className="press text-muted hover:text-accent-red"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comment Text */}
                  {renderCommentBody(comment.body)}

                  {/* Inline Threaded Reply Composer */}
                  {isReplying && (
                    <form onSubmit={handleSubmitReply} className="mt-2 pt-2 border-t border-line space-y-2">
                      <div className="flex items-center justify-between text-[0.7rem] text-muted">
                        <span>
                          Replying to <strong className="text-text">@{comment.author}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={handleCancelReply}
                          className="text-muted hover:text-text underline"
                        >
                          Cancel
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        required
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to @${comment.author}...`}
                        className="w-full border border-line-strong bg-surface p-2 text-xs text-text outline-none focus:border-accent-blue"
                      />

                      {replyError && (
                        <p className="text-xs text-accent-red">{replyError}</p>
                      )}

                      <div className="flex items-center justify-end gap-2 text-xs">
                        <button
                          type="button"
                          onClick={handleCancelReply}
                          className="press border border-line-strong px-2.5 py-1 text-xs font-semibold text-text"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingReply}
                          className="press bg-text px-3 py-1 text-xs font-semibold text-background hover:opacity-90 disabled:opacity-50"
                        >
                          {isSubmittingReply ? 'Posting...' : 'Post Reply'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </article>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowUp, Edit3, Trash2, Loader2, MessageSquare } from 'lucide-react'
import { getPostById, deletePost, upvotePost } from '../lib/posts.js'
import { listComments, addComment, deleteComment } from '../lib/comments.js'
import { buildCommentTree } from '../lib/commentThreads.js'
import { useAuth } from '../lib/authContext.js'
import { formatTimeAgo } from '../lib/date.js'
import { getCategoryBadgeClasses } from '../lib/categories.js'
import CommentThread from '../components/CommentThread.jsx'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, username, isAuthenticated } = useAuth()

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

  // Threaded reply state: target can be any comment
  const [replyTarget, setReplyTarget] = useState(null) // { id, author }
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
    setReplyTarget({ id: comment.id, author: comment.author })
    setReplyText('')
    setReplyError('')
  }

  const handleCancelReply = () => {
    setReplyTarget(null)
    setReplyText('')
    setReplyError('')
  }

  // Submit threaded reply
  const handleSubmitReply = async (e) => {
    e.preventDefault()
    setReplyError('')

    const clean = replyText.trim()
    if (!clean) {
      setReplyError('Reply cannot be empty.')
      return
    }

    if (clean.length > 2000) {
      setReplyError('Reply must be 2,000 characters or less.')
      return
    }

    // Embed reply reference: [reply:parentId] @author ...
    const formattedBody = `[reply:${replyTarget.id}] @${replyTarget.author} ${clean}`

    setIsSubmittingReply(true)
    try {
      const created = await addComment(id, formattedBody)
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

  const threadedComments = useMemo(() => buildCommentTree(comments), [comments])

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
      <div className="py-12 text-center">
        <h1 className="text-lg font-bold text-text">Post not found</h1>
      </div>
    )
  }

  const isAuthor = user?.id && post.author_id === user.id
  const categoryBadgeClass = getCategoryBadgeClasses(post.category)

  return (
    <article className="space-y-6 max-w-3xl mx-auto">
      {/* Discussion */}
      <div className="py-4 sm:py-6 space-y-5">
        {/* Header row: Category, author, date & Author actions */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {post.category && (
              <span className={`inline-block px-1.5 py-0.5 text-[0.7rem] font-bold uppercase ${categoryBadgeClass}`}>
                {post.category}
              </span>
            )}
            <span className="text-muted">
              by <strong className="text-text font-bold">@{post.author || 'reader'}</strong>
            </span>
            <span className="text-muted/60">•</span>
            <time dateTime={post.created_at} className="text-muted">
              {formatTimeAgo(post.created_at)}
            </time>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/posts/${post.id}/edit`)}
                className="press inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-text hover:bg-surface-hover"
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={isDeletingPost}
                className="press inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-accent-red hover:bg-rose-50 disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Post Title */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-text leading-tight tracking-tight">
          {post.title}
        </h1>

        {/* Post Content Body */}
        {post.content && (
          <div className="text-sm sm:text-base leading-[1.85] text-text whitespace-pre-line pt-1">
            {post.content}
          </div>
        )}

        {/* Post Image (if any) */}
        {post.image_url && !imageError && (
          <div className="pt-2">
            <img
              src={post.image_url}
              alt=""
              onError={() => setImageError(true)}
              className="max-h-96 w-auto rounded-[2px] object-contain bg-surface-subtle"
            />
          </div>
        )}

        {/* Upvote & Comment counts */}
        <div className="flex items-center gap-3 pt-3 border-t border-line">
          <button
            type="button"
            onClick={handleUpvote}
            disabled={isUpvoting}
            className="press inline-flex items-center gap-1.5 bg-surface-subtle px-3 py-2 text-xs font-bold text-text hover:text-accent-red"
          >
            <ArrowUp size={15} strokeWidth={2.5} />
            <span className="tabular-nums">{votes}</span>
            <span>Upvote</span>
          </button>

          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <MessageSquare size={14} />
            <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
          </span>
        </div>
      </div>

      {/* COMMENTS SECTION */}
      <section aria-label="Discussion comments" className="space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <h2 className="text-base font-bold text-text flex items-center gap-2">
            <MessageSquare size={18} className="text-accent-blue" />
            <span>Discussion Comments</span>
            <span className="text-xs text-muted font-normal">({comments.length})</span>
          </h2>
        </div>

        {/* 1. TOP-LEVEL COMMENT COMPOSER (Start a new comment thread) */}
        {isAuthenticated ? (
          <form onSubmit={handleAddComment} className="rounded-[3px] bg-surface-subtle p-4 sm:p-5 space-y-3">
            <div className="text-xs font-medium text-muted">
              <span>Start a comment thread as <strong className="text-text">@{username || 'reader'}</strong></span>
            </div>

            <textarea
              rows={3}
              maxLength={2000}
              required
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value)
                setCommentError('')
              }}
              placeholder="What are your thoughts on this book or review? Share your perspective..."
              className={`w-full border p-3 text-sm text-text outline-none focus:border-accent-blue leading-relaxed ${
                commentError ? 'border-accent-red' : 'border-line-strong'
              }`}
            />

            {commentError && (
              <p className="text-xs text-accent-red" role="alert">
                {commentError}
              </p>
            )}

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">{newComment.length} / 2,000 characters</span>
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="press bg-text px-4 py-2 font-bold text-background hover:opacity-90 disabled:opacity-40"
              >
                {isSubmittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="py-5 text-xs text-muted flex flex-wrap items-center justify-between gap-3">
            <span>Join the book community to leave a comment or reply to discussions.</span>
            <button
              type="button"
              onClick={() => navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`)}
              className="press bg-surface-subtle px-3 py-2 font-semibold text-text hover:bg-surface-hover"
            >
              Log In
            </button>
          </div>
        )}

        {/* 2. THREADED COMMENTS LIST */}
        {threadedComments.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted">
            No comments yet. Be the first to share your thoughts on this discussion.
          </div>
        ) : (
          <div className="space-y-4">
            {threadedComments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                userId={user?.id}
                deletingCommentId={deletingCommentId}
                onReply={handleStartReply}
                onDelete={handleDeleteComment}
                reply={{
                  target: replyTarget,
                  text: replyText,
                  error: replyError,
                  submitting: isSubmittingReply,
                  onChange: setReplyText,
                  onSubmit: handleSubmitReply,
                  onCancel: handleCancelReply,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </article>
  )
}

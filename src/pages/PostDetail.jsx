import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import { ArrowLeft, ArrowUp, Edit3, Trash2, Loader2 } from 'lucide-react'
import { getPostById, deletePost, upvotePost } from '../lib/posts.js'
import { listComments, addComment, deleteComment } from '../lib/comments.js'
import { useAuth } from '../lib/auth.jsx'
import { formatTimeAgo } from '../lib/date.js'

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

  // Comments states
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [deletingCommentId, setDeletingCommentId] = useState(null)

  // Fetch post details and comments
  const loadPostData = useCallback(async () => {
    setIsLoading(true)
    setPostError(null)

    try {
      const [fetchedPost, fetchedComments] = await Promise.all([
        getPostById(id),
        listComments(id).catch((err) => {
          console.error('Error loading comments:', err)
          return []
        }),
      ])

      if (!fetchedPost) {
        setPostError('Post not found.')
        return
      }

      setPost(fetchedPost)
      setVotes(fetchedPost.upvotes || 0)
      setComments(fetchedComments || [])
    } catch (err) {
      console.error('Error loading post:', err)
      setPostError(err?.message || 'Failed to load post.')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadPostData()
  }, [loadPostData])

  // Handle post upvote
  const handleUpvote = async () => {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    try {
      const newTotal = await upvotePost(id)
      setVotes(newTotal)
    } catch (err) {
      console.error('Error upvoting post:', err)
    }
  }

  // Handle post delete
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return
    }

    setIsDeletingPost(true)
    try {
      await deletePost(id)
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Error deleting post:', err)
      alert('Failed to delete post. Please try again.')
      setIsDeletingPost(false)
    }
  }

  // Handle add comment
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
      // Only clear input on success (per plan §6)
      setNewComment('')
    } catch (err) {
      console.error('Error adding comment:', err)
      setCommentError(err?.message || 'Failed to submit comment. Please try again.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return
    }

    setDeletingCommentId(commentId)
    try {
      await deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (err) {
      console.error('Error deleting comment:', err)
      alert('Failed to delete comment. Please try again.')
    } finally {
      setDeletingCommentId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-muted" aria-hidden="true" />
        <p className="text-sm text-muted">Loading discussion...</p>
      </div>
    )
  }

  if (postError || !post) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <h1 className="text-2xl font-bold text-text">Discussion not found</h1>
        <p className="mt-2 text-muted">
          This post may have been deleted or the link might be incorrect.
        </p>
        <Link
          to="/"
          className="press mt-6 inline-flex min-h-11 items-center justify-center rounded-ui bg-text px-5 font-semibold text-background"
        >
          Back to all discussions
        </Link>
      </div>
    )
  }

  const isAuthor = user?.id && post.author_id === user.id

  return (
    <article className="mx-auto max-w-3xl">
      {/* Navigation Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-text"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>All discussions</span>
        </Link>

        {/* Author Actions */}
        {isAuthor && (
          <div className="flex items-center gap-3">
            <Link
              to={`/posts/${id}/edit`}
              className="press inline-flex items-center gap-1.5 rounded-ui border border-input-border bg-surface px-3 py-1.5 text-xs font-semibold text-text transition-colors hover:border-text"
            >
              <Edit3 size={14} aria-hidden="true" />
              <span>Edit</span>
            </Link>
            <button
              type="button"
              onClick={handleDeletePost}
              disabled={isDeletingPost}
              className="press inline-flex items-center gap-1.5 rounded-ui border border-accent/40 bg-surface px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
            >
              <Trash2 size={14} aria-hidden="true" />
              <span>{isDeletingPost ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Post Byline */}
      <div className="mb-3 flex flex-wrap items-center gap-2.5 text-xs text-muted">
        <span className="rounded bg-soft px-2.5 py-1 font-semibold text-text">{post.category}</span>
        <span>•</span>
        <span>
          Posted by <strong className="font-semibold text-text">{post.author || 'Reader'}</strong>
        </span>
        <span>•</span>
        <time dateTime={post.created_at} title={new Date(post.created_at).toLocaleString()}>
          {formatTimeAgo(post.created_at)}
        </time>
      </div>

      {/* Post Title */}
      <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">{post.title}</h1>

      {/* Optional Post Image */}
      {post.image_url && !imageError && (
        <div className="my-6 overflow-hidden rounded-ui border border-line bg-soft">
          <img
            src={post.image_url}
            alt={post.title}
            onError={() => setImageError(true)}
            className="max-h-[32rem] w-full object-contain"
          />
        </div>
      )}

      {/* Optional Post Content */}
      {post.content && (
        <div className="prose my-6 max-w-none text-base leading-relaxed text-text whitespace-pre-line">
          {post.content}
        </div>
      )}

      {/* Upvote Bar */}
      <div className="my-8 flex items-center justify-between border-y border-line py-3">
        <button
          type="button"
          onClick={handleUpvote}
          aria-label={`Upvote this post. Current count: ${votes}`}
          className="press inline-flex min-h-11 items-center gap-2 rounded-ui border border-input-border bg-surface px-4 font-semibold text-text transition-colors hover:border-text"
        >
          <ArrowUp size={18} strokeWidth={2} aria-hidden="true" />
          <span>{votes}</span>
          <span className="text-xs font-normal text-muted">upvotes</span>
        </button>

        <span className="text-xs text-muted">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      {/* Comments Section */}
      <section aria-labelledby="comments-heading" className="pt-2">
        <h2 id="comments-heading" className="mb-6 text-2xl font-bold tracking-tight text-text">
          Comments
        </h2>

        {/* Add Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleAddComment} className="mb-8">
            <label htmlFor="comment-input" className="sr-only">
              Add a comment
            </label>
            <textarea
              id="comment-input"
              rows={3}
              maxLength={2000}
              required
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value)
                setCommentError('')
              }}
              placeholder="What are your thoughts on this read?"
              className={`w-full rounded-ui border bg-surface p-3.5 text-base text-text outline-none transition-colors focus:border-text placeholder:text-muted ${
                commentError ? 'border-accent' : 'border-input-border'
              }`}
            />
            {commentError && (
              <p className="mt-1 text-xs text-accent" role="alert">
                {commentError}
              </p>
            )}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted">{newComment.length} / 2,000</span>
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="press inline-flex min-h-10 items-center justify-center rounded-ui bg-text px-5 text-sm font-semibold text-background transition-opacity disabled:opacity-50"
              >
                {isSubmittingComment ? 'Posting...' : 'Post comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-8 rounded-ui border border-line bg-soft p-4 text-center">
            <p className="text-sm text-text">Want to join the conversation?</p>
            <Link
              to={`/login?next=${encodeURIComponent(window.location.pathname)}`}
              className="press mt-2 inline-flex min-h-9 items-center justify-center rounded-ui bg-text px-4 text-xs font-semibold text-background"
            >
              Log in to comment
            </Link>
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          <div className="divide-y divide-line">
            {comments.map((comment) => {
              const isCommentAuthor = user?.id && comment.author_id === user.id
              return (
                <div key={comment.id} className="py-4">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center gap-2">
                      <strong className="font-semibold text-text">
                        {comment.author || 'Reader'}
                      </strong>
                      <span>•</span>
                      <time dateTime={comment.created_at}>{formatTimeAgo(comment.created_at)}</time>
                    </div>

                    {isCommentAuthor && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                        title="Delete your comment"
                        aria-label="Delete your comment"
                        className="text-muted hover:text-accent"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <p className="mt-2 text-base leading-relaxed text-text whitespace-pre-line">
                    {comment.body}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </article>
  )
}

import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Loader2, AlertCircle, Image as ImageIcon, X } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { CATEGORIES, getPostById, createPost, updatePost } from '../lib/posts.js'

export default function PostForm({ mode = 'create' }) {
  const isEdit = mode === 'edit'
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Opinion')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const [isLoadingPost, setIsLoadingPost] = useState(isEdit)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)

  // Load post data for editing
  useEffect(() => {
    if (!isEdit || !id) return

    let mounted = true
    getPostById(id)
      .then((post) => {
        if (!mounted) return
        if (!post) {
          setErrorMessage('Post not found.')
          return
        }

        // Verify ownership (or demo user match)
        const currentUserId = user?.id
        const isAuthor = currentUserId && post.author_id === currentUserId
        if (!isAuthor) {
          setUnauthorized(true)
          return
        }

        setTitle(post.title || '')
        setCategory(post.category || 'Opinion')
        setContent(post.content || '')
        setImageUrl(post.image_url || '')
      })
      .catch((err) => {
        if (!mounted) return
        console.error('Error fetching post for edit:', err)
        setErrorMessage('Failed to load post. Please try again.')
      })
      .finally(() => {
        if (mounted) setIsLoadingPost(false)
      })

    return () => {
      mounted = false
    }
  }, [isEdit, id, user])

  const validate = () => {
    const errors = {}
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      errors.title = 'Title is required.'
    } else if (trimmedTitle.length > 160) {
      errors.title = 'Title must be 160 characters or less.'
    }

    if (content.length > 10000) {
      errors.content = 'Content must be 10,000 characters or less.'
    }

    if (imageUrl.trim()) {
      const url = imageUrl.trim()
      if (!/^https?:\/\//i.test(url)) {
        errors.imageUrl = 'Image URL must start with http:// or https://'
      } else if (url.length > 2048) {
        errors.imageUrl = 'Image URL must be 2,048 characters or less.'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!validate()) return

    setIsSubmitting(true)

    try {
      if (isEdit) {
        await updatePost(id, {
          title,
          category,
          content,
          image_url: imageUrl,
        })
        navigate(`/posts/${id}`)
      } else {
        const currentAuthor = {
          id: user?.id,
          username: profile?.username || user?.user_metadata?.username || user?.username || 'Reader',
        }
        const created = await createPost(
          {
            title,
            category,
            content,
            image_url: imageUrl,
          },
          currentAuthor
        )
        navigate(`/posts/${created.id}`)
      }
    } catch (err) {
      console.error('Error saving post:', err)
      setErrorMessage(err?.message || 'Failed to save post. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (isLoadingPost) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-muted" aria-hidden="true" />
        <p className="text-sm text-muted">Loading post details...</p>
      </div>
    )
  }

  if (unauthorized) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <h1 className="text-2xl font-bold text-text">Not authorized</h1>
        <p className="mt-2 text-muted">You can only edit posts that you authored.</p>
        <Link
          to={id ? `/posts/${id}` : '/'}
          className="press mt-6 inline-flex min-h-11 items-center justify-center rounded-ui bg-text px-5 font-semibold text-background"
        >
          Return to post
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          to={isEdit ? `/posts/${id}` : '/'}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-text"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>{isEdit ? 'Back to post' : 'All posts'}</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-text">
        {isEdit ? 'Edit post' : 'New post'}
      </h1>

      {errorMessage && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-2.5 rounded-ui border border-accent/40 bg-accent/10 p-3.5 text-sm text-text"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        {/* Title */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="post-title" className="block text-sm font-semibold text-text">
              Title <span className="text-accent">*</span>
            </label>
            <span className="text-xs text-muted">{title.length} / 160</span>
          </div>
          <input
            id="post-title"
            type="text"
            required
            maxLength={160}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (fieldErrors.title) {
                setFieldErrors((prev) => ({ ...prev, title: undefined }))
              }
            }}
            placeholder="What would you like to discuss?"
            className={`mt-1.5 w-full rounded-ui border bg-surface px-3.5 py-2.5 text-base text-text outline-none transition-colors focus:border-text ${
              fieldErrors.title ? 'border-accent' : 'border-input-border'
            }`}
          />
          {fieldErrors.title && <p className="mt-1 text-xs text-accent">{fieldErrors.title}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="post-category" className="block text-sm font-semibold text-text">
            Category
          </label>
          <select
            id="post-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1.5 w-full rounded-ui border border-input-border bg-surface px-3.5 py-2.5 text-base text-text outline-none transition-colors focus:border-text"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Content / Body */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="post-content" className="block text-sm font-semibold text-text">
              Body <span className="text-xs font-normal text-muted">(optional)</span>
            </label>
            <span className="text-xs text-muted">{content.length} / 10,000</span>
          </div>
          <textarea
            id="post-content"
            rows={6}
            maxLength={10000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, review, or question with the community..."
            className="mt-1.5 w-full rounded-ui border border-input-border bg-surface p-3.5 text-base text-text outline-none transition-colors focus:border-text"
          />
        </div>

        {/* External Image URL */}
        <div>
          <label htmlFor="post-image-url" className="block text-sm font-semibold text-text">
            Image URL <span className="text-xs font-normal text-muted">(optional)</span>
          </label>
          <div className="relative mt-1.5">
            <input
              id="post-image-url"
              type="url"
              maxLength={2048}
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value)
                setImagePreviewFailed(false)
                if (fieldErrors.imageUrl) {
                  setFieldErrors((prev) => ({ ...prev, imageUrl: undefined }))
                }
              }}
              placeholder="https://example.com/book-cover.jpg"
              className={`w-full rounded-ui border bg-surface px-3.5 py-2.5 text-base text-text outline-none transition-colors focus:border-text ${
                fieldErrors.imageUrl ? 'border-accent' : 'border-input-border'
              }`}
            />
            {imageUrl && (
              <button
                type="button"
                onClick={() => {
                  setImageUrl('')
                  setImagePreviewFailed(false)
                }}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted hover:text-text"
                title="Clear image URL"
                aria-label="Clear image URL"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {fieldErrors.imageUrl && <p className="mt-1 text-xs text-accent">{fieldErrors.imageUrl}</p>}

          {/* Image Live Preview */}
          {imageUrl && !fieldErrors.imageUrl && (
            <div className="mt-3 overflow-hidden rounded-ui border border-line bg-soft p-2">
              <p className="mb-2 text-xs font-semibold text-muted">Image Preview</p>
              {imagePreviewFailed ? (
                <div className="flex h-36 items-center justify-center gap-2 rounded bg-surface text-xs text-muted">
                  <ImageIcon size={18} />
                  <span>Could not load image from this URL</span>
                </div>
              ) : (
                <div className="flex max-h-64 justify-center overflow-hidden rounded bg-surface">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    onError={() => setImagePreviewFailed(true)}
                    className="max-h-64 object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center justify-end gap-3 border-t border-line pt-6">
          <Link
            to={isEdit ? `/posts/${id}` : '/'}
            className="press inline-flex min-h-11 items-center justify-center rounded-ui px-4 text-sm font-semibold text-muted transition-colors hover:text-text"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="press inline-flex min-h-11 items-center justify-center gap-2 rounded-ui bg-text px-6 font-semibold text-background transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                <span>{isEdit ? 'Saving...' : 'Publishing...'}</span>
              </>
            ) : (
              <span>{isEdit ? 'Save changes' : 'Publish post'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

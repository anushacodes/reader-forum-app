import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Loader2, AlertCircle, Image as ImageIcon, X } from 'lucide-react'
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

  const isDirty = Boolean(title.trim() || content.trim() || imageUrl.trim())

  // Warn before browser tab reload or close if form has unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && !isSubmitting) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, isSubmitting])

  const handleCancelClick = (e) => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them?')) {
      e.preventDefault()
    }
  }

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
      <div className="mx-auto flex min-h-[40vh] max-w-2xl flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-muted" aria-hidden="true" />
        <p className="text-xs text-muted">Loading post details...</p>
      </div>
    )
  }

  if (unauthorized) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center border border-line bg-surface p-6">
        <h1 className="text-xl font-bold text-text">Not authorized</h1>
        <p className="mt-2 text-xs text-muted">You can only edit posts that you authored.</p>
        <Link
          to={id ? `/posts/${id}` : '/'}
          className="press mt-4 inline-block border border-line-strong bg-text px-4 py-1.5 text-xs font-semibold text-background hover:opacity-90"
        >
          Return to post
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="border border-line bg-surface p-6 sm:p-8 space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            {isEdit ? 'Edit Post' : 'Create Post'}
          </h1>
          <p className="mt-1 text-xs text-muted">
            {isEdit
              ? 'Update the title, category, body or image.'
              : 'Share a book review, question, recommendation, or opinion.'}
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2 border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200"
          >
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-accent-red" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="post-title" className="block text-xs font-bold uppercase tracking-wider text-text">
                Title <span className="text-accent-red">*</span>
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
              placeholder="e.g. Thoughts on Tomorrow, and Tomorrow, and Tomorrow"
              className={`mt-1 w-full border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent-blue ${
                fieldErrors.title ? 'border-accent-red' : 'border-line-strong'
              }`}
            />
            {fieldErrors.title && <p className="mt-1 text-xs text-accent-red">{fieldErrors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text mb-1">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`press px-3 py-1 text-xs font-bold uppercase tracking-wider border ${
                      isSelected
                        ? cat === 'Review'
                          ? 'border-amber-800 bg-amber-800 text-white'
                          : cat === 'Recommendation'
                            ? 'border-blue-700 bg-blue-700 text-white'
                            : cat === 'Question'
                              ? 'border-indigo-700 bg-indigo-700 text-white'
                              : 'border-rose-700 bg-rose-700 text-white'
                        : 'border-line-strong bg-surface text-text hover:bg-surface-hover'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="post-content" className="block text-xs font-bold uppercase tracking-wider text-text">
                Content <span className="text-muted font-normal lowercase">(optional)</span>
              </label>
              <span className="text-xs text-muted">{content.length} / 10,000</span>
            </div>
            <textarea
              id="post-content"
              rows={6}
              maxLength={10000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your review, reflection, or question here..."
              className="mt-1 w-full border border-line-strong bg-surface p-2.5 text-sm text-text outline-none focus:border-accent-blue"
            />
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="post-image-url" className="block text-xs font-bold uppercase tracking-wider text-text">
              Image URL <span className="text-muted font-normal lowercase">(optional)</span>
            </label>
            <div className="relative mt-1">
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
                placeholder="https://... image link"
                className={`w-full border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent-blue ${
                  fieldErrors.imageUrl ? 'border-accent-red' : 'border-line-strong'
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
                  title="Clear"
                  aria-label="Clear"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {fieldErrors.imageUrl && <p className="mt-1 text-xs text-accent-red">{fieldErrors.imageUrl}</p>}

            {/* Live Preview */}
            {imageUrl && !fieldErrors.imageUrl && (
              <div className="mt-2 border border-line bg-surface-subtle p-3">
                <p className="mb-2 text-xs font-bold uppercase text-muted">Preview</p>
                {imagePreviewFailed ? (
                  <div className="flex h-24 items-center justify-center gap-2 border border-line bg-surface text-xs text-muted">
                    <ImageIcon size={16} />
                    <span>Failed to load image preview</span>
                  </div>
                ) : (
                  <div className="flex max-h-52 justify-center border border-line bg-surface p-2">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      onError={() => setImagePreviewFailed(true)}
                      className="max-h-48 object-contain"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex items-center justify-end gap-2 border-t border-line pt-4">
            <Link
              to={isEdit ? `/posts/${id}` : '/'}
              onClick={handleCancelClick}
              className="press border border-line-strong px-4 py-1.5 text-xs font-semibold text-text hover:bg-surface-hover"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="press border border-text bg-text px-5 py-1.5 text-xs font-semibold text-background hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin" />
                  Saving...
                </span>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Create Post'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

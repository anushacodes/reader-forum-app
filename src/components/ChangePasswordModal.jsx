import { useState, useEffect } from 'react'
import { X, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await updatePassword(password)
      setSuccessMessage('Password changed successfully!')
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Password update error:', err)
      setErrorMessage(err?.message || 'Failed to update password. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm border border-line bg-surface p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-accent-red" />
            <h2 className="text-base font-bold text-text">Change Password</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="press p-1 text-muted hover:text-text"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div role="alert" className="flex items-start gap-2 border border-rose-300 bg-rose-50 p-2.5 text-xs text-rose-800">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-accent-red" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div role="status" className="flex items-start gap-2 border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-800">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="new-password" className="block text-xs font-bold uppercase tracking-wider text-text mb-1">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full border border-line-strong bg-surface px-3 py-1.5 text-xs text-text outline-none focus:border-accent-blue"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-bold uppercase tracking-wider text-text mb-1">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full border border-line-strong bg-surface px-3 py-1.5 text-xs text-text outline-none focus:border-accent-blue"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="press border border-line-strong px-3 py-1.5 text-xs font-semibold text-text hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="press border border-text bg-text px-4 py-1.5 text-xs font-semibold text-background hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" />
                  Updating...
                </span>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AlertCircle, KeyRound, LogOut } from 'lucide-react'
import { useAuth } from '../lib/authContext.js'
import { validateUsername } from '../lib/username.js'

export default function Profile() {
  const {
    user,
    username,
    updateUsername,
    updatePassword,
    logout,
  } = useAuth()
  const navigate = useNavigate()

  // Username form state
  const [newUsername, setNewUsername] = useState(username || '')
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [usernameSuccess, setUsernameSuccess] = useState('')

  // Password form state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Handle username update
  const handleUsernameSubmit = async (e) => {
    e.preventDefault()
    setUsernameError('')
    setUsernameSuccess('')

    const trimmed = newUsername.trim()
    if (trimmed === username) {
      setUsernameError('This is already your current username.')
      return
    }

    const validation = validateUsername(trimmed)
    if (!validation.valid) {
      setUsernameError(validation.error)
      return
    }

    setIsUpdatingUsername(true)
    try {
      await updateUsername(trimmed)
      setUsernameSuccess(`Username successfully updated to @${trimmed}`)
    } catch (err) {
      console.error('Error updating username:', err)
      setUsernameError(err?.message || 'Failed to update username.')
    } finally {
      setIsUpdatingUsername(false)
    }
  }

  // Handle password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setIsUpdatingPassword(true)
    try {
      await updatePassword(newPassword)
      setPasswordSuccess('Password successfully updated!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error('Error updating password:', err)
      setPasswordError(err?.message || 'Failed to update password.')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="break-words text-xl sm:text-2xl font-semibold text-text tracking-tight">
              @{username || 'reader'}
            </h1>
            <p className="text-xs text-muted mt-0.5">
              {user?.email || 'Reader account'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="press inline-flex self-start sm:self-auto items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-muted hover:text-accent-red"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Change username */}
      <section className="border-t border-line pt-7 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-text">Change Username</h2>
          <p className="text-xs text-muted mt-1">
            Update your public handle. Must be 3–24 characters starting with a letter.
          </p>
        </div>

        {usernameSuccess && (
          <div className="border-l-2 border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800">
            {usernameSuccess}
          </div>
        )}

        {usernameError && (
          <div className="flex items-center gap-2 border-l-2 border-rose-300 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle size={14} className="shrink-0 text-accent-red" />
            <span>{usernameError}</span>
          </div>
        )}

        <form onSubmit={handleUsernameSubmit} className="space-y-3">
          <div>
            <label htmlFor="new-username" className="block text-xs font-semibold text-text mb-1">
              Username Handle
            </label>
            <input
              id="new-username"
              type="text"
              value={newUsername}
              onChange={(e) => {
                setNewUsername(e.target.value)
                setUsernameError('')
                setUsernameSuccess('')
              }}
              maxLength={24}
              required
              className="w-full border border-line-strong bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent-blue"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingUsername || newUsername.trim() === username}
              className="press bg-text px-4 py-2 text-xs font-bold text-background hover:opacity-90 disabled:opacity-40"
            >
              {isUpdatingUsername ? 'Saving...' : 'Save Username'}
            </button>
          </div>
        </form>
      </section>

      {/* Change password */}
      <section className="border-t border-line pt-7 space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-accent-blue" />
            <h2 className="text-base font-bold text-text">Change Password</h2>
          </div>
          <p className="text-xs text-muted mt-1">
            Choose a secure password of at least 8 characters.
          </p>
        </div>

        {passwordSuccess && (
          <div className="border-l-2 border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800">
            {passwordSuccess}
          </div>
        )}

        {passwordError && (
          <div className="flex items-center gap-2 border-l-2 border-rose-300 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle size={14} className="shrink-0 text-accent-red" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div>
            <label htmlFor="new-password" className="block text-xs font-semibold text-text mb-1">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setPasswordError('')
                setPasswordSuccess('')
              }}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full border border-line-strong bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent-blue"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-semibold text-text mb-1">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setPasswordError('')
                setPasswordSuccess('')
              }}
              placeholder="Repeat your new password"
              required
              minLength={8}
              className="w-full border border-line-strong bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent-blue"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingPassword || !newPassword || !confirmPassword}
              className="press bg-text px-4 py-2 text-xs font-bold text-background hover:opacity-90 disabled:opacity-40"
            >
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

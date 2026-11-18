import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Check, AlertCircle, KeyRound, User, Sparkles, LogOut } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { validateUsername } from '../lib/username.js'
import { AvatarIcon } from '../components/Avatars.jsx'

export default function Profile() {
  const {
    user,
    username,
    avatar,
    updateAvatar,
    updateUsername,
    updatePassword,
    logout,
    AVATAR_OPTIONS,
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

  // Handle avatar select
  const handleSelectAvatar = (optionId) => {
    updateAvatar(optionId)
  }

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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="border border-line bg-surface p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-line-strong bg-white p-2">
              <AvatarIcon id={avatar?.id} className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-text tracking-tight">
                @{username || 'reader'}
              </h1>
              <p className="text-xs text-muted mt-0.5">
                {user?.email || 'Reader account'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="press inline-flex items-center justify-center gap-1.5 border border-line-strong bg-surface px-3 py-1.5 text-xs font-bold text-muted hover:border-accent-red hover:text-accent-red"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* 1. Choose User Avatar Icon */}
      <section className="border border-line bg-surface p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent-blue" />
            <h2 className="text-base font-bold text-text">Choose Your Profile Icon</h2>
          </div>
          <p className="text-xs text-muted mt-1">
            Pick your reader icon. This icon will appear across your posts, replies, and top header.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-1">
          {AVATAR_OPTIONS.map((opt) => {
            const isSelected = avatar?.id === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectAvatar(opt.id)}
                className={`press flex flex-col items-center justify-center p-3 border transition-colors ${
                  isSelected
                    ? 'border-accent-blue bg-blue-50/50'
                    : 'border-line-strong bg-surface hover:bg-surface-hover'
                }`}
              >
                <div className="h-12 w-12 mb-2 flex items-center justify-center text-text p-1">
                  <AvatarIcon id={opt.id} className="h-full w-full object-contain" />
                </div>
                <span className="text-xs font-bold text-text">{opt.label}</span>
                {isSelected && (
                  <span className="mt-1 flex items-center gap-0.5 text-[0.65rem] font-bold text-accent-blue uppercase">
                    <Check size={10} strokeWidth={3} /> Active
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* 2. Change Username */}
      <section className="border border-line bg-surface p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <User size={16} className="text-accent-blue" />
            <h2 className="text-base font-bold text-text">Change Username</h2>
          </div>
          <p className="text-xs text-muted mt-1">
            Update your public handle. Must be 3–24 characters starting with a letter.
          </p>
        </div>

        {usernameSuccess && (
          <div className="border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800">
            {usernameSuccess}
          </div>
        )}

        {usernameError && (
          <div className="flex items-center gap-2 border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle size={14} className="shrink-0 text-accent-red" />
            <span>{usernameError}</span>
          </div>
        )}

        <form onSubmit={handleUsernameSubmit} className="space-y-3">
          <div>
            <label htmlFor="new-username" className="block text-xs font-bold uppercase tracking-wider text-text mb-1">
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

      {/* 3. Change Password */}
      <section className="border border-line bg-surface p-6 space-y-4">
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
          <div className="border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800">
            {passwordSuccess}
          </div>
        )}

        {passwordError && (
          <div className="flex items-center gap-2 border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle size={14} className="shrink-0 text-accent-red" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div>
            <label htmlFor="new-password" className="block text-xs font-bold uppercase tracking-wider text-text mb-1">
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
            <label htmlFor="confirm-password" className="block text-xs font-bold uppercase tracking-wider text-text mb-1">
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

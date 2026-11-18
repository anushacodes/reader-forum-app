import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { AlertCircle, KeyRound, LogOut, MessageSquare, Plus, ArrowUp, Calendar } from 'lucide-react'
import { useAuth } from '../lib/authContext.js'
import { validateUsername } from '../lib/username.js'
import { listPosts, upvotePost, getUserProfile } from '../lib/posts.js'
import PostCard from '../components/PostCard.jsx'
import { DogSvg } from '../components/Logo.jsx'

export default function Profile() {
  const { username: paramUsername } = useParams()
  const navigate = useNavigate()
  const {
    user,
    username: authUsername,
    updateUsername,
    updatePassword,
    logout,
    isAuthenticated,
  } = useAuth()

  // Target username to view: route param, or fallback to current logged-in user
  const targetUsername = (paramUsername || authUsername || '').trim()

  // Check if viewing own profile
  const isOwnProfile =
    isAuthenticated &&
    Boolean(authUsername && targetUsername.toLowerCase() === authUsername.toLowerCase())

  // Tab state: 'discussions' | 'settings'
  const [activeTab, setActiveTab] = useState('discussions')

  // Profile and posts state
  const [profileData, setProfileData] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(() => Boolean(targetUsername))
  const [fetchError, setFetchError] = useState('')

  // Settings: Username form state
  const [newUsername, setNewUsername] = useState(authUsername || '')
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [usernameSuccess, setUsernameSuccess] = useState('')

  // Settings: Password form state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Load target user profile and their posts
  useEffect(() => {
    if (!targetUsername) return

    let isMounted = true

    Promise.all([
      getUserProfile(targetUsername),
      listPosts({ authorUsername: targetUsername, pageSize: 50 }),
    ])
      .then(([profile, postsResult]) => {
        if (!isMounted) return
        setProfileData(profile)
        setPosts(postsResult?.posts || [])
      })
      .catch((err) => {
        console.error('Error loading profile data:', err)
        if (isMounted) setFetchError('Could not load profile.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [targetUsername])

  // Aggregate stats
  const totalUpvotes = useMemo(() => {
    return posts.reduce((sum, p) => sum + (p.upvotes || 0), 0)
  }, [posts])

  // Handle post upvote in the feed
  const handleUpvote = async (postId) => {
    try {
      const newTotal = await upvotePost(postId)
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, upvotes: newTotal } : p))
      )
      return newTotal
    } catch (err) {
      console.error('Error upvoting post:', err)
      throw err
    }
  }

  // Handle username update
  const handleUsernameSubmit = async (e) => {
    e.preventDefault()
    setUsernameError('')
    setUsernameSuccess('')

    const trimmed = newUsername.trim()
    if (trimmed === authUsername) {
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
      navigate(`/u/${trimmed}`, { replace: true })
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

  const joinedYear = useMemo(() => {
    if (!profileData?.created_at) return '2026'
    try {
      return new Date(profileData.created_at).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return '2026'
    }
  }, [profileData])

  if (!targetUsername && !loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <p className="text-sm text-muted">User not found.</p>
        <Link to="/" className="text-xs font-bold text-accent-red underline">
          Return to Discussions
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Profile Header Hero */}
      <header className="border-b border-line pb-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Mascot Avatar Frame */}
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center border-2 border-line-strong bg-surface p-2 shadow-sm">
              <DogSvg className="h-full w-full object-contain" />
            </div>

            <div className="min-w-0">
              <h1 className="break-words text-2xl sm:text-3xl font-black text-text tracking-tight leading-tight">
                @{targetUsername}
              </h1>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="shrink-0" />
                  <span>Joined {joinedYear}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-text">
                  <MessageSquare size={13} className="shrink-0 text-accent-blue" />
                  <span>{posts.length} {posts.length === 1 ? 'discussion' : 'discussions'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-text">
                  <ArrowUp size={13} className="shrink-0 text-accent-red" />
                  <span>{totalUpvotes} {totalUpvotes === 1 ? 'upvote' : 'upvotes'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Own Profile Quick Action / Signout */}
          {isOwnProfile && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                to="/create"
                className="press flex items-center gap-1.5 bg-accent-red px-3 py-1.5 text-xs font-bold text-white uppercase tracking-wider hover:bg-accent-red-hover"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>New Post</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="press border border-line-strong bg-surface px-3 py-1.5 text-xs font-bold text-muted hover:text-accent-red hover:border-accent-red"
                title="Sign out of account"
              >
                <LogOut size={13} className="inline mr-1" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs (if viewing own profile, allows switching between discussions & settings) */}
        {isOwnProfile && (
          <div className="mt-6 flex items-center gap-4 border-t border-line/60 pt-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('discussions')}
              className={`press pb-1 border-b-2 transition-colors ${
                activeTab === 'discussions'
                  ? 'border-text text-text'
                  : 'border-transparent text-muted hover:text-text'
              }`}
            >
              Discussions ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`press pb-1 border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-text text-text'
                  : 'border-transparent text-muted hover:text-text'
              }`}
            >
              Account Settings
            </button>
          </div>
        )}
      </header>

      {/* TAB CONTENT: Discussions Feed */}
      {activeTab === 'discussions' && (
        <section aria-label="Discussions by this user" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
              {isOwnProfile ? 'Your Discussions' : `Discussions by @${targetUsername}`}
            </h2>
            <span className="text-xs text-muted tabular-nums">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>

          {loading ? (
            <div className="space-y-4 pt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse border-b border-line/60 py-5 space-y-2">
                  <div className="h-4 w-1/4 bg-surface-subtle" />
                  <div className="h-6 w-3/4 bg-surface-subtle" />
                  <div className="h-4 w-1/2 bg-surface-subtle" />
                </div>
              ))}
            </div>
          ) : fetchError ? (
            <div className="border border-line bg-surface p-6 text-center text-xs text-muted">
              {fetchError}
            </div>
          ) : posts.length === 0 ? (
            <div className="border border-line border-dashed bg-surface p-10 text-center space-y-4">
              <MessageSquare size={28} className="mx-auto text-muted/60" />
              <div>
                <p className="text-sm font-semibold text-text">
                  {isOwnProfile
                    ? "You haven't posted any book discussions yet."
                    : `@${targetUsername} hasn't posted any discussions yet.`}
                </p>
                <p className="text-xs text-muted mt-1">
                  {isOwnProfile
                    ? 'Share a book you love, ask a question, or post a review to get the conversation started.'
                    : 'Check back later to see their latest thoughts.'}
                </p>
              </div>

              {isOwnProfile && (
                <div>
                  <Link
                    to="/create"
                    className="press inline-flex items-center gap-1.5 bg-accent-red px-4 py-2 text-xs font-bold text-white uppercase tracking-wider hover:bg-accent-red-hover"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    <span>Create Your First Post</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-line/40">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onUpvote={handleUpvote} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB CONTENT: Account Settings (Only visible to account owner) */}
      {isOwnProfile && activeTab === 'settings' && (
        <div className="space-y-8">
          {/* Change Username Section */}
          <section className="border border-line bg-surface p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-text">Change Username</h2>
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
                  className="w-full border border-line-strong bg-background px-3 py-2 text-sm text-text outline-none focus:border-accent-blue"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingUsername || newUsername.trim() === authUsername}
                  className="press bg-text px-4 py-2 text-xs font-bold text-background hover:opacity-90 disabled:opacity-40"
                >
                  {isUpdatingUsername ? 'Saving...' : 'Save Username'}
                </button>
              </div>
            </form>
          </section>

          {/* Change Password Section */}
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
                  className="w-full border border-line-strong bg-background px-3 py-2 text-sm text-text outline-none focus:border-accent-blue"
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
                  className="w-full border border-line-strong bg-background px-3 py-2 text-sm text-text outline-none focus:border-accent-blue"
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

          {/* Account Details Box */}
          <section className="border border-line bg-surface-subtle p-4 flex items-center justify-between text-xs">
            <div>
              <span className="text-muted block text-[0.7rem] uppercase font-bold tracking-wider">
                Logged in account
              </span>
              <strong className="text-text font-bold">{user?.email || authUsername}</strong>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="press border border-line-strong bg-surface px-3 py-1.5 font-bold text-muted hover:text-accent-red hover:border-accent-red"
            >
              Sign out
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

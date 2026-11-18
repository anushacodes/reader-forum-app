import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from './supabase.js'
import { getUserAvatar, setUserAvatar, AVATAR_OPTIONS } from './avatar.js'

const AuthContext = createContext(null)

const DEMO_STORAGE_KEY = 'dogear.demo_user'
const USERNAME_EMAIL_STORAGE_KEY = 'dogear_username_email_map'

const SEEDED_USERNAMES = {
  bookworm42: 'bookworm_reader_dogear@gmail.com',
  pageturner88: 'pageturner_reader_dogear@gmail.com',
  litcritic_alex: 'litcritic_alex@gmail.com',
  midnightreader: 'midnight_reader_club@gmail.com',
  testreader9999: 'testreader9999@gmail.com',
  instantreader: 'instantreader@gmail.com',
  readeruserb: 'readerb@gmail.com',
  velvetsteps7788: 'velvetsteps7788@gmail.com',
}

function saveUsernameEmailMapping(username, email) {
  if (!username || !email) return
  try {
    const raw = localStorage.getItem(USERNAME_EMAIL_STORAGE_KEY)
    const map = raw ? JSON.parse(raw) : {}
    map[username.toLowerCase().trim()] = email.trim()
    localStorage.setItem(USERNAME_EMAIL_STORAGE_KEY, JSON.stringify(map))
  } catch {
    // Ignore storage errors
  }
}

function resolveEmailFromIdentifier(identifier) {
  const clean = identifier.trim()
  if (clean.includes('@')) {
    return clean
  }
  const lower = clean.toLowerCase()
  if (SEEDED_USERNAMES[lower]) {
    return SEEDED_USERNAMES[lower]
  }
  try {
    const raw = localStorage.getItem(USERNAME_EMAIL_STORAGE_KEY)
    if (raw) {
      const map = JSON.parse(raw)
      if (map[lower]) return map[lower]
    }
  } catch {
    // Ignore
  }
  return null
}

function readDemoUser() {
  if (isSupabaseConfigured) return null
  try {
    const saved = localStorage.getItem(DEMO_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const initialDemo = readDemoUser()
  const [session, setSession] = useState(() => (initialDemo ? { user: initialDemo } : null))
  const [user, setUser] = useState(() => initialDemo ?? null)
  const [profile, setProfile] = useState(() => (initialDemo ? { id: initialDemo.id, username: initialDemo.username } : null))
  const [avatar, setAvatarState] = useState(() => getUserAvatar(initialDemo?.id))
  const [loading, setLoading] = useState(() => Boolean(isSupabaseConfigured))

  // Fetch or refresh profile row from Supabase
  const loadProfile = async (userId) => {
    if (!supabase || !userId) {
      setProfile(null)
      return null
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, created_at')
        .eq('id', userId)
        .maybeSingle()

      if (!error && data) {
        setProfile(data)
        return data
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
    }
    return null
  }

  // Restore session on mount when Supabase is configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    let mounted = true

    // 1. Live Supabase session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      if (currentSession?.user) {
        setAvatarState(getUserAvatar(currentSession.user.id))
        loadProfile(currentSession.user.id).finally(() => {
          if (mounted) setLoading(false)
        })
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (newSession?.user) {
        setAvatarState(getUserAvatar(newSession.user.id))
        await loadProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  /**
   * Log in with email or username and password
   */
  const login = async ({ identifier, email, password }) => {
    const rawId = (identifier || email || '').trim()
    if (!rawId) {
      throw new Error('Please enter your email or username.')
    }

    let resolvedEmail = rawId
    if (!rawId.includes('@')) {
      const found = resolveEmailFromIdentifier(rawId)
      if (found) {
        resolvedEmail = found
      } else if (isSupabaseConfigured && supabase) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id, username')
          .ilike('username', rawId)
          .maybeSingle()

        if (!prof) {
          throw new Error(`No account found with username "${rawId}".`)
        } else {
          throw new Error(`Account @${prof.username} found. Please log in with your email address on this device.`)
        }
      }
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      })
      if (error) throw error

      if (data?.user?.user_metadata?.username) {
        saveUsernameEmailMapping(data.user.user_metadata.username, resolvedEmail)
      }
      return data
    } else {
      // Offline fallback
      const demoUser = {
        id: 'demo-user-' + Math.random().toString(36).substring(2, 9),
        email: resolvedEmail.includes('@') ? resolvedEmail : `${resolvedEmail.toLowerCase()}@example.com`,
        username: rawId.includes('@') ? rawId.split('@')[0] : rawId,
      }
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUser))
      setSession({ user: demoUser })
      setUser(demoUser)
      setProfile({ id: demoUser.id, username: demoUser.username })
      return { user: demoUser }
    }
  }

  /**
   * Sign up with username, email, and password
   */
  const signup = async ({ username, email, password }) => {
    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim()

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            username: trimmedUsername,
          },
        },
      })
      if (error) throw error

      saveUsernameEmailMapping(trimmedUsername, trimmedEmail)

      if (data.session) {
        setSession(data.session)
        setUser(data.user)
        await loadProfile(data.user.id)
      }
      return data
    } else {
      // Offline fallback
      const demoUser = {
        id: 'demo-user-' + Math.random().toString(36).substring(2, 9),
        email: trimmedEmail,
        username: trimmedUsername,
      }
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUser))
      setSession({ user: demoUser })
      setUser(demoUser)
      setProfile({ id: demoUser.id, username: demoUser.username })
      return { user: demoUser, session: { user: demoUser } }
    }
  }

  /**
   * Update username
   */
  const updateUsername = useCallback(async (newUsername) => {
    const trimmed = newUsername.trim()
    if (!trimmed) throw new Error('Username cannot be empty.')

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.updateUser({
        data: { username: trimmed },
      })
      if (error) throw error

      try {
        await supabase.from('profiles').update({ username: trimmed }).eq('id', user.id)
      } catch (e) {
        console.warn('Could not update profiles table directly, user_metadata updated:', e)
      }

      setProfile((prev) => (prev ? { ...prev, username: trimmed } : { id: user.id, username: trimmed }))
      if (user?.email) {
        saveUsernameEmailMapping(trimmed, user.email)
      }
      return data
    } else {
      setProfile((prev) => ({ ...prev, username: trimmed }))
      return { success: true }
    }
  }, [user])

  /**
   * Update password
   */
  const updatePassword = async (newPassword) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) throw error
      return data
    } else {
      return { success: true }
    }
  }

  /**
   * Change user avatar
   */
  const updateAvatar = useCallback((avatarId) => {
    if (user?.id) {
      setUserAvatar(user.id, avatarId)
      setAvatarState(getUserAvatar(user.id))
    }
  }, [user])

  /**
   * Sign out
   */
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    } else {
      localStorage.removeItem(DEMO_STORAGE_KEY)
    }
    setSession(null)
    setUser(null)
    setProfile(null)
  }

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      username: profile?.username || user?.user_metadata?.username || user?.username || null,
      avatar,
      updateAvatar,
      updateUsername,
      AVATAR_OPTIONS,
      loading,
      isAuthenticated: Boolean(user),
      isSupabaseConfigured,
      login,
      signup,
      logout,
      updatePassword,
      refreshProfile: () => (user ? loadProfile(user.id) : Promise.resolve(null)),
    }),
    [session, user, profile, avatar, loading, updateUsername, updateAvatar]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Access the authentication state and actions
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

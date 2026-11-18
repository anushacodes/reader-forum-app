import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { supabase, isSupabaseConfigured } from './supabase.js'

const AuthContext = createContext(null)

const DEMO_STORAGE_KEY = 'dogear.demo_user'

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
   * Log in with email and password
   */
  const login = async ({ email, password }) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw error
      return data
    } else {
      // Offline fallback
      const demoUser = {
        id: 'demo-user-' + Math.random().toString(36).substring(2, 9),
        email: email.trim(),
        username: email.split('@')[0] || 'DemoReader',
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
      loading,
      isAuthenticated: Boolean(user),
      isSupabaseConfigured,
      login,
      signup,
      logout,
      updatePassword,
      refreshProfile: () => (user ? loadProfile(user.id) : Promise.resolve(null)),
    }),
    [session, user, profile, loading]
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

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** True when both client env vars are present. The UI shows a setup message otherwise. */
export const isSupabaseConfigured = Boolean(url && key)

/**
 * The single Supabase client for the app. Only ever use the publishable key here —
 * never a secret/service-role key (it would ship in the browser bundle).
 */
export const supabase = isSupabaseConfigured ? createClient(url, key) : null

// Supabase client initialization
import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only use env values if they look like real credentials
const isValidUrl = (s) => { try { const u = new URL(s); return u.protocol === 'https:' || u.protocol === 'http:' } catch { return false } }
const supabaseUrl = isValidUrl(rawUrl) ? rawUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = (rawKey && !rawKey.startsWith('your_')) ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

if (!isValidUrl(rawUrl) || !rawKey || rawKey.startsWith('your_')) {
  console.warn('Supabase credentials missing or invalid. Please update your .env file with real credentials from https://supabase.com/dashboard')
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)


import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://abckmjcxrlgikepbqucz.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2ttamN4cmxnaWtlcGJxdWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzI5MjQsImV4cCI6MjA3MjEwODkyNH0.WK3Rw8cKj1XkrmknkU1e3-n7h-bzSeEHhI-zJJo9muA'

// Validate that we have the required values
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  })
  
  // Don't throw in browser environment, just log
  if (typeof window === 'undefined') {
    throw new Error('Supabase configuration is required')
  }
}

// Get the current origin for redirects
const getRedirectUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`
  }
  return `${process.env.NEXT_PUBLIC_APP_URL || 'https://adorrable.dev'}/auth/callback`
}

// Create client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    redirectTo: getRedirectUrl(),
    flowType: 'pkce'
  }
})

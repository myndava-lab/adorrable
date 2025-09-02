import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Singleton pattern to prevent multiple client instances
declare global {
  var __supabase: ReturnType<typeof createClient> | undefined
}

export const supabase = globalThis.__supabase ?? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.__supabase = supabase
}
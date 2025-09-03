import { createBrowserClient } from '@supabase/ssr'

// Get the current domain for auth redirects
function getRedirectUrl() {
  if (typeof window !== 'undefined') {
    // In browser, use current origin
    return window.location.origin
  }
  // Fallback for server-side
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        redirectTo: `${getRedirectUrl()}/auth/callback`
      }
    }
  )
}

// Export a singleton instance for component use
export const supabase = createClient()
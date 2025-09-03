'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing auth callback...')
        console.log('Current URL:', window.location.href)
        console.log('Current origin:', window.location.origin)

        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('❌ Auth callback error:', error)
          router.push('/?error=auth_error')
          return
        }

        if (data.session) {
          console.log('✅ Auth successful, user:', data.session.user.email)
          // Small delay to ensure session is properly set
          setTimeout(() => {
            router.push('/')
          }, 1000)
        } else {
          console.log('❌ No session found')
          router.push('/')
        }
      } catch (error) {
        console.error('❌ Auth callback exception:', error)
        router.push('/?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-white">Processing authentication...</p>
        <p className="mt-2 text-gray-400 text-sm">Please wait while we complete your sign-in</p>
      </div>
    </div>
  )
}
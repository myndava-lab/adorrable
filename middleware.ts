
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Simple cookie-based auth gate - no Supabase imports needed
  const authCookie = request.cookies.get('sb-access-token') || 
                    request.cookies.get('sb-refresh-token') ||
                    request.cookies.get('supabase-auth-token')

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard') ||
                         request.nextUrl.pathname.startsWith('/profile') ||
                         request.nextUrl.pathname.startsWith('/settings')

  // Allow public routes
  if (!isProtectedPage) {
    return NextResponse.next()
  }

  // Redirect to home if no auth cookie on protected pages
  if (isProtectedPage && !authCookie) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

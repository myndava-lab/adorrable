import { NextRequest, NextResponse } from 'next/server'

// Simplified rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function middleware(request: NextRequest) {
  // Skip middleware for static assets and chunks
  if (
    request.nextUrl.pathname.startsWith('/_next/static/') ||
    request.nextUrl.pathname.startsWith('/_next/image/') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Basic rate limiting
  const ip = request.ip || 'unknown'
  const now = Date.now()
  const windowMs = 60 * 1000
  const maxRequests = 60

  const current = rateLimitStore.get(ip)

  if (!current || now > current.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
  } else if (current.count >= maxRequests) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  } else {
    current.count++
  }

  const response = NextResponse.next()

  // Minimal security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}
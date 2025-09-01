
import { NextRequest, NextResponse } from 'next/server'

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// CSP configuration
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' auth.util.repl.co;
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  img-src 'self' data: blob: https:;
  connect-src 'self' *.supabase.co wss://*.supabase.co;
  frame-src 'self' auth.util.repl.co;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim()

export function middleware(request: NextRequest) {
  // Rate limiting (30 requests per minute per IP)
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 30

  const current = rateLimitStore.get(ip)
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
  } else if (current.count >= maxRequests) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  } else {
    current.count++
  }

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }

  // Create response with security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-Rate-Limit-Remaining', String(maxRequests - (current?.count || 0)))

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}

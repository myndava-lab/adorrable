
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    
    const publicUrl = `${protocol}://${host}`
    
    console.log('🌐 URL Info:', {
      host,
      protocol,
      publicUrl,
      fullUrl: request.url
    })

    return NextResponse.json({
      success: true,
      publicUrl,
      host,
      protocol,
      fullUrl: request.url,
      isReplit: host?.includes('replit') || host?.includes('repl.co'),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ URL info error:', error)
    return NextResponse.json({
      error: 'Failed to get URL info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

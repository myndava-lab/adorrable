
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const publicUrl = `${protocol}://${host}`
    
    return NextResponse.json({
      success: true,
      publicUrl,
      host,
      protocol,
      testUrls: {
        health: `${publicUrl}/api/health`,
        test: `${publicUrl}/api/test`,
        credits: `${publicUrl}/api/credits?test=true`,
        ai: `${publicUrl}/api/ai/generate`,
        debug: `${publicUrl}/api/debug`
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get public URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

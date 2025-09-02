
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const publicUrl = `${protocol}://${host}`
  
  return NextResponse.json({
    publicUrl,
    testDatabaseUrl: `${publicUrl}/test-database`,
    host,
    protocol,
    headers: Object.fromEntries(request.headers.entries())
  })
}

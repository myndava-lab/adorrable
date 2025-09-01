
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { headers } from 'next/headers'

// Admin authentication check
async function isAdmin(authToken: string): Promise<boolean> {
  const { data: { user }, error } = await supabaseServer.auth.getUser(authToken)
  
  if (error || !user) return false
  
  // Check if user has admin role in profiles table
  const { data: profile } = await supabaseServer
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()
    
  // For now, consider 'enterprise' tier as admin - in production, add proper admin role
  return profile?.subscription_tier === 'enterprise' || 
         user.email === process.env.ADMIN_EMAIL
}

export async function GET(req: NextRequest) {
  try {
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAuthorized = await isAdmin(authorization.replace('Bearer ', ''))
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all pricing configurations
    const { data: pricing, error } = await supabaseServer
      .from('price_config')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      pricing: pricing
    })

  } catch (error: any) {
    console.error('Admin pricing fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAuthorized = await isAdmin(authorization.replace('Bearer ', ''))
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { tier, credits, price_usd, price_ngn, is_active } = await req.json()

    // Validate input
    if (!tier || !credits || !price_usd || !price_ngn) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update pricing configuration
    const { data, error } = await supabaseServer
      .from('price_config')
      .update({
        credits,
        price_usd,
        price_ngn,
        is_active: is_active ?? true,
        updated_at: new Date().toISOString()
      })
      .eq('tier', tier)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      pricing: data,
      message: 'Pricing updated successfully'
    })

  } catch (error: any) {
    console.error('Admin pricing update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

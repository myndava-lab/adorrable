
import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseServiceKey: !!supabaseServiceKey,
    supabaseAnonKey: !!supabaseAnonKey,
    nodeEnv: process.env.NODE_ENV
  })
  console.error('Available env keys:', Object.keys(process.env).filter(key => key.includes('SUPABASE')))
}

// Service role client for server-side operations
export const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Use the same singleton pattern for server-side client
declare global {
  var __supabaseServer: ReturnType<typeof createClient> | undefined
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? (globalThis.__supabaseServer ?? createClient(supabaseUrl, supabaseAnonKey))
  : null

if (process.env.NODE_ENV !== 'production' && supabase) {
  globalThis.__supabaseServer = supabase
}

// Server client for SSR/middleware
export function createServerSupabaseClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        })
        response.cookies.set({
          name,
          value,
          ...options,
        })
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        })
        response.cookies.set({
          name,
          value: '',
          ...options,
        })
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}

// Database types
export interface Profile {
  id: string
  email: string
  display_name?: string
  credits: number
  avatar_url?: string
  timezone?: string
  language?: string
  created_at: string
  updated_at: string
}

export interface CreditLog {
  id: number
  profile_id: string
  delta: number
  reason: string
  balance_after: number
  meta: Record<string, any>
  created_at: string
}

export interface PriceConfig {
  id: number
  package_name: string
  credits: number
  price_usd: number
  price_ngn?: number
  popular: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export interface PaymentTransaction {
  id: string
  profile_id: string
  package_name: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  provider: 'paystack' | 'nowpayments' | 'bank_transfer'
  provider_reference?: string
  provider_response: Record<string, any>
  credits_granted: number
  created_at: string
  updated_at: string
}

// Credit management functions
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

export async function createUserProfile(userId: string, email: string, displayName?: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        display_name: displayName,
        credits: 4 // Start with 4 free credits
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createUserProfile:', error)
    return null
  }
}

export async function grantCredits(
  userId: string,
  amount: number,
  reason: string,
  meta: Record<string, any> = {}
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin.rpc('grant_credits_and_log', {
      user_id: userId,
      credit_amount: amount,
      log_reason: reason,
      log_meta: meta
    })

    if (error) {
      console.error('Error granting credits:', error)
      return { success: false, error: error.message }
    }

    return {
      success: data.success,
      newBalance: data.new_balance,
      error: data.error
    }
  } catch (error) {
    console.error('Error in grantCredits:', error)
    return { success: false, error: 'Internal server error' }
  }
}

export async function deductCredits(
  userId: string,
  amount: number,
  reason: string,
  meta: Record<string, any> = {}
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin.rpc('deduct_credits_and_log', {
      user_id: userId,
      credit_amount: amount,
      log_reason: reason,
      log_meta: meta
    })

    if (error) {
      console.error('Error deducting credits:', error)
      return { success: false, error: error.message }
    }

    return {
      success: data.success,
      newBalance: data.new_balance,
      error: data.error
    }
  } catch (error) {
    console.error('Error in deductCredits:', error)
    return { success: false, error: 'Internal server error' }
  }
}

export async function getPriceConfigs(): Promise<PriceConfig[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('price_config')
      .select('*')
      .eq('active', true)
      .order('price_usd', { ascending: true })

    if (error) {
      console.error('Error fetching price configs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getPriceConfigs:', error)
    return []
  }
}

export async function getCreditLogs(userId: string, limit: number = 50): Promise<CreditLog[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('credit_logs')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching credit logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getCreditLogs:', error)
    return []
  }
}

export async function createPaymentTransaction(
  userId: string,
  packageName: string,
  amount: number,
  currency: string,
  provider: string
): Promise<PaymentTransaction | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        profile_id: userId,
        package_name: packageName,
        amount,
        currency,
        provider,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating payment transaction:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createPaymentTransaction:', error)
    return null
  }
}

export async function updatePaymentTransaction(
  transactionId: string,
  updates: Partial<PaymentTransaction>
): Promise<PaymentTransaction | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('payment_transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating payment transaction:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updatePaymentTransaction:', error)
    return null
  }
}

// Health check function
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not initialized')
      return false
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('count(*)')
      .limit(1)

    if (error) {
      console.error('Database query error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

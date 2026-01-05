import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from './server'

/**
 * Creates a Supabase client for API routes that supports both:
 * 1. Cookie-based auth (web browsers)
 * 2. Bearer token auth (mobile apps, external clients)
 * 
 * Usage in API routes:
 * ```
 * import { createApiClient, getAuthenticatedUser } from '@/lib/supabase/api'
 * 
 * export async function GET(request: Request) {
 *   const { supabase, user, error } = await getAuthenticatedUser(request)
 *   if (error) return NextResponse.json({ error }, { status: 401 })
 *   // ... use supabase client
 * }
 * ```
 */

export function createApiClient(authHeader: string | null) {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    }
  )
}

/**
 * Gets the authenticated user from either cookies (web) or Authorization header (mobile).
 * Returns the Supabase client and user if authenticated, or an error message.
 */
export async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get('Authorization')
  
  // If Authorization header is present, use token-based auth (mobile/API clients)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const supabase = createApiClient(authHeader)
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { 
        supabase: null, 
        user: null, 
        error: 'Invalid or expired token' 
      }
    }
    
    return { supabase, user, error: null }
  }
  
  // Otherwise, use cookie-based auth (web browsers)
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { 
      supabase: null, 
      user: null, 
      error: 'Unauthorized' 
    }
  }
  
  return { supabase, user, error: null }
}

/**
 * Helper to create an unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 })
}

/**
 * Helper to create an error response
 */
export function errorResponse(message: string, status: number = 500) {
  return Response.json({ error: message }, { status })
}

/**
 * Helper to create a success response
 */
export function successResponse(data: unknown, status: number = 200) {
  return Response.json({ data }, { status })
}


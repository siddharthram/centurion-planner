import { getAuthenticatedUser, successResponse, errorResponse, unauthorizedResponse } from '@/lib/supabase/api'

/**
 * GET /api/auth/me
 * 
 * Returns the current authenticated user's profile.
 * Works with both cookie auth (web) and Bearer token auth (mobile).
 */
export async function GET(request: Request) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !supabase || !user) {
      return unauthorizedResponse(authError || 'Unauthorized')
    }

    // Fetch user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Return user info even if profile doesn't exist yet
    return successResponse({
      id: user.id,
      email: user.email,
      emailVerified: user.email_confirmed_at !== null,
      createdAt: user.created_at,
      profile: profile || null,
    })
  } catch (error) {
    console.error('API error:', error)
    return errorResponse('Internal server error', 500)
  }
}

/**
 * PUT /api/auth/me
 * 
 * Updates the current user's profile.
 */
export async function PUT(request: Request) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !supabase || !user) {
      return unauthorizedResponse(authError || 'Unauthorized')
    }

    const body = await request.json()
    const { full_name, company_name, role } = body

    // Upsert profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email!,
        full_name,
        company_name,
        role,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse({
      id: user.id,
      email: user.email,
      profile: data,
    })
  } catch (error) {
    console.error('API error:', error)
    return errorResponse('Internal server error', 500)
  }
}


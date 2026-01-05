import { getAuthenticatedUser, successResponse, errorResponse, unauthorizedResponse } from '@/lib/supabase/api'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const { supabase, user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !supabase || !user) {
      return unauthorizedResponse(authError || 'Unauthorized')
    }

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Review not found', 404)
      }
      console.error('Database error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(data)
  } catch (error) {
    console.error('API error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const { supabase, user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !supabase || !user) {
      return unauthorizedResponse(authError || 'Unauthorized')
    }

    const body = await request.json()
    const { content, metadata } = body

    if (!content) {
      return errorResponse('Content is required', 400)
    }

    // Update review (RLS ensures user can only update their own reviews)
    const { data, error } = await supabase
      .from('reviews')
      .update({
        content,
        metadata: metadata !== undefined ? metadata : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Review not found', 404)
      }
      console.error('Database error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(data)
  } catch (error) {
    console.error('API error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const { supabase, user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !supabase || !user) {
      return unauthorizedResponse(authError || 'Unauthorized')
    }

    // Delete review (RLS ensures user can only delete their own reviews)
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return errorResponse(error.message, 500)
    }

    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return errorResponse('Internal server error', 500)
  }
}

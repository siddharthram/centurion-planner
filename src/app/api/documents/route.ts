import { getAuthenticatedUser, successResponse, errorResponse, unauthorizedResponse } from '@/lib/supabase/api'

const validDocumentTypes = ['life_vision', 'principles', 'memory']

export async function POST(request: Request) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !supabase || !user) {
      return unauthorizedResponse(authError || 'Unauthorized')
    }

    const body = await request.json()
    const { type, template_id, template_version, content, metadata } = body

    // Validate required fields
    if (!type || !template_id || !template_version || !content) {
      return errorResponse('Missing required fields: type, template_id, template_version, content', 400)
    }

    // Validate document type
    if (!validDocumentTypes.includes(type)) {
      return errorResponse(`Invalid document type. Must be one of: ${validDocumentTypes.join(', ')}`, 400)
    }

    // Insert document into database
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        type,
        template_id,
        template_version,
        content,
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(data, 201)
  } catch (error) {
    console.error('API error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function GET(request: Request) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !supabase || !user) {
      return unauthorizedResponse(authError || 'Unauthorized')
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (type) {
      if (!validDocumentTypes.includes(type)) {
        return errorResponse(`Invalid document type. Must be one of: ${validDocumentTypes.join(', ')}`, 400)
      }
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(data)
  } catch (error) {
    console.error('API error:', error)
    return errorResponse('Internal server error', 500)
  }
}

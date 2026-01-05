import { getTemplate, getAllTemplates, replaceVariables, getDateVariables } from '@/lib/content'
import { errorResponse, successResponse } from '@/lib/supabase/api'

/**
 * GET /api/templates
 * 
 * Returns a list of all available templates with metadata.
 * No authentication required - templates are public content.
 * 
 * Query params:
 *   - id: (optional) specific template ID to fetch with full content
 *   - withContent: (optional) "true" to include template content (only works with id)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('id')
    const withContent = searchParams.get('withContent') === 'true'

    // If specific template requested
    if (templateId) {
      try {
        const template = getTemplate(templateId)
        
        // Replace variables with current date values
        const dateVars = getDateVariables()
        const processedContent = replaceVariables(template.content, dateVars)

        return successResponse({
          id: templateId,
          metadata: template.metadata,
          content: withContent ? processedContent : undefined,
          rawContent: withContent ? template.content : undefined,
        })
      } catch {
        return errorResponse(`Template '${templateId}' not found`, 404)
      }
    }

    // Return list of all templates
    try {
      const templateIds = getAllTemplates()
      
      const templates = templateIds.map((id) => {
        try {
          const template = getTemplate(id)
          return {
            id,
            title: template.metadata.title,
            type: template.metadata.type,
            frequency: template.metadata.frequency,
            duration: template.metadata.duration,
            description: template.metadata.description,
            version: template.metadata.version,
          }
        } catch {
          return null
        }
      }).filter(Boolean)

      return successResponse(templates)
    } catch {
      // If content directory doesn't exist, return empty array
      return successResponse([])
    }
  } catch (error) {
    console.error('API error:', error)
    return errorResponse('Internal server error', 500)
  }
}


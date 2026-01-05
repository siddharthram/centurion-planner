import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getTemplate, replaceVariables, getDateVariables } from '@/lib/content'
import DocumentEditForm from './document-edit-form'

interface PageProps {
  params: Promise<{ type: string }>
}

const validDocumentTypes = ['north_star', 'vivid_vision', 'principles', 'memory']

const documentTypeMetadata: Record<string, { title: string; description: string; icon: string }> = {
  'north_star': {
    title: 'North Star',
    description: 'Your core purpose and values across all of life',
    icon: '⭐',
  },
  'vivid_vision': {
    title: 'Vivid Vision',
    description: 'A detailed picture of your ideal life 3 years from now',
    icon: '🔮',
  },
  'principles': {
    title: 'Principles',
    description: 'Decision-making framework and values',
    icon: '📐',
  },
  'memory': {
    title: 'Memory',
    description: 'Key insights and lessons learned',
    icon: '💡',
  },
}

export default async function DocumentPage({ params }: PageProps) {
  const { type } = await params
  const supabase = await createClient()

  // Validate document type
  if (!validDocumentTypes.includes(type)) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch existing document
  const { data: existingDoc } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', type)
    .single()

  // Load template from content system if no existing document
  let content = ''
  let templateId = ''
  let templateVersion = ''

  if (!existingDoc) {
    try {
      const template = getTemplate(type)
      content = replaceVariables(template.content, getDateVariables())
      templateId = template.metadata.id
      templateVersion = template.metadata.version
    } catch {
      // Template might not exist, use default content
      const dateVars = getDateVariables()
      content = `# ${documentTypeMetadata[type].title}\n\n**Last Updated**: ${dateVars.date}\n\n---\n\nStart writing your ${documentTypeMetadata[type].title.toLowerCase()} here...\n`
      templateId = type
      templateVersion = '1.0.0'
    }
  } else {
    content = existingDoc.content
    templateId = existingDoc.template_id
    templateVersion = existingDoc.template_version
  }

  const metadata = documentTypeMetadata[type]

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-3xl">{metadata.icon}</span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {metadata.title}
          </h1>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {metadata.description}
        </p>
        {existingDoc && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            Last updated {new Date(existingDoc.updated_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      <DocumentEditForm
        documentId={existingDoc?.id}
        initialContent={content}
        type={type}
        templateId={templateId}
        templateVersion={templateVersion}
      />
    </div>
  )
}

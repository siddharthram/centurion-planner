import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getGoalTemplate, replaceVariables, getDateVariables } from '@/lib/content'
import GoalEditForm from './goal-edit-form'

interface PageProps {
  params: Promise<{ type: string }>
}

const validGoalTypes = ['1-year']

const goalTypeMetadata: Record<string, { title: string; description: string }> = {
  '1-year': {
    title: '1-Year Goals',
    description: 'Concrete achievements for the next 12 months',
  },
}

export default async function GoalPage({ params }: PageProps) {
  const { type } = await params
  const supabase = await createClient()

  // Redirect old 3-year and 10-year pages to Life Vision
  if (type === '3-year' || type === '10-year') {
    redirect('/documents/life_vision')
  }

  // Validate goal type
  if (!validGoalTypes.includes(type)) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch existing goal document
  const { data: existingGoal } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', type)
    .single()

  // Load template from content system if no existing goal
  let content = ''
  let templateId = ''
  let templateVersion = ''

  if (!existingGoal) {
    try {
      // Convert URL format (1-year) to file format (1_year)
      const templateType = type.replace('-', '_') as '1_year' | '3_year' | '10_year'
      const template = getGoalTemplate(templateType)
      content = replaceVariables(template.content, getDateVariables())
      templateId = template.metadata?.id || `goals-${type}`
      templateVersion = template.metadata?.version || '1.0.0'
    } catch (error) {
      // Template might not exist, use empty content
      content = `# ${goalTypeMetadata[type].title}\n\n**Last Updated**: {{date}}\n\n---\n\n`
      templateId = `goals-${type}`
      templateVersion = '1.0.0'
    }
  } else {
    content = existingGoal.content
    templateId = existingGoal.template_id
    templateVersion = existingGoal.template_version
  }

  const metadata = goalTypeMetadata[type]

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          {metadata.title}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {metadata.description}
        </p>
        {existingGoal && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            Last updated {new Date(existingGoal.updated_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      <GoalEditForm
        goalId={existingGoal?.id}
        initialContent={content}
        type={type}
        templateId={templateId}
        templateVersion={templateVersion}
      />
    </div>
  )
}

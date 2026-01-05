import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTemplate, replaceVariables, getDateVariables } from '@/lib/content'
import DailyReviewForm from './daily-review-form'

export default async function NewDailyReviewPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get today's date
  const today = new Date().toISOString().split('T')[0]

  // Check if review already exists for today
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'daily')
    .eq('date', today)
    .single()

  if (existingReview) {
    redirect(`/reviews/daily/${today}`)
  }

  // Load template from content system
  const template = getTemplate('daily')
  const content = replaceVariables(template.content, getDateVariables())

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          {template.metadata.title}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {template.metadata.description} • {template.metadata.duration}
        </p>
      </div>

      <DailyReviewForm
        initialContent={content}
        templateId={template.metadata.id}
        templateVersion={template.metadata.version}
        date={today}
      />
    </div>
  )
}

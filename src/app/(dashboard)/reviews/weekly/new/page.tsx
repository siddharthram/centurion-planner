import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTemplate, replaceVariables, getDateVariables } from '@/lib/content'
import WeeklyReviewForm from './weekly-review-form'

export default async function NewWeeklyReviewPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get current week's date (use Monday as week start)
  const getWeekDate = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
    const monday = new Date(d.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  const thisWeek = getWeekDate(new Date())

  // Check if review already exists for this week
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'weekly')
    .eq('date', thisWeek)
    .single()

  if (existingReview) {
    redirect(`/reviews/weekly/${thisWeek}`)
  }

  // Load template from content system
  const template = getTemplate('weekly')
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

      <WeeklyReviewForm
        initialContent={content}
        templateId={template.metadata.id}
        templateVersion={template.metadata.version}
        date={thisWeek}
      />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import WeeklyReviewEditForm from './weekly-review-edit-form'

interface PageProps {
  params: Promise<{ date: string }>
}

export default async function WeeklyReviewViewPage({ params }: PageProps) {
  const { date } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the specific review
  const { data: review, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'weekly')
    .eq('date', date)
    .single()

  if (error || !review) {
    notFound()
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const startDate = new Date(dateStr + 'T00:00:00')
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)

    return `${startDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    })} - ${endDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}`
  }

  // Check if this is current week
  const getWeekDate = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  const thisWeek = getWeekDate(new Date())
  const isThisWeek = date === thisWeek

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Weekly Review
          </h1>
          {isThisWeek && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              This Week
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Week of {formatDate(date)}
        </p>
      </div>

      <WeeklyReviewEditForm
        reviewId={review.id}
        initialContent={review.content}
        date={date}
      />
    </div>
  )
}

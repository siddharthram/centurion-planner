import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import DailyReviewEditForm from './daily-review-edit-form'

interface PageProps {
  params: Promise<{ date: string }>
}

export default async function DailyReviewViewPage({ params }: PageProps) {
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
    .eq('type', 'daily')
    .eq('date', date)
    .single()

  if (error || !review) {
    notFound()
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr + 'T00:00:00')
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const isToday = date === new Date().toISOString().split('T')[0]

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Daily Check-In
          </h1>
          {isToday && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Today
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {formatDate(date)}
        </p>
      </div>

      <DailyReviewEditForm
        reviewId={review.id}
        initialContent={review.content}
        date={date}
      />
    </div>
  )
}

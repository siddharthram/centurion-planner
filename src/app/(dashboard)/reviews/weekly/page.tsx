import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function WeeklyReviewsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all weekly reviews
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'weekly')
    .order('date', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching reviews:', error)
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
  const thisWeekReview = reviews?.find((r) => r.date === thisWeek)

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const endOfWeek = new Date(date)
    endOfWeek.setDate(endOfWeek.getDate() + 6)

    return `${date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} - ${endOfWeek.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`
  }

  // Get preview text
  const getPreview = (content: string) => {
    const preview = content.replace(/^#.*\n/gm, '').trim()
    return preview.length > 150 ? preview.slice(0, 150) + '...' : preview
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Weekly Reviews
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              20-minute weekly reflections on progress and priorities
            </p>
          </div>

          <Link
            href={thisWeekReview ? `/reviews/weekly/${thisWeek}` : '/reviews/weekly/new'}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {thisWeekReview ? "This Week's Review" : 'New Review'}
          </Link>
        </div>

        {reviews && reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => {
              const isThisWeek = review.date === thisWeek
              return (
                <Link
                  key={review.id}
                  href={`/reviews/weekly/${review.date}`}
                  className="block rounded-lg border border-zinc-200 bg-white p-6 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                        Week of {formatDate(review.date)}
                      </h3>
                      {isThisWeek && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          This Week
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {getPreview(review.content)}
                  </p>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              No weekly reviews yet
            </h2>
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              Start your first weekly reflection to review progress and plan ahead.
            </p>
            <Link
              href="/reviews/weekly/new"
              className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Create Your First Review
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

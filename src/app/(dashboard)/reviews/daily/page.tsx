import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DailyReviewsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all daily reviews
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'daily')
    .order('date', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching reviews:', error)
  }

  // Check if today's review exists
  const today = new Date().toISOString().split('T')[0]
  const todayReview = reviews?.find((r) => r.date === today)

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Get preview text (first 150 characters)
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
              Daily Reviews
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              5-minute daily check-ins for energy and momentum
            </p>
          </div>

          <Link
            href={todayReview ? `/reviews/daily/${today}` : '/reviews/daily/new'}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {todayReview ? "Today's Review" : 'New Review'}
          </Link>
        </div>

        {reviews && reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => {
              const isToday = review.date === today
              return (
                <Link
                  key={review.id}
                  href={`/reviews/daily/${review.date}`}
                  className="block rounded-lg border border-zinc-200 bg-white p-6 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {formatDate(review.date)}
                      </h3>
                      {isToday && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Today
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(review.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
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
              No daily reviews yet
            </h2>
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              Start your first daily check-in to track your energy and momentum.
            </p>
            <Link
              href="/reviews/daily/new"
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

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function GoalsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch 1-year goal document
  const { data: goal } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('time_horizon', '1_year')
    .single()

  const lastUpdated = goal
    ? new Date(goal.updated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Goals
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Your tactical annual objectives
          </p>
        </div>

        <Link
          href="/goals/1-year"
          className="block rounded-lg border border-amber-300 bg-amber-50 p-8 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/30 dark:hover:bg-amber-950/50"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2 text-4xl">🎯</div>
              <h2 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                1-Year Goals
              </h2>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                Concrete achievements for the next 12 months across career, relationships, health, finances, meaning, and fun.
              </p>
              {lastUpdated ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  Last updated {lastUpdated}
                </p>
              ) : (
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  ✨ Not yet created — start here
                </p>
              )}
            </div>
            <span className="text-zinc-400">→</span>
          </div>
        </Link>

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            About Goals
          </h2>
          <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              <strong>1-Year Goals</strong> are your tactical objectives — specific, measurable achievements you want to accomplish in the next 12 months.
            </p>
            <p>
              Your longer-term vision (3-year milestones and 10-year aspirations) lives in your{' '}
              <Link href="/documents/life_vision" className="text-amber-600 hover:underline dark:text-amber-400">
                Life Vision
              </Link>{' '}
              document. Start there if you haven't defined where you're going.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function GoalsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all goal documents
  const { data: goals, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching goals:', error)
  }

  const goalTypes = [
    {
      type: '1-year',
      title: '1-Year Goals',
      description: 'Concrete achievements for the next 12 months',
      color: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
    },
    {
      type: '3-year',
      title: '3-Year Goals',
      description: 'Strategic direction and major milestones',
      color: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
      hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900',
    },
    {
      type: '10-year',
      title: '10-Year Goals',
      description: 'Bold vision and long-term aspirations',
      color: 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',
      hoverColor: 'hover:bg-amber-100 dark:hover:bg-amber-900',
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Goals
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Define your trajectory across three time horizons
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {goalTypes.map((goalType) => {
            const goal = goals?.find((g) => g.type === goalType.type)
            const lastUpdated = goal
              ? new Date(goal.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : null

            return (
              <Link
                key={goalType.type}
                href={`/goals/${goalType.type}`}
                className={`block rounded-lg border p-6 transition-colors ${goalType.color} ${goalType.hoverColor}`}
              >
                <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {goalType.title}
                </h2>
                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {goalType.description}
                </p>
                {lastUpdated ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    Last updated {lastUpdated}
                  </p>
                ) : (
                  <p className="text-xs italic text-zinc-500 dark:text-zinc-500">
                    Not yet created
                  </p>
                )}
              </Link>
            )
          })}
        </div>

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            About Goal Setting
          </h2>
          <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              Goals work backwards from your aspirations. Start with your 10-year vision,
              then work backwards to define 3-year milestones and 1-year achievements.
            </p>
            <p>
              Each goal document is a living canvas. Update them regularly as you learn
              and as circumstances change. They guide your quarterly and annual reviews.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

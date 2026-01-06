import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getLevel, getStreakMessage, isStreakAtRisk, ACHIEVEMENTS, getAchievement } from '@/lib/gamification'

interface SetupStep {
  id: string
  title: string
  description: string
  href: string
  completed: boolean
  icon: string
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all data in parallel
  const [documentsResult, goalsResult, reviewsResult, statsResult, achievementsResult, recentReviewsResult] = await Promise.all([
    supabase
      .from('documents')
      .select('type')
      .eq('user_id', user.id),
    supabase
      .from('goals')
      .select('type')
      .eq('user_id', user.id),
    supabase
      .from('reviews')
      .select('type')
      .eq('user_id', user.id)
      .limit(1),
    supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('user_achievements')
      .select('achievement_id, earned_at')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(5),
    supabase
      .from('reviews')
      .select('date, type')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30),
  ])

  const documents = documentsResult.data || []
  const goals = goalsResult.data || []
  const hasReviews = (reviewsResult.data || []).length > 0
  const stats = statsResult.data
  const earnedAchievements = achievementsResult.data || []
  const recentReviews = recentReviewsResult.data || []

  // Check what's completed
  const hasLifeVision = documents.some(d => d.type === 'life_vision')
  const has1YearGoals = goals.some(g => g.time_horizon === '1_year')

  // Calculate stats (use defaults if no stats row yet)
  const currentStreak = stats?.current_daily_streak || 0
  const longestStreak = stats?.longest_daily_streak || 0
  const totalPoints = stats?.total_points || 0
  const lastDailyReviewDate = stats?.last_daily_review_date || null
  
  const streakAtRisk = isStreakAtRisk(lastDailyReviewDate)
  const streakMessage = getStreakMessage(currentStreak, streakAtRisk)
  const levelInfo = getLevel(totalPoints)

  // Check if user has done a review today
  const today = new Date().toISOString().split('T')[0]
  const hasReviewedToday = recentReviews.some(r => r.date === today)

  // Define the setup journey (simplified: Life Vision → 1-Year Goals → Reviews)
  const setupSteps: SetupStep[] = [
    {
      id: 'life-vision',
      title: 'Create Your Life Vision',
      description: 'Define who you are, where you're going (10-year vision), and how you'll get there (3-year milestones).',
      href: '/documents/life_vision',
      completed: hasLifeVision,
      icon: '🧭',
    },
    {
      id: 'goals-1',
      title: 'Set 1-Year Goals',
      description: 'Define concrete, actionable goals for the next 12 months across all areas of life.',
      href: '/goals/1-year',
      completed: has1YearGoals,
      icon: '🎯',
    },
    {
      id: 'reviews',
      title: 'Start Your Review Practice',
      description: 'Begin tracking your progress with daily and weekly reviews.',
      href: '/reviews/daily/new',
      completed: hasReviews,
      icon: '📝',
    },
  ]

  const completedSteps = setupSteps.filter(s => s.completed).length
  const nextStep = setupSteps.find(s => !s.completed)
  const isFullySetUp = completedSteps === setupSteps.length

  return (
    <div className="mx-auto max-w-4xl p-8">
      {/* Stats Bar - Always visible */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {/* Streak */}
        <div className={`rounded-xl border p-4 ${
          streakAtRisk 
            ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30' 
            : currentStreak > 0 
            ? 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30'
            : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentStreak > 0 ? '🔥' : '💤'}</span>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {currentStreak}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">day streak</p>
            </div>
          </div>
          {longestStreak > currentStreak && (
            <p className="mt-1 text-xs text-zinc-400">Best: {longestStreak} days</p>
          )}
        </div>

        {/* Points */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {totalPoints.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">points</p>
            </div>
          </div>
        </div>

        {/* Level */}
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                {levelInfo.title}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">Level {levelInfo.level}</p>
            </div>
          </div>
          <div className="mt-2 h-1.5 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streak Warning or Encouragement */}
      {(streakAtRisk || (!hasReviewedToday && isFullySetUp)) && (
        <div className={`mb-6 rounded-lg border p-4 ${
          streakAtRisk
            ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
            : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{streakAtRisk ? '⚠️' : '👋'}</span>
              <p className={`text-sm font-medium ${
                streakAtRisk 
                  ? 'text-amber-800 dark:text-amber-200'
                  : 'text-blue-800 dark:text-blue-200'
              }`}>
                {streakAtRisk 
                  ? `Your ${currentStreak}-day streak is at risk! Review today to keep it alive.`
                  : "You haven't done your daily review yet. Ready to reflect?"
                }
              </p>
            </div>
            <Link
              href="/reviews/daily/new"
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                streakAtRisk
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Start Review
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          {isFullySetUp ? 'Welcome Back' : 'Welcome to Centurion'}
        </h1>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
          {isFullySetUp
            ? streakMessage
            : "Let's build your century, step by step."}
        </p>
      </div>

      {/* Recent Achievements */}
      {earnedAchievements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
            Recent Achievements
          </h2>
          <div className="flex flex-wrap gap-2">
            {earnedAchievements.map(({ achievement_id }) => {
              const achievement = getAchievement(achievement_id)
              if (!achievement) return null
              return (
                <div
                  key={achievement_id}
                  className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800"
                  title={achievement.description}
                >
                  <span>{achievement.icon}</span>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {achievement.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Setup Progress bar */}
      {!isFullySetUp && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Setup Progress
            </span>
            <span className="text-sm text-zinc-500">
              {completedSteps} of {setupSteps.length} complete
            </span>
          </div>
          <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(completedSteps / setupSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Setup Steps */}
      <div className="space-y-4 mb-12">
        {setupSteps.map((step, index) => {
          const isNext = step === nextStep
          const isPast = step.completed
          const isFuture = !isPast && !isNext

          return (
            <Link
              key={step.id}
              href={step.href}
              className={`block rounded-xl border p-6 transition-all ${
                isPast
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30'
                  : isNext
                  ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-500 dark:border-blue-800 dark:bg-blue-950/30'
                  : 'border-zinc-200 bg-white opacity-60 dark:border-zinc-800 dark:bg-zinc-900'
              } ${!isFuture ? 'hover:shadow-md' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${
                  isPast
                    ? 'bg-emerald-500 text-white'
                    : isNext
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-200 dark:bg-zinc-700'
                }`}>
                  {isPast ? '✓' : step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${
                      isPast
                        ? 'text-emerald-900 dark:text-emerald-100'
                        : isNext
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}>
                      {index + 1}. {step.title}
                    </h3>
                    {isPast && (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        ✓ Complete
                      </span>
                    )}
                    {isNext && (
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        Start Here →
                      </span>
                    )}
                  </div>
                  <p className={`mt-1 text-sm ${
                    isPast
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : isNext
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions for returning users */}
      {isFullySetUp && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/reviews/daily/new"
              className={`flex items-center gap-3 rounded-lg border p-4 transition-colors ${
                hasReviewedToday
                  ? 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800'
                  : 'border-blue-300 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:hover:bg-blue-900/30'
              }`}
            >
              <span className="text-2xl">📝</span>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                  {hasReviewedToday ? 'Add Another Review' : 'Daily Review'}
                </h3>
                <p className="text-sm text-zinc-500">
                  {hasReviewedToday ? 'Already done today ✓' : '+10 points • Extend your streak'}
                </p>
              </div>
            </Link>
            <Link
              href="/reviews/weekly"
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <span className="text-2xl">📅</span>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Weekly Review</h3>
                <p className="text-sm text-zinc-500">+25 points • Plan ahead</p>
              </div>
            </Link>
            <Link
              href="/goals"
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Review Goals</h3>
                <p className="text-sm text-zinc-500">Check your progress</p>
              </div>
            </Link>
            <Link
              href="/documents/life_vision"
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <span className="text-2xl">🧭</span>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Life Vision</h3>
                <p className="text-sm text-zinc-500">Revisit your foundation</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Helpful tip for new users */}
      {!isFullySetUp && nextStep && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h3 className="font-medium text-amber-900 dark:text-amber-100">
                Why this order?
              </h3>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                Your Life Vision defines who you are and where you're going. Your 1-year goals make it actionable.
                Your reviews track your progress. Each step builds on the last — that's what makes this a system, not just a collection of documents.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Points breakdown for transparency */}
      {isFullySetUp && (
        <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            How to Earn Points
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">📝</span>
              <span className="text-zinc-600 dark:text-zinc-400">Daily: +10</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">📅</span>
              <span className="text-zinc-600 dark:text-zinc-400">Weekly: +25</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">🔥</span>
              <span className="text-zinc-600 dark:text-zinc-400">Streak: +5/day</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">🏆</span>
              <span className="text-zinc-600 dark:text-zinc-400">Achievements: +50-200</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

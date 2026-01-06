import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, redirect to the dashboard/home
  if (user) {
    redirect('/home')
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-sky-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.05) 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }} />

      {/* Floating gradient orbs */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 opacity-40 blur-3xl dark:from-amber-900 dark:to-orange-900 dark:opacity-20" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-sky-200 to-indigo-300 opacity-40 blur-3xl dark:from-sky-900 dark:to-indigo-900 dark:opacity-20" />

      <main className="relative z-10 flex flex-col items-center gap-8 px-8 text-center">
        {/* Hero */}
        <div className="flex flex-col gap-4">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl shadow-lg shadow-orange-500/25">
            ⚡
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              Centurion
            </span>{' '}
            Planner
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Build your century. One day at a time.
          </p>
        </div>

        {/* Feature cards */}
        <div className="flex max-w-2xl flex-col gap-4 text-left">
          <div className="group rounded-xl border border-zinc-200/80 bg-white/80 p-6 backdrop-blur-sm transition-all hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/10 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-amber-700">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-xl dark:bg-amber-900/30">
              📝
            </div>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Daily & Weekly Check-ins
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              5-minute daily reflections and 20-minute weekly reviews to track energy, wins, and priorities
            </p>
          </div>

          <div className="group rounded-xl border border-zinc-200/80 bg-white/80 p-6 backdrop-blur-sm transition-all hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/10 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-sky-700">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-xl dark:bg-sky-900/30">
              🎯
            </div>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Proven Frameworks
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Built on{' '}
              <a href="https://twitter.com/businessbarista" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300">Life Map (Lieberman)</a>,{' '}
              <a href="https://www.cameronherold.com/vivid-vision" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300">Vivid Vision (Robbins/Herold)</a>,{' '}
              <a href="https://dranthonygustin.com" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300">Annual Reviews (Gustin)</a>, and{' '}
              <a href="https://tim.blog/lifestyle-costing/" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300">Dreamlining (Ferriss)</a>
            </p>
          </div>

          <div className="group rounded-xl border border-zinc-200/80 bg-white/80 p-6 backdrop-blur-sm transition-all hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/10 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-violet-700">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-xl dark:bg-violet-900/30">
              ✨
            </div>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Pattern Recognition
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              AI-powered insights from your past reviews to identify blind spots and recurring themes
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="/signup"
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 text-sm font-medium text-white shadow-lg shadow-orange-500/25 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-xl hover:shadow-orange-500/30"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="rounded-full border border-zinc-300 bg-white/80 px-8 py-3 text-sm font-medium text-zinc-900 backdrop-blur-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Login
          </a>
        </div>

        {/* Tagline */}
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
          For anyone who values <span className="font-medium text-zinc-700 dark:text-zinc-300">clarity</span> over complexity
        </p>

        {/* Social proof hint */}
        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
          <span className="flex -space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs text-white ring-2 ring-white dark:ring-zinc-900">🔥</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-xs text-white ring-2 ring-white dark:ring-zinc-900">⭐</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500 text-xs text-white ring-2 ring-white dark:ring-zinc-900">💪</span>
          </span>
          <span>Build streaks, earn achievements, level up your life</span>
        </div>
      </main>
    </div>
  );
}

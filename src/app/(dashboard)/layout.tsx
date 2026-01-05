import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '../(auth)/actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                href="/home"
                className="flex items-center gap-2 text-lg font-bold"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-sm text-white shadow-sm">
                  ⚡
                </span>
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">
                  Centurion
                </span>
              </Link>

              <div className="flex gap-4">
                {/* Foundation first */}
                <Link
                  href="/documents"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Foundation
                </Link>
                {/* Then goals */}
                <Link
                  href="/goals"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Goals
                </Link>
                {/* Then reviews (execution) */}
                <Link
                  href="/reviews/daily"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Daily
                </Link>
                <Link
                  href="/reviews/weekly"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Weekly
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <form>
                <button
                  formAction={logout}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      {children}
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DocumentsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all documents
  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
  }

  const documentTypes = [
    {
      type: 'life_vision',
      title: 'Life Vision',
      description: 'Your identity, 10-year vision, and 3-year milestones — all in one place',
      icon: '🧭',
      primary: true,
    },
    {
      type: 'principles',
      title: 'Principles',
      description: 'Decision-making framework and values',
      icon: '📐',
    },
    {
      type: 'memory',
      title: 'Memory',
      description: 'Key insights and lessons learned',
      icon: '💡',
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Foundational Documents
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Core documents that anchor your decision-making and growth
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {documentTypes.map((docType) => {
            const doc = documents?.find((d) => d.type === docType.type)
            const lastUpdated = doc
              ? new Date(doc.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : null
            const isPrimary = 'primary' in docType && docType.primary

            return (
              <Link
                key={docType.type}
                href={`/documents/${docType.type}`}
                className={`block rounded-lg border p-6 transition-colors ${
                  isPrimary
                    ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/30 dark:hover:bg-amber-950/50'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="mb-3 text-3xl">{docType.icon}</div>
                <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {docType.title}
                </h2>
                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {docType.description}
                </p>
                {isPrimary && !doc && (
                  <p className="mb-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                    ✨ Start here
                  </p>
                )}
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
            About Foundational Documents
          </h2>
          <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              <strong>Life Vision:</strong> Your master document — who you are (identity & values), where you're going (10-year vision), and how you'll get there (3-year milestones). This is the foundation everything else builds on.
            </p>
            <p>
              <strong>Principles:</strong> Rules and frameworks for decision-making. How you operate and what guides your choices.
            </p>
            <p>
              <strong>Memory:</strong> Key insights, lessons learned, and patterns you've discovered about yourself. Updated after major reviews and realizations.
            </p>
          </div>
          <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
            For tactical annual goals, use the <Link href="/goals/1_year" className="text-amber-600 hover:underline dark:text-amber-400">1-Year Goals</Link> page.
          </p>
        </div>
      </div>
    </div>
  )
}

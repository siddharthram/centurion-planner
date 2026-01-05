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
      type: 'north_star',
      title: 'North Star',
      description: 'Your core purpose and values across all of life',
      icon: '⭐',
    },
    {
      type: 'vivid_vision',
      title: 'Vivid Vision',
      description: 'A detailed picture of your ideal life 3 years from now',
      icon: '🔮',
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {documentTypes.map((docType) => {
            const doc = documents?.find((d) => d.type === docType.type)
            const lastUpdated = doc
              ? new Date(doc.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : null

            return (
              <Link
                key={docType.type}
                href={`/documents/${docType.type}`}
                className="block rounded-lg border border-zinc-200 bg-white p-6 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <div className="mb-3 text-3xl">{docType.icon}</div>
                <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {docType.title}
                </h2>
                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {docType.description}
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
            About Foundational Documents
          </h2>
          <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              <strong>North Star:</strong> Your ultimate purpose and values across all of life — who you want to be, what you stand for, and the legacy you're building.
            </p>
            <p>
              <strong>Vivid Vision:</strong> A detailed, immersive picture of your ideal life 3 years from now — career, relationships, health, home, and everything that matters to you. Written in present tense as if it's already happened.
            </p>
            <p>
              <strong>Principles:</strong> Rules and frameworks for decision-making. How you operate and what guides your choices.
            </p>
            <p>
              <strong>Memory:</strong> Key insights, lessons learned, and patterns you've discovered about yourself across all areas of life.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

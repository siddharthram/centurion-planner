'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MarkdownEditor } from '@/components/markdown-editor'

interface GoalEditFormProps {
  goalId?: string
  initialContent: string
  type: string
  templateId: string
  templateVersion: string
}

export default function GoalEditForm({
  goalId,
  initialContent,
  type,
  templateId,
  templateVersion,
}: GoalEditFormProps) {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (goalId) {
        // Update existing goal
        const response = await fetch(`/api/goals/${goalId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to update goal')
        }

        setSuccessMessage('Goal updated successfully')
      } else {
        // Create new goal
        const response = await fetch('/api/goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
            template_id: templateId,
            template_version: templateVersion,
            content,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to create goal')
        }

        setSuccessMessage('Goal created successfully')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          {successMessage}
        </div>
      )}

      <MarkdownEditor
        value={content}
        onChange={setContent}
        placeholder="Define your goals..."
        minHeight="600px"
      />

      <div className="flex justify-end gap-3">
        <Link
          href="/goals"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back to Goals
        </Link>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSaving ? 'Saving...' : goalId ? 'Save Changes' : 'Create Goal'}
        </button>
      </div>
    </div>
  )
}

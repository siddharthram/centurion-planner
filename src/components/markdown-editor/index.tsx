'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

type ViewMode = 'write' | 'preview' | 'split'

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  minHeight = '600px',
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split')

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('write')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'write'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            ✏️ Write
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            📐 Split
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'preview'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            👁️ Preview
          </button>
        </div>
        <span className="text-xs text-zinc-500">
          {value.length} characters
        </span>
      </div>

      {/* Editor / Preview */}
      <div
        className={`${viewMode === 'split' ? 'grid grid-cols-2' : ''}`}
        style={{ minHeight }}
      >
        {/* Write pane */}
        {(viewMode === 'write' || viewMode === 'split') && (
          <div className={viewMode === 'split' ? 'border-r border-zinc-200 dark:border-zinc-800' : ''}>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-full resize-none border-0 bg-transparent p-6 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder-zinc-500"
              placeholder={placeholder}
              style={{ minHeight }}
            />
          </div>
        )}

        {/* Preview pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className="overflow-auto p-6"
            style={{ minHeight }}
          >
            {value.trim() ? (
              <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h1:border-b prose-h1:pb-2 prose-h1:border-zinc-200 dark:prose-h1:border-zinc-700 prose-h2:text-xl prose-h3:text-lg prose-p:leading-relaxed prose-li:marker:text-zinc-500 prose-hr:border-zinc-200 dark:prose-hr:border-zinc-700 prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 prose-a:text-blue-600 dark:prose-a:text-blue-400">
                <ReactMarkdown>{value}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-zinc-400 dark:text-zinc-500 italic">
                Nothing to preview yet. Start writing on the left.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MarkdownEditor


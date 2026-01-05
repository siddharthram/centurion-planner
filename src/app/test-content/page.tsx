import { getTemplate, replaceVariables, getDateVariables } from '@/lib/content';

export default function TestContentPage() {
  // Load the daily template
  const template = getTemplate('daily');

  // Replace variables with actual values
  const content = replaceVariables(template.content, getDateVariables());

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-4 text-3xl font-bold">Content Loader Test</h1>

      <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-2 text-xl font-semibold">Template Metadata</h2>
        <pre className="overflow-auto text-sm">
          {JSON.stringify(template.metadata, null, 2)}
        </pre>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-xl font-semibold">Rendered Content</h2>
        <pre className="whitespace-pre-wrap text-sm">{content}</pre>
      </div>
    </div>
  );
}

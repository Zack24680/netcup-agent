import ReactMarkdown from 'react-markdown';

/**
 * ScriptViewer — renders a generated script in Markdown
 * Props:
 *   script  — Script | null
 *   loading — boolean
 */
export default function ScriptViewer({ script, loading }) {
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-600">
        <div className="w-10 h-10 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
        <p className="text-sm">Generating your script…</p>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-panel border border-border flex items-center justify-center text-2xl">🌙</div>
        <h3 className="text-lg font-semibold text-white">No script selected</h3>
        <p className="text-sm text-gray-600 max-w-xs">
          Fill in the form on the left to generate a personalised hypnotherapy script, or select one from your history.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      {/* Script meta */}
      <div className="mb-6 pb-6 border-b border-border">
        <h2 className="text-xl font-semibold text-white mb-2">{script.title}</h2>
        <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500">
          <span>{new Date(script.createdAt).toLocaleString()}</span>
          <span>·</span>
          <span className="capitalize">{script.tone} tone</span>
          <span>·</span>
          <span>{script.duration} min</span>
          <span>·</span>
          <div className="flex flex-wrap gap-1">
            {script.symptoms.map((s) => (
              <span key={s} className="tag">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Script content */}
      <div className="prose prose-invert prose-sm max-w-none font-mono text-sm leading-relaxed">
        <ReactMarkdown>{script.content}</ReactMarkdown>
      </div>

      {/* Copy button */}
      <button
        className="mt-6 btn-ghost text-sm border border-border"
        onClick={() => navigator.clipboard.writeText(script.content)}
      >
        Copy to clipboard
      </button>
    </div>
  );
}

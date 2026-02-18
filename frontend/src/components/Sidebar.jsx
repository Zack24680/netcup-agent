/**
 * Sidebar — displays the user's saved script history
 * Props:
 *   scripts      — Script[]
 *   activeId     — string | null
 *   onSelect     — (script: Script) => void
 *   onDelete     — (id: string) => void
 *   loading      — boolean
 */
export default function Sidebar({ scripts = [], activeId, onSelect, onDelete, loading }) {
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-panel h-full overflow-y-auto flex flex-col">
      <div className="px-4 py-4 border-b border-border">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Script History</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="px-4 py-6 text-sm text-gray-600">Loading…</p>
        )}

        {!loading && scripts.length === 0 && (
          <p className="px-4 py-6 text-sm text-gray-600">No scripts yet. Generate your first one!</p>
        )}

        {!loading && scripts.map((script) => (
          <div
            key={script.id}
            className={`group px-4 py-3 cursor-pointer border-b border-border/50 hover:bg-white/5 transition-colors ${
              activeId === script.id ? 'bg-accent/10 border-l-2 border-l-accent' : ''
            }`}
            onClick={() => onSelect(script)}
          >
            <p className="text-sm font-medium text-white truncate">{script.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(script.createdAt).toLocaleDateString()}
              {' · '}{script.duration}min
            </p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {script.symptoms.slice(0, 2).map((s) => (
                <span key={s} className="tag">{s}</span>
              ))}
              {script.symptoms.length > 2 && (
                <span className="tag">+{script.symptoms.length - 2}</span>
              )}
            </div>
            {/* Delete button — visible on hover */}
            <button
              className="mt-2 text-xs text-red-500/70 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); onDelete(script.id); }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}

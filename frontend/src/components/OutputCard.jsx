export default function OutputCard({ title, children, onExport, exportLoading }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-blue-50 border-b border-blue-100">
        <h3 className="font-semibold text-blue-900 text-base">{title}</h3>
        <div className="flex gap-2">
          {onExport && (
            <button
              onClick={onExport}
              disabled={exportLoading}
              className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors"
            >
              {exportLoading ? '⏳ Exporting…' : '⬇️ Export PDF'}
            </button>
          )}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

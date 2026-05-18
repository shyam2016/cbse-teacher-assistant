import { useState } from 'react'
import TopicSelector from '../components/TopicSelector'
import OutputCard from '../components/OutputCard'
import { mindmapAPI, exportAPI } from '../api/client'

const INIT = { subject: '', class_level: '', chapter: '', topic: '' }

export default function MindMapGen() {
  const [form, setForm] = useState(INIT)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('mindmap')

  const generate = async () => {
    if (!form.subject || !form.class_level || !form.topic) {
      setError('Please fill in Subject, Class and Topic.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await mindmapAPI.generate(form)
      setResult(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!result) return
    setExportLoading(true)
    try {
      const title = `Mind Map – ${form.topic} (${form.class_level})`
      const res = await exportAPI.pdf({ content_type: 'mindmap', title, content: result })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('PDF export failed.')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mind Maps & Flash Cards</h1>
        <p className="text-gray-500 text-sm mt-1">Generate visual mind maps, flash cards, and board exam questions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <TopicSelector values={form} onChange={setForm} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          onClick={generate}
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? '⏳ Generating…' : '🧠 Generate'}
        </button>
      </div>

      {result && (
        <OutputCard title="Mind Map & Flash Cards" onExport={handleExport} exportLoading={exportLoading}>
          {/* Tabs */}
          <div className="flex gap-1 mb-5 border-b border-gray-200">
            {[['mindmap', '🗺 Mind Map'], ['flashcards', '🃏 Flash Cards'], ['pyq', '📌 Important Qs']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  tab === key
                    ? 'border-blue-700 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'mindmap' && result.mind_map && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-blue-700 text-white px-6 py-3 rounded-full font-bold text-sm shadow-md">
                  {result.mind_map.central_topic}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {result.mind_map.branches?.map((branch, i) => (
                  <div key={i} className="border border-blue-100 rounded-xl p-4 bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 bg-blue-700 rounded-full"></span>
                      <h5 className="font-semibold text-blue-900 text-sm">{branch.name}</h5>
                    </div>
                    <ul className="space-y-1">
                      {branch.sub_topics?.map((sub, j) => (
                        <li key={j} className="text-xs text-gray-700 flex gap-2">
                          <span className="text-blue-400">→</span>{sub}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'flashcards' && result.flash_cards && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.flash_cards.map((card, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-blue-700 text-white px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                    {card.term}
                  </div>
                  <div className="px-4 py-3 text-sm text-gray-700 bg-blue-50 leading-relaxed">
                    {card.definition}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'pyq' && result.pyq_questions && (
            <div className="space-y-4">
              {result.pyq_questions.map((q, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-gray-800">Q{i + 1}. {q.question}</p>
                    <div className="flex gap-1 flex-shrink-0">
                      {q.type && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">{q.type}</span>
                      )}
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{q.marks}m</span>
                    </div>
                  </div>
                  <div className="text-xs text-green-700 leading-relaxed">
                    <span className="font-medium">Ans: </span>{q.answer}
                  </div>
                </div>
              ))}
            </div>
          )}
        </OutputCard>
      )}
    </div>
  )
}

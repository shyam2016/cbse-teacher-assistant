import { useState } from 'react'
import TopicSelector from '../components/TopicSelector'
import OutputCard from '../components/OutputCard'
import { homeworkAPI, exportAPI } from '../api/client'

const INIT = { subject: '', class_level: '', chapter: '', topic: '' }
const DIFFICULTIES = ['easy', 'moderate', 'advanced']

export default function HomeworkGen() {
  const [form, setForm] = useState(INIT)
  const [difficulty, setDifficulty] = useState('moderate')
  const [numShort, setNumShort] = useState(4)
  const [numLong, setNumLong] = useState(2)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAnswers, setShowAnswers] = useState(false)

  const generate = async () => {
    if (!form.subject || !form.class_level || !form.topic) {
      setError('Please fill in Subject, Class and Topic.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await homeworkAPI.generate({
        ...form, difficulty,
        num_short: numShort,
        num_long: numLong,
      })
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
      const title = `Homework – ${form.topic} (${form.class_level})`
      const res = await exportAPI.pdf({ content_type: 'homework', title, content: result })
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

  const diffColors = { easy: 'bg-green-100 text-green-800', moderate: 'bg-yellow-100 text-yellow-800', advanced: 'bg-red-100 text-red-800' }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Homework Generator</h1>
        <p className="text-gray-500 text-sm mt-1">Create customized, print-ready homework sheets</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <TopicSelector values={form} onChange={setForm} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${
                  difficulty === d
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-xs">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short (2 marks)</label>
            <input type="number" min={1} max={8} value={numShort}
              onChange={(e) => setNumShort(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Long (4 marks)</label>
            <input type="number" min={1} max={5} value={numLong}
              onChange={(e) => setNumLong(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={generate}
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? '⏳ Generating…' : '📝 Generate Homework'}
        </button>
      </div>

      {result && (
        <OutputCard title="Homework Sheet" onExport={handleExport} exportLoading={exportLoading}>
          {result.header && (
            <div className="grid grid-cols-3 gap-3 mb-5 p-4 bg-blue-50 rounded-lg text-sm">
              {[
                ['Subject', result.header.subject],
                ['Class', result.header.class_level],
                ['Difficulty', result.header.difficulty],
                ['Chapter', result.header.chapter],
                ['Topic', result.header.topic],
                ['Total Marks', result.header.total_marks],
              ].map(([k, v]) => (
                <div key={k}>
                  <span className="text-xs text-gray-500 uppercase">{k}</span>
                  <div className="font-medium text-gray-800 capitalize">{v}</div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="mb-4 text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {showAnswers ? '🙈 Hide Answers' : '👁 Show Model Answers'}
          </button>

          <div className="space-y-5">
            {result.short_answers?.length > 0 && (
              <section>
                <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-3">
                  Section A: Short Answer (2 marks each)
                </h4>
                <div className="space-y-4">
                  {result.short_answers.map((q, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-800">
                        Q{i + 1}. {q.question}
                        <span className="ml-2 text-xs text-gray-500">[{q.marks} marks]</span>
                      </p>
                      {showAnswers && (
                        <p className="text-xs text-green-700 mt-2 leading-relaxed">Ans: {q.answer}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {result.long_answers?.length > 0 && (
              <section>
                <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-3">
                  Section B: Long Answer (4 marks each)
                </h4>
                <div className="space-y-4">
                  {result.long_answers.map((q, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-800">
                        Q{i + 1}. {q.question}
                        <span className="ml-2 text-xs text-gray-500">[{q.marks} marks]</span>
                      </p>
                      {showAnswers && (
                        <p className="text-xs text-green-700 mt-2 leading-relaxed">Ans: {q.answer}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </OutputCard>
      )}
    </div>
  )
}

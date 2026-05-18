import { useState } from 'react'
import TopicSelector from '../components/TopicSelector'
import OutputCard from '../components/OutputCard'
import { classworkAPI, exportAPI } from '../api/client'

const INIT = { subject: '', class_level: '', chapter: '', topic: '' }

export default function ClassworkGen() {
  const [form, setForm] = useState(INIT)
  const [numMcq, setNumMcq] = useState(5)
  const [numOneliners, setNumOneliners] = useState(5)
  const [numShort, setNumShort] = useState(3)
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
      const res = await classworkAPI.generate({
        ...form,
        num_mcq: numMcq,
        num_oneliners: numOneliners,
        num_short: numShort,
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
      const title = `Classwork – ${form.topic} (${form.class_level})`
      const res = await exportAPI.pdf({ content_type: 'classwork', title, content: result })
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
        <h1 className="text-2xl font-bold text-gray-900">Classwork Generator</h1>
        <p className="text-gray-500 text-sm mt-1">Generate MCQs, one-liners, and short Q&A for in-class assessment</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <TopicSelector values={form} onChange={setForm} />

        <div className="grid grid-cols-3 gap-4">
          {[
            ['MCQs', numMcq, setNumMcq],
            ['One-liners', numOneliners, setNumOneliners],
            ['Short Q&A', numShort, setNumShort],
          ].map(([label, val, setter]) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. of {label}</label>
              <input
                type="number"
                min={1}
                max={10}
                value={val}
                onChange={(e) => setter(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={generate}
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? '⏳ Generating…' : '✨ Generate Classwork'}
        </button>
      </div>

      {result && (
        <OutputCard title="Classwork Questions" onExport={handleExport} exportLoading={exportLoading}>
          <div className="space-y-1 mb-4">
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {showAnswers ? '🙈 Hide Answers' : '👁 Show Answers'}
            </button>
          </div>

          <div className="space-y-6">
            {result.mcqs?.length > 0 && (
              <section>
                <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-3">
                  Section A: Multiple Choice Questions
                </h4>
                <div className="space-y-4">
                  {result.mcqs.map((mcq, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                      <p className="text-sm font-medium text-gray-800 mb-2">Q{i + 1}. {mcq.question}</p>
                      <div className="grid grid-cols-2 gap-1">
                        {mcq.options?.map((opt, j) => (
                          <span key={j} className="text-xs text-gray-600">{opt}</span>
                        ))}
                      </div>
                      {showAnswers && (
                        <p className="mt-2 text-xs text-green-700 font-medium">✓ {mcq.answer}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {result.oneliners?.length > 0 && (
              <section>
                <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-3">
                  Section B: One-line Answers
                </h4>
                <div className="space-y-3">
                  {result.oneliners.map((q, i) => (
                    <div key={i} className="border-l-4 border-blue-200 pl-3">
                      <p className="text-sm text-gray-800">Q{i + 1}. {q.question}</p>
                      {showAnswers && (
                        <p className="text-xs text-green-700 mt-1">Ans: {q.answer}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {result.short_qa?.length > 0 && (
              <section>
                <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-3">
                  Section C: Short Answer Questions
                </h4>
                <div className="space-y-4">
                  {result.short_qa.map((q, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-800">Q{i + 1}. {q.question}</p>
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

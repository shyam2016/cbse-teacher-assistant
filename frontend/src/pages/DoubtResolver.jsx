import { useState } from 'react'
import TopicSelector from '../components/TopicSelector'
import OutputCard from '../components/OutputCard'
import { doubtAPI } from '../api/client'

const INIT = { subject: '', class_level: '', chapter: '', topic: '' }

export default function DoubtResolver() {
  const [form, setForm] = useState(INIT)
  const [question, setQuestion] = useState('')
  const [language, setLanguage] = useState('en')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resolve = async () => {
    if (!form.subject || !form.class_level || !form.topic || !question.trim()) {
      setError('Please fill in Subject, Class, Topic and enter a question.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await doubtAPI.resolve({ ...form, question, language })
      setResult(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not resolve doubt. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doubt Resolver</h1>
        <p className="text-gray-500 text-sm mt-1">Get instant AI-powered explanations for student doubts</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <TopicSelector values={form} onChange={setForm} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Student's Doubt / Question *</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder="e.g. Why do we fall forward when a bus suddenly stops?"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <div className="flex rounded-lg overflow-hidden border border-gray-300 w-fit">
            {[['en', '🇬🇧 English'], ['en+hi', '🇮🇳 English + हिंदी']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setLanguage(val)}
                className={`px-4 py-2 text-sm transition-colors ${
                  language === val ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={resolve}
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? '⏳ Resolving…' : '💡 Resolve Doubt'}
        </button>
      </div>

      {result && (
        <OutputCard title="Explanation">
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-2">Explanation</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{result.explanation}</p>
            </div>

            {result.explanation_hindi && (
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-orange-800 mb-2">हिंदी में समझाइए</h4>
                <p className="text-gray-800 text-sm leading-relaxed">{result.explanation_hindi}</p>
              </div>
            )}

            {result.steps?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-2">Step-by-Step</h4>
                <ol className="space-y-2">
                  {result.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-800 mb-1">Example</h4>
              <p className="text-gray-700 text-sm">{result.example}</p>
            </div>
          </div>
        </OutputCard>
      )}
    </div>
  )
}

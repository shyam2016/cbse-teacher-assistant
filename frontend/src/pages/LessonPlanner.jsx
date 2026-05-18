import { useState } from 'react'
import TopicSelector from '../components/TopicSelector'
import OutputCard from '../components/OutputCard'
import { lessonAPI, exportAPI } from '../api/client'

const INIT = { subject: '', class_level: '', chapter: '', topic: '' }

export default function LessonPlanner() {
  const [form, setForm] = useState(INIT)
  const [numSlides, setNumSlides] = useState(8)
  const [mode, setMode] = useState('plan')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [error, setError] = useState('')
  const [slideIndex, setSlideIndex] = useState(0)

  const validate = () => {
    if (!form.subject || !form.class_level || !form.topic) {
      setError('Please fill in Subject, Class and Topic.')
      return false
    }
    setError('')
    return true
  }

  const generate = async () => {
    if (!validate()) return
    setLoading(true)
    setResult(null)
    try {
      const fn = mode === 'plan' ? lessonAPI.generatePlan : lessonAPI.generateSlides
      const payload = mode === 'slides' ? { ...form, num_slides: numSlides } : form
      const res = await fn(payload)
      setResult(res.data)
      setSlideIndex(0)
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
      const title = `${form.topic} – ${form.class_level} ${form.subject}`
      const res = await exportAPI.pdf({
        content_type: mode === 'slides' ? 'slides' : 'lesson',
        title,
        content: result,
      })
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
        <h1 className="text-2xl font-bold text-gray-900">Lesson Planner</h1>
        <p className="text-gray-500 text-sm mt-1">Generate NCERT-aligned lesson plans and presentation slides</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <TopicSelector values={form} onChange={setForm} />

        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-300">
              {['plan', 'slides'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 text-sm capitalize transition-colors ${
                    mode === m ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {m === 'plan' ? '📋 Lesson Plan' : '📊 Slides'}
                </button>
              ))}
            </div>
          </div>

          {mode === 'slides' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. of Slides</label>
              <input
                type="number"
                min={4}
                max={15}
                value={numSlides}
                onChange={(e) => setNumSlides(Number(e.target.value))}
                className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={generate}
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? '⏳ Generating…' : '✨ Generate'}
        </button>
      </div>

      {result && mode === 'plan' && (
        <OutputCard title="Lesson Plan" onExport={handleExport} exportLoading={exportLoading}>
          <div className="space-y-5">
            <Section title="Overview">
              <p className="text-gray-700 text-sm leading-relaxed">{result.overview}</p>
            </Section>
            <Section title="Learning Outcomes">
              <ul className="space-y-1">
                {result.learning_outcomes?.map((o, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-green-600 mt-0.5">✓</span>{o}
                  </li>
                ))}
              </ul>
            </Section>
            {result.definitions?.length > 0 && (
              <Section title="Key Definitions">
                <div className="space-y-2">
                  {result.definitions.map((d, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-semibold text-blue-800">{d.term}: </span>
                      <span className="text-gray-700">{d.definition}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
            {result.formulae?.length > 0 && (
              <Section title="Important Formulae">
                <ul className="space-y-1">
                  {result.formulae.map((f, i) => (
                    <li key={i} className="text-sm text-gray-700 font-mono bg-blue-50 px-3 py-1 rounded">▸ {f}</li>
                  ))}
                </ul>
              </Section>
            )}
            <Section title="Summary Points">
              <ul className="space-y-1">
                {result.summary_points?.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-blue-600">•</span>{p}
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </OutputCard>
      )}

      {result && mode === 'slides' && result.slides && (
        <OutputCard title="Slides" onExport={handleExport} exportLoading={exportLoading}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {result.slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    slideIndex === i
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {(() => {
              const slide = result.slides[slideIndex]
              return slide ? (
                <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl p-6 text-white min-h-48">
                  <div className="text-xs text-blue-300 mb-2">Slide {slide.slide_number}</div>
                  <h2 className="text-xl font-bold mb-4">{slide.title}</h2>
                  <ul className="space-y-2 mb-4">
                    {slide.bullets?.map((b, i) => (
                      <li key={i} className="flex gap-2 text-sm text-blue-100">
                        <span>•</span>{b}
                      </li>
                    ))}
                  </ul>
                  {slide.key_terms?.length > 0 && (
                    <div className="text-xs text-blue-300">
                      <span className="font-semibold">Key Terms: </span>
                      {slide.key_terms.join(', ')}
                    </div>
                  )}
                  {slide.example && (
                    <div className="mt-3 bg-white/10 rounded-lg px-3 py-2 text-xs text-blue-200 italic">
                      Example: {slide.example}
                    </div>
                  )}
                </div>
              ) : null
            })()}

            <div className="flex justify-between">
              <button
                onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))}
                disabled={slideIndex === 0}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                ← Prev
              </button>
              <button
                onClick={() => setSlideIndex(Math.min(result.slides.length - 1, slideIndex + 1))}
                disabled={slideIndex === result.slides.length - 1}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          </div>
        </OutputCard>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-2">{title}</h4>
      {children}
    </div>
  )
}

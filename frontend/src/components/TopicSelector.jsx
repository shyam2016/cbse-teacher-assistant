const SUBJECTS = [
  'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'Social Science', 'History', 'Geography', 'Civics', 'Economics',
  'English', 'Hindi', 'Sanskrit', 'Computer Science', 'EVS',
]

const CLASSES = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)

export default function TopicSelector({ values, onChange }) {
  const { subject = '', class_level = '', chapter = '', topic = '' } = values

  const handle = (field) => (e) => onChange({ ...values, [field]: e.target.value })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
        <select
          value={subject}
          onChange={handle('subject')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          required
        >
          <option value="">Select subject…</option>
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
        <select
          value={class_level}
          onChange={handle('class_level')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          required
        >
          <option value="">Select class…</option>
          {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
        <input
          type="text"
          value={chapter}
          onChange={handle('chapter')}
          placeholder="e.g. Chapter 11: Force and Pressure"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
        <input
          type="text"
          value={topic}
          onChange={handle('topic')}
          placeholder="e.g. Force and Pressure"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    </div>
  )
}

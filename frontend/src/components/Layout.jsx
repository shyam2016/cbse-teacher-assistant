import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Lesson Planner', icon: '📋' },
  { to: '/doubt', label: 'Doubt Resolver', icon: '💬' },
  { to: '/classwork', label: 'Classwork', icon: '✏️' },
  { to: '/homework', label: 'Homework', icon: '📝' },
  { to: '/mindmap', label: 'Mind Maps', icon: '🧠' },
]

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-blue-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <div>
              <div className="font-bold text-sm leading-tight">CBSE Teacher</div>
              <div className="font-bold text-sm leading-tight">Assistant</div>
            </div>
          </div>
          <div className="text-blue-300 text-xs mt-1">NCERT Aligned • AI Powered</div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-blue-900'
                    : 'text-blue-100 hover:bg-blue-800'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-700 text-xs text-blue-400">
          Powered by Claude AI
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LessonPlanner from './pages/LessonPlanner'
import DoubtResolver from './pages/DoubtResolver'
import ClassworkGen from './pages/ClassworkGen'
import HomeworkGen from './pages/HomeworkGen'
import MindMapGen from './pages/MindMapGen'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LessonPlanner />} />
          <Route path="/doubt" element={<DoubtResolver />} />
          <Route path="/classwork" element={<ClassworkGen />} />
          <Route path="/homework" element={<HomeworkGen />} />
          <Route path="/mindmap" element={<MindMapGen />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App

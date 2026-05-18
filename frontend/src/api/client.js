import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000, // 2 min — AI generation can take time
})

export const lessonAPI = {
  generatePlan: (data) => api.post('/lesson/plan', data),
  generateSlides: (data) => api.post('/lesson/slides', data),
}

export const doubtAPI = {
  resolve: (data) => api.post('/doubt/resolve', data),
}

export const classworkAPI = {
  generate: (data) => api.post('/classwork/generate', data),
}

export const homeworkAPI = {
  generate: (data) => api.post('/homework/generate', data),
}

export const mindmapAPI = {
  generate: (data) => api.post('/mindmap/generate', data),
}

export const exportAPI = {
  pdf: (data) => api.post('/export/pdf', data, { responseType: 'blob' }),
}

export default api

// In production VITE_API_URL points at the deployed backend (Render), so API
// calls must leave the Vercel origin. When it is not set, /api is served by the
// same origin (Vite dev proxy or a backend behind the frontend).
const apiBase = () => (globalThis.__API_BASE__ || '').replace(/\/$/, '')

async function request(path, { method = 'GET', body, form } = {}) {
  const opts = {
    method,
    credentials: 'include',
    headers: {},
  }
  if (form) {
    opts.body = form
  } else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  let res
  try {
    res = await fetch(`${apiBase()}/api${path}`, opts)
  } catch {
    const err = new Error('Cannot reach the server. Is the backend running on http://localhost:5050?')
    err.offline = true
    throw err
  }
  let data = null
  try { data = await res.json() } catch { /* empty body */ }
  if (!res.ok) {
    const err = new Error(data?.error?.message || `Request failed (${res.status})`)
    err.status = res.status
    err.data = data
    err.offline = res.status === 502 || res.status === 503 || res.status === 504
    throw err
  }
  return data
}

export const api = {
  get: (path) => request(path),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  post: (path, body) => request(path, { method: 'POST', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  upload: (path, file) => {
    const form = new FormData()
    form.append('photo', file)
    return request(path, { method: 'POST', form })
  },
}

export const authApi = {
  me: () => api.get('/auth/me'),
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (name, email, password) => api.post('/auth/signup', { name, email, password }),
  logout: () => api.post('/auth/logout'),
  update: (patch) => api.patch('/auth/me', patch),
  forgot: (email) => api.post('/auth/forgot', { email }),
  reset: (token, password) => api.post('/auth/reset', { token, password }),
  googleStart: () => api.get('/auth/google/start'),
}

export { authApi as auth }
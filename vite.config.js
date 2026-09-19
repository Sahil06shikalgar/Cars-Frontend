import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5050',
      '/uploads': 'http://localhost:5050',
      '/socket.io': { target: 'http://localhost:5050', ws: true },
    },
  },
  preview: {
    proxy: {
      '/api': 'http://localhost:5050',
      '/uploads': 'http://localhost:5050',
      '/socket.io': { target: 'http://localhost:5050', ws: true },
    },
  },
})
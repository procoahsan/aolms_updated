import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), legacy({ targets: ['Chrome >= 64', 'Safari >= 12', 'Firefox >= 67'], modernPolyfills: true })],
  build: { cssTarget: ['chrome64', 'safari12'] },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})

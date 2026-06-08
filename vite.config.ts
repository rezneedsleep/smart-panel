import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/state':      'http://127.0.0.1:5000',
      '/video_feed': 'http://127.0.0.1:5000',
    }
  }
})

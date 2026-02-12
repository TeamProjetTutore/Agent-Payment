// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/login': {
        target: 'http://localhost:5000',  // Changé de 8000 → 5000
        changeOrigin: true,
        secure: false,
      },
      '/agents': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/payments': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/reports': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
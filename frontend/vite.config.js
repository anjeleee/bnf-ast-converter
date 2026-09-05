import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/parse': 'https://bnf-ast-converter.onrender.com/health',
      '/health': 'https://bnf-ast-converter.onrender.com/health'
    }
  }
})

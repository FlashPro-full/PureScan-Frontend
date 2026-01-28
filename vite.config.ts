import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  return {
    root: __dirname,
    base: '/',
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      port: 3001,
      allowedHosts: true,
      proxy: {
        '/api': env.VITE_API_BASE_URL || 'http://localhost:5001',
      },
    },
    build: {
      outDir: './dist',
      emptyOutDir: true,
    },
  }
})

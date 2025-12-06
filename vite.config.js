import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      // Replace %VITE_*% in HTML
      {
        name: 'html-env-replace',
        transformIndexHtml(html) {
          return html.replace(/%VITE_APP_URL%/g, env.VITE_APP_URL || '')
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
    },
  }
})

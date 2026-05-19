import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    // Raise warning threshold — we're code-splitting so individual chunks are fine
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // rolldown (Vite 8) requires manualChunks as a function
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/'))       return 'react-core'
            if (id.includes('react-router'))                              return 'react-router'
            if (id.includes('framer-motion'))                            return 'framer'
            if (id.includes('recharts') || id.includes('d3-'))           return 'charts'
            if (id.includes('jspdf') || id.includes('html2canvas'))      return 'pdf'
            if (id.includes('@supabase'))                                 return 'supabase'
            if (id.includes('openai'))                                    return 'openai'
          }
        },
      },
    },
  },

  // Faster dev server
  server: {
    warmup: {
      clientFiles: ['./src/App.jsx', './src/hooks/useAuth.jsx'],
    },
  },
})

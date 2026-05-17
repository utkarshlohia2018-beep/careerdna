import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Use import.meta.url instead of __dirname for ESM compatibility
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

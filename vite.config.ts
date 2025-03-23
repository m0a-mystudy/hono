import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'src/client',
  build: {
    outDir: 'dist/client',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8787'
    }
  }
}) 
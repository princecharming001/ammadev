import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Custom domain (amma.today) - use root path
  publicDir: 'public', // Ensure public directory is copied
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    sourcemap: false,
    assetsDir: 'assets',
    copyPublicDir: true // Explicitly copy public files
  }
})

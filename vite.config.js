import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Custom domain (amma.today) - use root path
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    sourcemap: false,
    assetsDir: 'assets'
  }
})

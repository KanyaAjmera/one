import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "pptxgenjs": path.resolve(__dirname, "./node_modules/pptxgenjs/dist/pptxgen.cjs.js"),
    },
  },
  optimizeDeps: {
    include: ['pptxgenjs'],
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_NODE_API_URL || 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
    },
  },
})

import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Development server proxy is removed - use environment variables for production
  // Frontend now uses VITE_NODE_API_URL and VITE_PYTHON_API_URL for all API calls
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Vite config file to set up proxy for API requests to the backend server
export default defineConfig({
  plugins: [react()],
  server:{
    port: 5173,
    proxy:{
      '/api': 'http://localhost:5050, changeOrigin: true'
    }
  }
})

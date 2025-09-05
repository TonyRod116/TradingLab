import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // Cambiar de 'dist' a 'build' para Netlify
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor libraries
          vendor: ['react', 'react-dom'],
          // Separar router
          router: ['react-router-dom'],
          // Separar charts
          charts: ['recharts'],
          // Separar QuantConnect
          quantconnect: ['axios']
        }
      }
    },
    // Aumentar el límite de warning para chunks
    chunkSizeWarningLimit: 1000,
    // Optimizar el bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})

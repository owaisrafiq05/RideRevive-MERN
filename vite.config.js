import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,
    strictPort: true,
  },
  resolve: {
    alias: {
      'mapbox-gl': 'mapbox-gl'
    }
  },
  optimizeDeps: {
    include: ['mapbox-gl']
  }
})

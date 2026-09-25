import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expone el servidor a 0.0.0.0 para acceso desde Docker y la máquina host
    port: 5173,
    watch: {
      usePolling: true, // Asegura Hot Reload en sistemas de archivos compartidos (WSL / Docker)
    },
  },
})

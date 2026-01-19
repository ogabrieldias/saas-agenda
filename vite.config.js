import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // garante que o dev server redirecione rotas para index.html
    historyApiFallback: true,
  },
  build: {
    outDir: 'dist',
  }
})

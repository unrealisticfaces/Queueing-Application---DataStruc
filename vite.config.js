import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  server: {
    host: true, // <-- Add this to expose Vite to your local network
  },
  plugins: [
    tailwindcss(),
    react(),
  ],
})
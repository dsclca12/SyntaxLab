import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/SyntaxLab/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          codemirror: ['@uiw/react-codemirror', '@codemirror/theme-one-dark', '@codemirror/lang-python', '@codemirror/language', '@codemirror/legacy-modes/mode/toml'],
        },
      },
    },
  },
})

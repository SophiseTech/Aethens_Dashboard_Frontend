import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@pages": "/src/pages",
      "@utils": "/src/utils",
      "@components": "/src/components",
      "@stores": "/src/stores",
      "@hooks": "/src/hooks",
      '@': '/src'
    }
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwind from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwind()],
  base: '/content-tree-experimental/',
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'vue-i18n'],
          'tiptap': ['@tiptap/vue-3', '@tiptap/starter-kit'],
          'ui': ['@headlessui/vue', 'lucide-vue-next'],
        },
      },
    },
  },
})

import { fileURLToPath, URL } from 'node:url'

import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'bootstrap-vue-next'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: {}
  },
  plugins: [
    vue(),
    Components({
      dts: 'src/components.d.ts',
      dirs: ['src/components'],
      resolvers: [BootstrapVueNextResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@node_modules': path.resolve(__dirname, 'node_modules/')
    }
  }
})

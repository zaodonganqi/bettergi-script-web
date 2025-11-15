import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from "vite-plugin-singlefile"
import { inlineFavicon } from './vite-plugin-inline-favicon.js'
import { version } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteSingleFile(),
    inlineFavicon()
  ],
  define: {
    __APP_VERSION__: JSON.stringify(version)
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: './', // 添加这一行
})

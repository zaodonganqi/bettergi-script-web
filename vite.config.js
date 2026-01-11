import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { inlineFavicon } from './build/inlineFavicon.js'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { markdownInlineImages } from './build/markdownInlineImages.js'
import { generateThemeVars } from './scripts/generateThemeVars.js'
import { version } from './package.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    generateThemeVars(),
    markdownInlineImages(),
    vue(),
    viteSingleFile(),
    inlineFavicon()
  ],
  base: '/bettergi-script-web/',
  define: {
    __APP_VERSION__: JSON.stringify(version)
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
})
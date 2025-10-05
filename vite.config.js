import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { inlineFavicon } from './vite-plugin-inline-favicon.js'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        viteSingleFile(),
        inlineFavicon()
    ],
    base: process.env.NODE_ENV === 'production' ? '/bettergi-script-web-new/' : '/bettergi-script-web-new/',
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
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
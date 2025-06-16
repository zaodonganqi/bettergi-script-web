import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueDevTools(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src',
                import.meta.url))
        },
    },
    css: {
        preprocessorOptions: {
            less: {
                modifyVars: {
                    'text-color': 'rgba(219, 61, 61, 0.75)',
                }
            }
        }
    }
})
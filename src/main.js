import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

import { i18n } from '@/utils/i18n.js'

const app = createApp(App)
const pinia = createPinia()
app.use(Antd)
app.use(i18n)
app.use(pinia)
app.mount('#app')

// 清除 localStorage 和 sessionStorage
window.addEventListener('beforeunload', () => {
    // 只清除404相关的缓存
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('readme404:')) {
            localStorage.removeItem(key);
        }
    });
    sessionStorage.clear();
});
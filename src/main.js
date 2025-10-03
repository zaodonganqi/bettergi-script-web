import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import zhTW from './locales/zh-TW'
import enUS from './locales/en-US'
import jaJP from './locales/ja-JP'
import frFR from './locales/fr-FR'

// 从localStorage读取用户的语言偏好
const savedLocale = localStorage.getItem('user-locale') || 'zh-CN';

const i18n = createI18n({
    legacy: false,
    locale: savedLocale,
    fallbackLocale: 'zh-CN',
    messages: {
        'zh': zhCN,
        'zh-CN': zhCN,
        'zh-TW': zhTW,
        'en-US': enUS,
        'ja-JP': jaJP,
        'fr-FR': frFR
    }
})

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
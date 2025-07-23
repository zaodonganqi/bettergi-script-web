import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

// 清除 localStorage 和 sessionStorage
window.addEventListener('beforeunload', () => {
    localStorage.clear();
    sessionStorage.clear();
});

const app = createApp(App)
app.use(Antd)
app.mount('#app')
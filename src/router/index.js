import { createRouter, createWebHistory } from 'vue-router'
import LayoutMain from '@/components/LayoutMain.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: LayoutMain },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router

// type 名称 与 menu key 映射
export const TYPE_KEY_MAP = { pathing: '1', js: '2', combat: '3', tcg: '4' }
export const KEY_TYPE_MAP = { '1': 'pathing', '2': 'js', '3': 'combat', '4': 'tcg' }

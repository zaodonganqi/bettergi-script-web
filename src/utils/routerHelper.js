import { nextTick, watch } from 'vue'
import { TYPE_KEY_MAP, KEY_TYPE_MAP } from '@/router/index.js'


/**
 * 创建平铺列表的 navigateTo 方法
 * @param {string} prefix    - 路径前缀 (js / combat / tcg)
 * @param {Function} getItems - 返回当前列表数据的函数
 * @param {Function} onSelect - 选中回调 (id) => Promise 的函数
 */
export function createListNavigator(prefix, getItems, onSelect) {
  // 跳过入场动画的标志
  let skipAnimation = false

  return {
    navigateTo: async (path) => {
      const fullPath = `${prefix}/${path}`
      const item = getItems().find(s => s.path === fullPath)
      if (!item) return false

      skipAnimation = true
      await onSelect(item.id)

      await nextTick()
      const el = document.querySelector('.script-item.active')
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })

      // 滚动完成后恢复动画
      setTimeout(() => { skipAnimation = false }, 100)
      return true
    },
    shouldSkipAnimation: () => skipAnimation,
  }
}


/**
 * 查找目标节点的所有祖先 key
 * @returns {string[] | null}
 */
export function findAncestorKeys(nodes, targetKey, ancestors = []) {
  for (const node of nodes) {
    if (node.key === targetKey) return [...ancestors]
    if (node.children?.length) {
      const result = findAncestorKeys(node.children, targetKey, [...ancestors, node.key])
      if (result) return result
    }
  }
  return null
}


/** 构建 query 对象 */
export function buildUrlQuery(type, path) {
  return path ? { type, path } : { type }
}

/** 去掉路径前缀 (js/xxx -> xxx) */
export function stripPathPrefix(fullPath) {
  return fullPath.replace(/^[^/]+\//, '')
}


/**
 * URL 双向同步 composable
 * - 从 URL 恢复状态 (restoreFromUrl)
 * - 状态变化时自动更新 URL (内部 watch)
 *
 * @param {Object} opts
 * @param {Object} opts.mainStore
 * @param {Object} opts.route
 * @param {Object} opts.router
 * @param {Function} opts.getRefs - 能够返回 { pathing, js, combat, tcg } 四个组件 ref 的函数
 */
export function useUrlSync({ mainStore, route, router, getRefs }) {
  // 从 URL 参数恢复 UI 状态
  async function restoreFromUrl() {
    if (mainStore.isModeSingle) return

    const type = route.query.type
    const path = route.query.path
    if (!type || !TYPE_KEY_MAP[type]) return

    mainStore.search = ''
    mainStore.selectedMenu = [TYPE_KEY_MAP[type]]
    if (!path) return

    // 等待 v-if 切换后子组件挂载
    await nextTick()
    await nextTick()

    const ok = await getRefs()[type]?.value?.navigateTo(path)
    if (!ok) {
      mainStore.selectedScript.value = null
      router.replace({ query: buildUrlQuery(type) })
    }
  }

  // 菜单切换 -> 更新 URL（引导期间跳过）
  watch(() => mainStore.selectedMenu[0], () => {
    if (mainStore.isModeSingle || mainStore.showGuide) return
    const type = KEY_TYPE_MAP[mainStore.selectedMenu[0]]
    router.replace({ query: type ? buildUrlQuery(type) : {} })
  })

  // 选中项变化 -> 更新 URL（引导期间跳过）
  watch(() => mainStore.selectedScript?.path, (val) => {
    if (mainStore.isModeSingle || mainStore.showGuide) return
    const type = KEY_TYPE_MAP[mainStore.selectedMenu[0]]
    if (!type || !val) return
    router.replace({ query: buildUrlQuery(type, stripPathPrefix(val)) })
  })

  return { restoreFromUrl }
}

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useMainStore } from './mainStore.js'

export const useListStore = defineStore('listStore', () => {
    const mainStore = useMainStore()
    
    // 当前选中的项目ID
    const selectedId = ref(null)
    
    // 选择脚本/策略的通用方法
    const selectItem = (itemId, itemData) => {
        selectedId.value = itemId
        mainStore.handleScriptSelect(itemData)
    }
    
    // 更新脚本hasUpdate状态的通用方法
    const updateItemHasUpdate = (itemPath, hasUpdate) => {
        mainStore.updateScriptHasUpdate(itemPath, hasUpdate)
    }
    
    // 检查是否已订阅的通用方法
    const isItemSubscribed = (itemPath) => {
        return mainStore.subscribedScriptPaths.includes(itemPath)
    }
    
    // 过滤已订阅项目的通用方法
    const filterSubscribedItems = (items, showSubscribedOnly) => {
        if (!showSubscribedOnly) return items
        return items.filter(item => isItemSubscribed(item.path))
    }
    
    // 标准化字符串的通用方法
    const normalize = (str) => {
        return (str || '').toLowerCase().replace(/[\s【】\[\]（）()·,，.。!！?？\-_]/g, '')
    }
    
    // 搜索过滤的通用方法（支持完全匹配和相关性评分）
    const filterBySearchKey = (items, searchKey) => {
        if (!searchKey) return items
        
        const keyword = normalize(String(searchKey).trim())
        
        // 相关性分数排序
        const scored = items.map(item => {
            let score = 0
            const name = normalize(item.name || '')
            const name1 = normalize(item.name1 || '')
            const name2 = normalize(item.name2 || '')
            const desc = normalize(item.desc || '')
            const authors = (item.authors || []).map(a => normalize(a.name))
            const tags = (item.tags || []).map(tag => normalize(tag))

            if (name.includes(keyword)) score += 8
            if (name1.includes(keyword)) score += 8
            if (name2.includes(keyword)) score += 8
            if (authors.some(author => author.includes(keyword))) score += 4
            if (tags.some(tag => tag.includes(keyword))) score += 3
            if (desc.includes(keyword)) score += 2
            
            return { ...item, _score: score }
        }).filter(item => item._score > 0)
        
        scored.sort((a, b) => b._score - a._score)
        return scored
    }
    
    // 排序的通用方法
    const sortItems = (items, sortType, sortOrder) => {
        if (!items || items.length === 0) return items
        
        return [...items].sort((a, b) => {
            let comparison = 0
            
            switch (sortType) {
                case 'time':
                    const timeA = new Date(a.lastUpdated || 0)
                    const timeB = new Date(b.lastUpdated || 0)
                    comparison = timeA - timeB
                    break
                case 'name':
                    const nameA = (a.title || a.name1 || a.name || '').toLowerCase()
                    const nameB = (b.title || b.name1 || b.name || '').toLowerCase()
                    comparison = nameA.localeCompare(nameB)
                    break
                case 'random':
                    comparison = Math.random() - 0.5
                    break
                default:
                    comparison = 0
            }
            
            return sortOrder === 'desc' ? -comparison : comparison
        })
    }
    
    // 角色筛选的通用方法（用于战斗策略）
    const filterByRoleTags = (items, roleTags) => {
        if (!roleTags || roleTags.length === 0) return items
        
        return items.filter(item => {
            const itemTags = item.tags || []
            return roleTags.some(tag => itemTags.includes(tag))
        })
    }
    
    // 组合所有过滤和排序的通用方法
    const processItems = (items, options = {}) => {
        const {
            searchKey = '',
            showSubscribedOnly = false,
            sortType = 'time',
            sortOrder = 'desc',
            roleTags = []
        } = options
        
        let processedItems = [...items]
        
        // 应用搜索过滤
        const hasSearchKey = searchKey && String(searchKey).trim()
        if (hasSearchKey) {
            // 有搜索关键词时，按相关性排序
            processedItems = filterBySearchKey(processedItems, searchKey)
        }
        
        // 应用订阅过滤
        processedItems = filterSubscribedItems(processedItems, showSubscribedOnly)
        
        // 应用角色筛选（如果有）
        if (roleTags.length > 0) {
            processedItems = filterByRoleTags(processedItems, roleTags)
        }
        
        // 应用排序
        if (sortType === 'relevance' && hasSearchKey) {

        } else {
            // 其他排序类型：应用用户选择的排序
            processedItems = sortItems(processedItems, sortType, sortOrder)
        }
        
        return processedItems
    }
    
    return {
        selectedId,
        selectItem,
        updateItemHasUpdate,
        isItemSubscribed,
        filterSubscribedItems,
        filterBySearchKey,
        sortItems,
        filterByRoleTags,
        processItems,
        normalize
    }
})

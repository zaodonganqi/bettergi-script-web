<template>
  <div class="list-container">
    <a-list 
      :data-source="filteredStrategies"
      :grid="mainStore.isListTwoColumn ? { gutter: 10, column: 2 } : undefined"
    >
      <template #renderItem="{ item }">
        <div :class="['script-item', { active: item.id === listStore.selectedId }]" @click="selectStrategy(item.id)">
          <div class="item-header">
            <div class="item-title-wrap">
              <span class="item-title-main">{{ item.title }}</span>
              <span v-if="item.hasUpdate" class="has-update-badge">{{ $t('combatStrategyList.hasUpdate') }}</span>
              <span v-if="item.isSubscribed" class="subscribed-badge">{{ $t('combatStrategyList.subscribed') }}</span>
            </div>
            <span v-if="item.unread" class="item-dot"></span>
          </div>
          <div class="item-author">
            <template v-if="item.authors && item.authors.length">
              {{item.authors.map(a => a.name).join($t('common.comma'))}}
            </template>
            <template v-else>
              {{ $t('combatStrategyList.noAuthor') }}
            </template>
          </div>
          <div class="item-desc">{{ item.desc }}</div>
          <div class="item-tags">
            <a-tag v-for="tag in item.tags" :key="tag" class="item-tag">{{ tag }}</a-tag>
          </div>
          <div class="item-time">{{ item.lastUpdated }}</div>
        </div>
      </template>
    </a-list>
  </div>
</template>

<script setup>
import {computed} from 'vue';
import {useI18n} from 'vue-i18n';
import {useMainStore} from "@/stores/mainStore.js";
import {useListStore} from "@/stores/listStore.js";

const { t: $t } = useI18n();

const mainStore = useMainStore();
const listStore = useListStore();

function getCombatStrategiesFromRepo(repo, subscribedPaths = [], parentSubscribed = false, currentPath = 'combat') {
  const combatNode = repo.indexes.find(item => item.name === 'combat');
  if (!combatNode || !combatNode.children) return [];
  const result = [];
  function traverse(nodes, parentSubscribed, currentPath) {
    for (let child of nodes) {
      const selfSubscribed = subscribedPaths.some(sub => `${currentPath}/${child.name}` === sub || `${currentPath}/${child.name}`.startsWith(sub + '/'));
      const isSubscribed = parentSubscribed || selfSubscribed;
      if (child.children && child.children.length > 0) {
        const childPath = `${currentPath}/${child.name}`;
        traverse(child.children, isSubscribed, childPath);
      } else {
        if (child.type === 'directory') {
          if (child.description && child.description.includes('~|~')) {
            const [nameSuffix, newDescription] = child.description.split('~|~');
            child = {
              ...child,
              name: `${child.name} - ${nameSuffix.trim()}`,
              description: newDescription.trim(),
            };
          }
        }
        child.fullPath = `${currentPath}/${child.name}`;
        child.authors = Array.isArray(child.authors) ? child.authors : [];
        result.push({
          ...child,
          isSubscribed: isSubscribed,
          hasUpdate: child.hasUpdate || false
        });
      }
    }
  }
  traverse(combatNode.children, parentSubscribed, currentPath);
  return result;
}

function removeFileSuffix(name) {
  return name.replace(/\.[^.]+$/, '');
}

const strategies = computed(() => {
  if (!mainStore.repoData || !mainStore.repoData.indexes) return [];
  return getCombatStrategiesFromRepo(mainStore.repoData, mainStore.subscribedScriptPaths).map((item, idx) => ({
    id: idx + 1,
    title: removeFileSuffix(item.name),
    name: item.name,
    authors: item.authors || [],
    desc: item.description,
    tags: item.tags || [],
    lastUpdated: item.lastUpdated || '',
    unread: false,
    version: item.version,
    path: item.fullPath || `combat/${item.name}`,
    isSubscribed: item.isSubscribed,
    hasUpdate: item.hasUpdate || false
  }));
});

const selectStrategy = async (id) => {
  const strategy = strategies.value.find(strategy => strategy.id === id);
  listStore.selectItem(id, strategy);
  // 选择策略
  mainStore.handleScriptSelect(strategy);
  if (mainStore.isModeSingle && strategy.hasUpdate) {
    const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
    const result = await repoWebBridge.UpdateSubscribed(strategy.path);
    if (result) {
      // 更新hasUpdate状态
      listStore.updateItemHasUpdate(strategy.path, false);
    } else {
      console.error('Failed to update subscription:');
    }
  }
  console.log("Node selected", strategy);
};

const filteredStrategies = computed(() => {
  return listStore.processItems(strategies.value, {
    searchKey: mainStore.search,
    showSubscribedOnly: mainStore.scriptTab === 'subscribed',
    sortType: mainStore.sortType,
    sortOrder: mainStore.sortOrder,
    roleTags: mainStore.appliedRoleTags
  });
});
</script>

<style scoped>
.list-container {
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
}

.script-item {
  border-radius: 10px;
  margin: 10px 12px;
  padding: 16px 18px 12px 18px;
  background: var(--bg-container);
  box-shadow: 0 2px 8px 0 var(--color-shadow);
  border: 1.5px solid var(--border-base);
  cursor: pointer;
  transition: box-shadow 0.2s, border 0.2s;
  position: relative;
}

.script-item.active {
  border: 1px solid var(--color-primary);
  box-shadow: 0 4px 16px 0 var(--color-shadow);
  background: var(--bg-item-selected);
}

.script-item:hover {
  box-shadow: 0 4px 16px 0 var(--color-shadow);
  background: var(--bg-item-selected);
  border-color: var(--color-primary);
}

.item-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.item-title-wrap {
  display: flex;
  align-items: baseline;
  width: 100%;
  white-space: nowrap;
  margin-right: 8px;
  position: relative;
}

.item-title-main {
  flex: 1 1 0%;
  min-width: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.has-update-badge {
  display: inline-block;
  margin-left: 4px;
  transform: translateY(-2px);
  font-size: 10px;
  padding: 1px 3px;
  border-radius: 8px;
  color: var(--color-update);
  border: 1px solid var(--color-update);
  vertical-align: middle;
}

.subscribed-badge {
  display: inline-block;
  margin-left: 1px;
  transform: translateY(-2px) translateX(8px);
  font-size: 10px;
  padding: 1px 3px;
  border-radius: 8px;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  vertical-align: middle;
}

.item-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 8px;
  display: inline-block;
}

.item-author {
  font-size: 13px;
  margin-bottom: 4px;
  color: var(--text-base2);
}

.item-desc {
  font-size: 13px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-base2);
}

.item-tags {
  margin-bottom: 6px;
}

.item-tag {
  border-radius: 6px !important;
  font-size: 12px;
  background: var(--bg-item-selected);
  color: var(--color-primary);
  margin-right: 4px;
  padding: 0 8px;
  border: none !important;
}

.item-time {
  font-size: 12px;
  margin-top: 2px;
  color: var(--text-base3);
}
</style>
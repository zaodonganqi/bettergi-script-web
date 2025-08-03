<template>
  <div class="list-container">
    <a-list :data-source="filteredStrategies">
      <template #renderItem="{ item }">
        <div :class="['script-item', { active: item.id === selectedId }]" @click="selectStrategy(item.id)">
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
              {{ item.author || $t('combatStrategyList.noAuthor') }}
            </template>
          </div>
          <div class="item-desc">{{ item.desc }}</div>
          <div class="item-tags">
            <a-tag v-for="tag in item.tags" :key="tag" color="#e6f0ff" class="item-tag">{{ tag }}</a-tag>
          </div>
          <div class="item-time">{{ item.time }}</div>
        </div>
      </template>
    </a-list>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
const { t: $t } = useI18n();

const props = defineProps({
  searchKey: {
    type: String,
    default: ''
  },
  repoData: {
    type: Object,
    required: true,
    default: null
  },
  subscribedPaths: {
    type: Array,
    default: () => []
  },
  showSubscribedOnly: {
    type: Boolean,
    default: false
  },
  sortType: {
    type: String,
    default: 'recommend'
  },
  sortOrder: {
    type: String,
    default: 'desc'
  }
});
const { repoData } = props;

const emit = defineEmits(['select', 'updateHasUpdate']);

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
        let authors = [];
        if (Array.isArray(child.authors) && child.authors.length > 0) {
          authors = child.authors;
        } else if (child.author) {
          authors = [{ name: child.author }];
        }
        child.authors = authors;
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

function normalize(str) {
  return (str || '').toLowerCase().replace(/[\s【】\[\]（）()·,，.。!！?？\-_]/g, '');
}

const strategies = ref(
  getCombatStrategiesFromRepo(repoData, props.subscribedPaths).map((item, idx) => ({
    id: idx + 1,
    title: removeFileSuffix(item.name),
    name: item.name,
    author: item.author || $t('combatStrategyList.noAuthor'),
    authors: item.authors || [],
    desc: item.description,
    tags: item.tags || [],
    time: item.lastUpdated || '',
    unread: false,
    hash: item.hash,
    version: item.version,
    path: item.fullPath || `combat/${item.name}`,
    isSubscribed: item.isSubscribed,
    hasUpdate: item.hasUpdate || false
  }))
);

// 监听 repoData 和 subscribedPaths 变化，重新生成 strategies
watch(
  [() => props.repoData, () => props.subscribedPaths],
  ([newRepoData, newSubscribedPaths]) => {
    if (newRepoData && newRepoData.indexes) {
      nextTick(() => {
        strategies.value = getCombatStrategiesFromRepo(newRepoData, newSubscribedPaths).map((item, idx) => ({
          id: idx + 1,
          title: removeFileSuffix(item.name),
          name: item.name,
          author: item.author || $t('combatStrategyList.noAuthor'),
          authors: item.authors || [],
          desc: item.description,
          tags: item.tags || [],
          time: item.lastUpdated || '',
          unread: false,
          hash: item.hash,
          version: item.version,
          path: item.fullPath || `combat/${item.name}`,
          isSubscribed: item.isSubscribed,
          hasUpdate: item.hasUpdate || false
        }));

        if (strategies.value.length > 0) {
          const prevSelected = selectedId.value;
          const stillExists = strategies.value.some(s => s.id === prevSelected);
          selectedId.value = stillExists ? prevSelected : null;
        } else {
          selectedId.value = null;
        }
      });
    }
  }
);

const selectedId = ref(null);

const selectStrategy = async (id) => {
  selectedId.value = id;
  const strategy = strategies.value.find(strategy => strategy.id === id);
  emit('select', strategy);
  const mode = import.meta.env.VITE_MODE;
  if (mode === 'single') {
    const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
    const result = await repoWebBridge.UpdateSubscribed(strategy.path);
    if (result) {
      // 通知父组件更新repoData中的hasUpdate状态
      emit('updateHasUpdate', strategy.path, false);
    } else {
      console.error('Failed to update subscription:');
    }
  }
  console.log("Node selected", strategy);
};

const sortStrategies = (strategyList) => {
  if (props.sortType === 'recommend') {
    return [...strategyList];
  }

  const sorted = [...strategyList];

  if (props.sortType === 'name') {
    // 按title排序
    sorted.sort((a, b) => {
      const nameA = (a.title || '').toLowerCase();
      const nameB = (b.title || '').toLowerCase();
      return props.sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  } else if (props.sortType === 'time') {
    // 按时间排序
    sorted.sort((a, b) => {
      const timeA = a.time || '';
      const timeB = b.time || '';
      return props.sortOrder === 'asc' ? timeA.localeCompare(timeB) : timeB.localeCompare(timeA);
    });
  }

  return sorted;
};

const filteredStrategies = computed(() => {
  let baseList = strategies.value;
  if (props.showSubscribedOnly) {
    if (!props.subscribedPaths || props.subscribedPaths.length === 0) {
      return [];
    }
    baseList = baseList.filter(strategy => props.subscribedPaths.includes(strategy.path));
  }

  if (!props.searchKey) {
    return sortStrategies(baseList);
  }

  const keyword = normalize(props.searchKey.trim());
  // 完全匹配优先
  const nameMatches = baseList.filter(s =>
    normalize(s.title) === keyword ||
    (s.authors && s.authors.some(a => normalize(a.name) === keyword))
  );
  if (nameMatches.length) return sortStrategies(nameMatches);

  // 相关性分数排序
  const scored = baseList.map(s => {
    let score = 0;
    if (normalize(s.title).includes(keyword)) score += 3;
    if (s.authors && s.authors.some(a => normalize(a.name).includes(keyword))) score += 2;
    if ((s.tags || []).some(tag => normalize(tag).includes(keyword))) score += 2;
    if (normalize(s.desc).includes(keyword)) score += 1;
    return { ...s, _score: score };
  }).filter(s => s._score > 0);
  scored.sort((a, b) => b._score - a._score);

  // 对搜索结果应用排序
  const sortedScored = sortStrategies(scored);
  return sortedScored;
});
</script>

<style scoped>
.list-container {
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
}

.script-item {
  background: #fff;
  border-radius: 10px;
  margin: 10px 12px;
  padding: 16px 18px 12px 18px;
  box-shadow: 0 2px 8px 0 #f2f3f5;
  border: 1.5px solid #e5e7eb;
  cursor: pointer;
  transition: box-shadow 0.2s, border 0.2s;
  position: relative;
}

.script-item.active {
  border: 1.5px solid #1677ff;
  background: #f5faff;
  box-shadow: 0 4px 16px 0 #e6f0ff;
}

.script-item:hover {
  background: #f0f6ff;
  box-shadow: 0 4px 16px 0 #e6f0ff;
  border-color: #1677ff;
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
  color: #222;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.has-update-badge {
  display: inline-block;
  margin-left: 4px;
  transform: translateY(-2px);
  background: #fff;
  color: #00b96b;
  font-size: 10px;
  padding: 1px 3px;
  border-radius: 8px;
  border: 1px solid #00b96b;
  vertical-align: middle;
}

.subscribed-badge {
  display: inline-block;
  margin-left: 1px;
  transform: translateY(-2px) translateX(8px);
  background: #fff;
  color: #1677ff;
  font-size: 10px;
  padding: 1px 3px;
  border-radius: 8px;
  border: 1px solid #1677ff;
  vertical-align: middle;
}

.item-dot {
  width: 8px;
  height: 8px;
  background: #1677ff;
  border-radius: 50%;
  margin-left: 8px;
  display: inline-block;
}

.item-author {
  color: #888;
  font-size: 13px;
  margin-bottom: 4px;
}

.item-desc {
  color: #555;
  font-size: 13px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-tags {
  margin-bottom: 6px;
}

.item-tag {
  background: #e6f0ff !important;
  color: #1677ff !important;
  border-radius: 6px !important;
  font-size: 12px;
  margin-right: 4px;
  padding: 0 8px;
  border: none !important;
}

.item-time {
  color: #aaa;
  font-size: 12px;
  margin-top: 2px;
}
</style>
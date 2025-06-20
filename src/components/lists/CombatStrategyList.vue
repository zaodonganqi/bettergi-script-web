<template>
  <div class="list-container">
    <div
      v-for="item in filteredStrategies"
      :key="item.id"
      :class="['script-item', { active: item.id === selectedId }]"
      @click="selectStrategy(item.id)"
    >
      <div class="item-header">
        <span class="item-title">{{ item.title }}</span>
        <span v-if="item.unread" class="item-dot"></span>
      </div>
      <div class="item-author">{{ item.author }}</div>
      <div class="item-desc">{{ item.desc }}</div>
      <div class="item-tags">
        <a-tag v-for="tag in item.tags" :key="tag" color="#e6f0ff" class="item-tag">{{ tag }}</a-tag>
      </div>
      <div class="item-time">{{ item.time }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  searchKey: {
    type: String,
    default: ''
  },
  repoData: {
    type: Object,
    required: true,
    default: null
  }
});
const { repoData } = props;

const emit = defineEmits(['select']);

function getCombatStrategiesFromRepo(repo) {
  const combatNode = repo.indexes.find(item => item.name === 'combat');
  if (!combatNode || !combatNode.children) return [];
  // 递归收集所有叶子节点
  const result = [];
  function traverse(nodes) {
    for (let child of nodes) {
      if (child.children && child.children.length > 0) {
        traverse(child.children);
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
        result.push(child);
      }
    }
  }
  traverse(combatNode.children);
  return result;
}

function removeFileSuffix(name) {
  return name.replace(/\.[^.]+$/, '');
}

const strategies = ref(
  getCombatStrategiesFromRepo(repoData).map((item, idx) => ({
    id: idx + 1,
    title: removeFileSuffix(item.name),
    author: item.author || '无',
    desc: item.description || '',
    tags: item.tags || [],
    time: item.lastUpdated || '',
    unread: false,
    hash: item.hash,
    version: item.version,
  }))
);

const selectedId = ref(1);

const selectStrategy = (id) => {
  selectedId.value = id;
  const strategy = strategies.value.find(strategy => strategy.id === id);
  emit('select', strategy);
};

const filteredStrategies = computed(() => {
  if (!props.searchKey) return strategies.value;
  
  const searchLower = props.searchKey.toLowerCase();
  return strategies.value.filter(strategy => {
    return (
      strategy.title.toLowerCase().includes(searchLower) ||
      strategy.author.toLowerCase().includes(searchLower) ||
      strategy.desc.toLowerCase().includes(searchLower) ||
      strategy.detail.toLowerCase().includes(searchLower) ||
      strategy.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
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
  align-items: center;
  margin-bottom: 2px;
}

.item-title {
  font-size: 16px;
  font-weight: 700;
  color: #222;
  margin-bottom: 4px;
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
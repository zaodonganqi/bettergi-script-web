<template>
  <div class="list-container">
    <a-list :data-source="filteredScripts">
      <template #renderItem="{ item }">
        <div :class="['script-item', { active: item.id === selectedId }]" @click="selectScript(item.id)">
          <div class="item-header">
            <div class="item-title-wrap">
              <span class="item-title-main">{{ item.name1 }}</span>
              <span v-if="item.name1 !== item.name2" class="item-title-sub">{{ item.name2 }}</span>
            </div>
            <span v-if="item.unread" class="item-dot"></span>
          </div>
          <div class="item-author">
            <template v-if="item.authors && item.authors.length">
              {{item.authors.map(a => a.name).join('，')}}
            </template>
            <template v-else>
              {{ item.author }}
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

const emit = defineEmits(['select', 'scriptCount']);

function getJsScriptsFromRepo(repo) {
  const jsNode = repo.indexes.find(item => item.name === 'js');
  if (!jsNode || !jsNode.children) return [];

  // 递归收集所有叶子节点
  const result = [];
  function traverse(nodes, currentPath = 'js') {
    for (let child of nodes) {
      if (child.children && child.children.length > 0) {
        const childPath = `${currentPath}/${child.name}`;
        traverse(child.children, childPath);
      } else {
        // 应@秋云 需求，改成了第一行name第二行nameSuffix的样式
        let name1 = child.name;
        let name2 = child.name;
        let title = child.name;
        let description = child.description || '';

        if (child.type === 'directory' && child.description && child.description.includes('~|~')) {
          const [nameSuffix, newDescription] = child.description.split('~|~');
          name2 = nameSuffix.trim();
          title = `${name1} - ${name2}`;
          description = newDescription.trim();
        }
        let authors = [];
        if (Array.isArray(child.authors) && child.authors.length > 0) {
          authors = child.authors;
        } else if (child.author) {
          authors = [{ name: child.author }];
        }
        child = {
          ...child,
          name1: name1,
          name2: name2,
          title: title,
          description: description,
          fullPath: `${currentPath}/${child.name}`,
          authors: authors
        };
        result.push(child);
      }
    }
  }
  traverse(jsNode.children);
  return result;
}

const scripts = ref(
  getJsScriptsFromRepo(repoData).map((item, idx) => ({
    id: idx + 1,
    title: item.title,
    name: item.name,
    name1: item.name1,
    name2: item.name2,
    author: item.author || '',
    authors: item.authors || [],
    desc: item.description,
    tags: item.tags || [],
    time: item.lastUpdated || '',
    unread: false,
    hash: item.hash,
    version: item.version,
    path: item.fullPath || `js/${item.name}`,
  }))
);

// 监听 repoData 变化，重新生成 scripts
watch(
  () => props.repoData,
  (newVal) => {
    if (newVal && newVal.indexes) {
      nextTick(() => {
        scripts.value = getJsScriptsFromRepo(newVal).map((item, idx) => ({
          id: idx + 1,
          title: item.title,
          name: item.name,
          name1: item.name1,
          name2: item.name2,
          author: item.author || '',
          authors: item.authors || [],
          desc: item.description,
          tags: item.tags || [],
          time: item.lastUpdated || '',
          unread: false,
          hash: item.hash,
          version: item.version,
          path: item.fullPath || `js/${item.name}`,
        }));
        
        if (scripts.value.length > 0) {
          const prevSelected = selectedId.value;
          const stillExists = scripts.value.some(s => s.id === prevSelected);
          selectedId.value = stillExists ? prevSelected : scripts.value[0].id;
        } else {
          selectedId.value = null;
        }
      });
    }
  }
);

const selectedId = ref(scripts.value.length > 0 ? scripts.value[0].id : null);

const selectScript = (id) => {
  selectedId.value = id;
  const script = scripts.value.find(script => script.id === id);
  emit('select', script);
};

const filteredScripts = computed(() => {
  if (!props.searchKey) return scripts.value;

  const searchLower = props.searchKey.toLowerCase();
  return scripts.value.filter(script => {
    return (
      script.title.toLowerCase().includes(searchLower) ||
      script.author.toLowerCase().includes(searchLower) ||
      script.desc.toLowerCase().includes(searchLower) ||
      script.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });
});

const calculateScriptCount = () => {
  emit('scriptCount', scripts.value.length);
};

defineExpose({
  calculateScriptCount
});
</script>

<style scoped>
.list-container {
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
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

.item-title-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  margin-right: 8px;
}

.item-title-main,
.item-title-sub {
  font-size: 15px;
  font-weight: 700;
  color: #222;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
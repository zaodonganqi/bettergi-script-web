<template>
  <div class="list-container">
    <a-tree
      :data="filteredTreeData"
      :defaultExpandedKeys="expandedKeys"
      @select="handleSelect"
    >
      <template #title="{ title }">
        <span>{{ title }}</span>
      </template>
      <template #extra="nodeData">
        <a-button type="text" size="mini" style="position: absolute; right: 8px; top: 6px; color: #3370ff;" @click.stop="handleSubscribe(nodeData)">
          订阅
        </a-button>
      </template>
    </a-tree>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { match } from 'pinyin-pro';
import repoData from '@/assets/repo.json';

const props = defineProps({
  searchKey: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['select']);

const expandedKeys = ref(['1', '1-1', '1-2']); // 默认展开的节点
const treeData = ref([]);

const isPinyinMatch = (text, search) => {
  const searchLower = search.toLowerCase();
  const textLower = text.toLowerCase();

  if (textLower.includes(searchLower)) {
    return true;
  }

  const pinyinMatch = match(textLower, searchLower);
  return !!pinyinMatch;
};

const filteredTreeData = computed(() => {
  if (!props.searchKey) return treeData.value;
  
  return filterTreeNodes(treeData.value, props.searchKey);
});

const filterTreeNodes = (nodes, searchText) => {
  return nodes.map(node => {
    const isSelfMatch = isPinyinMatch(node.title, searchText);
    
    if (isSelfMatch) {
      return { ...node };
    }

    if (node.children) {
      const filteredChildren = filterTreeNodes(node.children, searchText);
      if (filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren
        };
      }
    }

    return null;
  }).filter(Boolean);
};

const handleSelect = (selectedKeys, event) => {
  if (selectedKeys.length > 0) {
    const selectedNode = findNodeByKey(treeData.value, selectedKeys[0]);
    if (selectedNode) {
      emit('select', {
        id: selectedNode.key,
        title: selectedNode.title,
        type: 'location',
        path: getNodePath(treeData.value, selectedNode.key),
        description: selectedNode.description || '',
        author: selectedNode.author || '',
        date: selectedNode.date || '',
        tags: selectedNode.tags || []
      });
    }
  }
};

const findNodeByKey = (nodes, key) => {
  for (const node of nodes) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findNodeByKey(node.children, key);
      if (found) return found;
    }
  }
  return null;
};

const getNodePath = (nodes, key, path = []) => {
  for (const node of nodes) {
    if (node.key === key) {
      return [...path, node.title];
    }
    if (node.children) {
      const found = getNodePath(node.children, key, [...path, node.title]);
      if (found) return found;
    }
  }
  return null;
};

const handleSubscribe = (nodeData) => {
  console.log('订阅位置:', nodeData);
  // TODO: 实现订阅功能
};

const generateTreeData = (data) => {
  if (!data || !data.indexes) return [];
  
  console.log('indexes数据:', data.indexes);
  // 找到地图追踪分类
  const mapCategory = data.indexes.find(category => category.name === 'pathing');
  console.log('找到的地图分类:', mapCategory);
  if (!mapCategory) return [];

  // 将地图数据转换为树形结构
  const treeData = mapCategory.children.map((location, index) => ({
    key: `${index + 1}`,
    title: location.name,
    children: location.children ? location.children.map((child, childIndex) => ({
      key: `${index + 1}-${childIndex + 1}`,
      title: child.name,
      children: child.children ? child.children.map((grandChild, grandChildIndex) => ({
        key: `${index + 1}-${childIndex + 1}-${grandChildIndex + 1}`,
        title: grandChild.name,
        description: grandChild.description,
        author: grandChild.author,
        date: grandChild.date,
        tags: grandChild.tags
      })) : []
    })) : []
  }));
  console.log('生成的树形数据:', treeData);
  return treeData;
};

onMounted(() => {
  console.log('组件已挂载');
  console.log('repoData:', repoData);
  
  if (repoData && repoData.indexes) {
    console.log('找到indexes数据');
    treeData.value = generateTreeData(repoData);
    console.log('地图树数据已加载:', treeData.value);
  } else {
    console.log('未找到indexes数据');
  }
});
</script>

<style scoped>
.list-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 8px;
}

:deep(.arco-tree-node) {
  padding: 4px 0;
}

:deep(.arco-tree-node-title) {
  font-size: 14px;
}

:deep(.arco-tree-node-selected) {
  background-color: #f5faff;
}

:deep(.arco-tree-node:hover) {
  background-color: #f0f6ff;
}
</style> 
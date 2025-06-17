<template>
  <div class="list-container">
    <a-tree
      :treeData="filteredTreeData"
      :expandedKeys="expandedKeys"
      :selectedKeys="selectedKeys"
      @select="handleSelect"
      @expand="handleExpand"
    >
      <template #title="{ title, key, isLeaf }">
        <div class="tree-node-container">
          <span class="tree-node-title">{{ title }}</span>
          <a-button 
            class="subscribe-btn"
            type="text" 
            size="small" 
            style="color: #3370ff;" 
            @click.stop="handleSubscribe({ key, title })"
          >
            订阅
          </a-button>
        </div>
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

const expandedKeys = ref([]);
const selectedKeys = ref([]);
const treeData = ref([]);
const originalTreeData = ref([]); // 添加原始数据存储

// 拼音匹配函数
const isPinyinMatch = (text, search) => {
  const searchLower = search.toLowerCase();
  const textLower = text.toLowerCase();
  return textLower.includes(searchLower) || !!match(textLower, searchLower);
};

// 处理节点展开
const handleExpand = (keys) => {
  const newExpandedKeys = [];
  
  keys.forEach(key => {
    const node = findNodeByKey(treeData.value, key);
    // 只有当节点有非叶子子节点时才允许展开
    if (node && node.children && node.children.some(child => child.children?.length > 0)) {
      newExpandedKeys.push(key);
    }
  });
  
  expandedKeys.value = newExpandedKeys;
};

// 处理节点选择
const handleSelect = (selectedKeys, { node }) => {
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

// 处理订阅
const handleSubscribe = (nodeData) => {
  console.log('订阅位置:', nodeData);
  // TODO: 实现订阅功能
};

// 查找节点
const findNodeByKey = (nodes, key) => {
  if (!nodes) return null;
  for (const node of nodes) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findNodeByKey(node.children, key);
      if (found) return found;
    }
  }
  return null;
};

// 获取节点路径
const getNodePath = (nodes, key, path = []) => {
  if (!nodes) return null;
  for (const node of nodes) {
    if (node.key === key) return [...path, node.title];
    if (node.children) {
      const found = getNodePath(node.children, key, [...path, node.title]);
      if (found) return found;
    }
  }
  return null;
};

// 过滤树节点
const filterTreeNodes = (nodes, searchText) => {
  if (!searchText) return nodes;
  
  return nodes.map(node => {
    const isSelfMatch = isPinyinMatch(node.title, searchText);
    
    // 如果当前节点匹配，返回完整节点（包括子节点）
    if (isSelfMatch) {
      return {
        ...node,
        // 搜索匹配时强制显示所有子节点
        children: node.rawChildren?.map((child, idx) => 
          processNode(child, node.key)
        ) || []
      };
    }
    
    // 检查子节点是否有匹配
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

// 生成树形数据
const generateTreeData = (data) => {
  if (!data || !data.indexes) return [];
  
  const mapCategory = data.indexes.find(category => category.name === 'pathing');
  if (!mapCategory) return [];

  const processNode = (node, parentKey = '') => {
    const currentKey = parentKey ? `${parentKey}-${node.name}` : node.name;
    const children = node.children?.map((child, idx) => processNode(child, currentKey)) || [];
    
    // 正确计算 isLeaf：只有没有子节点的才是叶子节点
    const isLeaf = children.length === 0;
    
    return {
      key: currentKey,
      title: node.name,
      isLeaf, // 正确设置叶子节点标识
      children,
      description: node.description,
      author: node.author,
      date: node.date,
      tags: node.tags,
      // 保存原始子节点信息用于搜索
      rawChildren: node.children || []
    };
  };

  return mapCategory.children.map(node => processNode(node));
};

// 计算过滤后的树形数据
const filteredTreeData = computed(() => {
  if (!props.searchKey) return treeData.value;
  return filterTreeNodes(treeData.value, props.searchKey);
});

onMounted(() => {
  if (repoData && repoData.indexes) {
    treeData.value = generateTreeData(repoData);
  }
});

</script>

<style scoped>
.list-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
  scrollbar-gutter: stable both-edges;
}

.tree-node-container {
  display: flex;
  width: 100%;
  min-height: 32px; /* 确保最小高度 */
  position: relative;
  align-items: center; /* 垂直居中 */
  word-break: break-word; /* 允许单词内换行 */
  padding-right: 40px; /* 为按钮预留空间 */
  box-sizing: border-box; /* 包含padding在宽度内 */
}

.tree-node-title {
  flex: 1;
  white-space: normal; /* 允许自动换行 */
  overflow-wrap: break-word; /* 长单词换行 */
  min-width: 0; /* 防止文本溢出容器 */
  padding-right: 8px; /* 标题与按钮之间的间距 */
}

.subscribe-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #3370ff;
  flex-shrink: 0; /* 防止按钮被压缩 */
}

:deep(.ant-tree) {
  width: calc(100% - 10px); /* 预留滚动条宽度 */
}

</style> 
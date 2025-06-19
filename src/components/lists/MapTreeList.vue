<template>
  <div class="list-container">
    <a-tree :treeData="filteredTreeData" :expandedKeys="expandedKeys" :selectedKeys="selectedKeys"
      @select="handleSelect" @expand="handleExpand">
      <template #switcherIcon="{ expanded, dataRef }">
        <span v-if="hasExpandableChildren(dataRef)">
          <CaretDownOutlined v-if="expanded" />
          <CaretRightOutlined v-else />
        </span>
        <span v-else class="empty-switcher"></span>
      </template>
      <template #title="{ title, key }">
        <div class="tree-node-container">
          <span class="tree-node-title">{{ title }}</span>
          <a-button class="subscribe-btn" type="text" size="small" @click.stop="handleSubscribe({ key, title })">
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
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons-vue';
import { version } from 'less';

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

// 判断节点是否有可展开的子节点
const hasExpandableChildren = (dataRef) => {
  return dataRef?.children?.some(child => child.children?.length > 0);
};

// 处理节点展开
const handleExpand = (keys) => {
  expandedKeys.value = keys.filter(key => {
    const node = findNodeByKey(treeData.value, key);
    return hasExpandableChildren(node);
  });
};

// 处理节点选择
const handleSelect = (selectedKeysList, { node }) => {
  if (selectedKeysList.length === 0) return;

  const selectedNode = findNodeByKey(treeData.value, selectedKeysList[0]);
  if (!selectedNode) return;

  emit('select', {
    id: selectedNode.key,
    title: selectedNode.title,
    name: selectedNode.name,
    type: selectedNode.type,
    hash: selectedNode.hash,
    version: selectedNode.version,
    author: selectedNode.author || '',
    description: selectedNode.description || '',
    tags: selectedNode.tags || [],
    lastUpdated: selectedNode.lastUpdated || '',
    path: getNodePath(treeData.value, selectedNode.key),
  });
  console.log("已选择节点", selectedNode)
};

// 处理订阅
const handleSubscribe = (nodeData) => {
  // TODO: 实现订阅功能
};

// 查找节点（优化性能）
const findNodeByKey = (nodes, key) => {
  if (!nodes) return null;

  const stack = [...nodes];
  while (stack.length) {
    const node = stack.pop();
    if (node.key === key) return node;
    if (node.children) stack.push(...node.children);
  }
  return null;
};

// 获取节点路径
const getNodePath = (nodes, key) => {
  if (!nodes) return null;

  const path = [];
  const findPath = (nodeList, targetKey) => {
    for (const node of nodeList) {
      if (node.key === targetKey) {
        path.unshift(node.title);
        return true;
      }
      if (node.children && findPath(node.children, targetKey)) {
        path.unshift(node.title);
        return true;
      }
    }
    return false;
  };

  return findPath(nodes, key) ? path : null;
};

// 处理节点数据
const processNode = (node, parentKey = '') => {
  const currentKey = parentKey ? `${parentKey}-${node.name}` : node.name;
  const children = node.children?.map(child => processNode(child, currentKey)) || [];

  return {
    key: currentKey,
    title: node.name,
    name: node.name,
    type: node.type,
    hash: node.hash,
    version: node.version,
    author: node.author,
    description: node.description,
    tags: node.tags,
    lastUpdated: node.lastUpdated,
    rawChildren: node.children || [],
    children
  };
};

// 过滤树节点
const filterTreeNodes = (nodes, searchText) => {
  if (!searchText) return nodes;

  return nodes.map(node => {
    // 检查是否匹配
    const isMatch = match(node.title.toLowerCase(), searchText.toLowerCase());

    // 直接匹配返回全部子节点
    if (isMatch) {
      return {
        ...node,
        children: node.rawChildren.map(child => processNode(child, node.key))
      };
    }

    // 子节点匹配
    if (node.children) {
      const filteredChildren = filterTreeNodes(node.children, searchText);
      if (filteredChildren.length) return { ...node, children: filteredChildren };
    }

    return null;
  }).filter(Boolean);
};

// 生成树形数据
const generateTreeData = (data) => {
  if (!data?.indexes) return [];

  const mapCategory = data.indexes.find(c => c.name === 'pathing');
  return mapCategory?.children?.map(node => processNode(node)) || [];
};

// 计算过滤后的树形数据
const filteredTreeData = computed(() =>
  filterTreeNodes(treeData.value, props.searchKey)
);

// 初始化
onMounted(() => {
  if (repoData) {
    treeData.value = generateTreeData(repoData);
  }
});
</script>

<style scoped>
/* 保持原有样式不变 */
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
  position: relative;
}

.empty-switcher {
  display: inline-block;
  width: 24px;
}

.tree-node-title {
  flex: 1;
  padding-right: 50px;
}

.subscribe-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #3370ff;
}

:deep(.ant-tree) {
  width: calc(100% - 10px);
  background: #f7f8fa;
}

:deep(.ant-tree-treenode) {
  width: 100%;
  padding: 4px 0;
}

:deep(.ant-tree-node-content-wrapper) {
  width: 100%;
}
</style>
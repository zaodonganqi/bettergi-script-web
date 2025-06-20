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
      <template #title="{ title, key, dataRef }">
        <div class="tree-node-container">
          <div class="tree-node-title">
            <a-image v-if="dataRef.showIcon" :src="dataRef.icon" :width="22" :placeholder="false" @error="dataRef.showIcon=false"/>
            <span>{{ title }}</span>
          </div>
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
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons-vue';

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

const emit = defineEmits(['select', 'leafCount']);
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
const handleSelect = (selectedKeysList) => {
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
  selectedKeys.value = selectedNode.key ? [selectedNode.key] : [];
  console.log("已选择节点", selectedNode)
};

// 处理订阅
const handleSubscribe = (nodeData) => {
  // TODO: 实现订阅功能
};

// 查找节点
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

// 获取节点图标
const getIconUrl = (tag) => {
  const baseIconUrl = "https://raw.githubusercontent.com/babalae/bettergi-scripts-list/refs/heads/main/repo/pathing/";
  const encodedTag = tag
  const iconPath = `${baseIconUrl}${encodedTag}/icon.ico`;

  // // 使用当前选中的镜像URL格式
  // if (selectedRepo.value && selectedRepo.value !== 'local') {
  //   const mirrorFormat = selectedRepo.value.split(baseRepo)[0];
  //   return mirrorFormat + iconPath;
  // }

  return iconPath;
};

// 处理节点数据
const processNode = (node, parentKey = '') => {
  const currentKey = parentKey ? `${parentKey}/${node.name}` : node.name;
  const children = node.children?.map(child => processNode(child, currentKey)) || [];
  const iconPath = getIconUrl(currentKey);

  return {
    key: currentKey,
    title: node.name,
    name: node.name,
    type: node.type || '',
    hash: node.hash || '',
    version: node.version,
    author: node.author || '无',
    description: node.description || '无',
    tags: node.tags || [],
    lastUpdated: node.lastUpdated || '无',
    rawChildren: node.children || [],
    children,
    icon: iconPath,
    showIcon: node.showIcon || false
  };
};

// 过滤树节点
const filterTreeNodes = (nodes, searchText) => {
  if (!searchText) return nodes;

  return nodes.map(node => {
    const isMatch = match(node.title.toLowerCase(), searchText.toLowerCase());
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

// 获取过滤后的树形数据
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
.list-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
  scrollbar-gutter: stable both-edges;
}

.tree-node-container {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.empty-switcher {
  display: inline-block;
  width: 24px;
}

.tree-node-title {
  flex: 1;
  padding-right: 40px;
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
  padding: 5px;
}

:deep(.ant-tree-node-content-wrapper) {
  width: 100%;
  transition: all 0.2s ease;
}
</style>
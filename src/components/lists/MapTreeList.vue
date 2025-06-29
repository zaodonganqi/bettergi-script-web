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
      <template #title="{ title, dataRef }">
        <div class="tree-node-container">
          <div class="tree-node-title">
            <a-image v-if="dataRef.showIcon" :src="dataRef.icon" :width="22" :placeholder="false"
              @error="dataRef.showIcon = false" />
            <span>{{ title }}</span>
          </div>
          <a-button class="subscribe-btn" type="text" size="small" @click.stop="handleSubscribe(dataRef)">
            订阅
          </a-button>
        </div>
      </template>
    </a-tree>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { match } from 'pinyin-pro';
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons-vue';
import { useClipboard } from '@vueuse/core';
import { message as Message } from 'ant-design-vue';

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
const { copy } = useClipboard();
const mode = import.meta.env.VITE_MODE;
const emit = defineEmits(['select', 'leafCount']);
const expandedKeys = ref([]);
const selectedKeys = ref([]);
const treeData = ref([]);

// 判断节点是否有可展开的子节点（只允许有子目录的节点可展开，若children全为file则不可展开）
const hasExpandableChildren = (dataRef) => {
  if (!dataRef?.children || dataRef.children.length === 0) return false;
  // 只要有一个子节点是目录即可展开
  return dataRef.children.some(child => child.type === 'directory');
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
    path: selectedNode.path || '',
    files: selectedNode.files || [],
    authors: selectedNode.authors || '',
    dirLastUpdated: selectedNode.lastUpdated || '',
  });
  selectedKeys.value = selectedNode.key ? [selectedNode.key] : [];
  console.log("已选择节点", selectedNode);
};

// 处理订阅
const handleSubscribe = (nodeData) => {
  if (!nodeData || !nodeData.key) {
    Message.error('请选择一个有效的节点进行订阅');
    return;
  }
  downloadScript(nodeData)
};

const downloadScript = async (script) => {
  // 创建一个包含脚本路径的数组
  const subscriptionData = [script.path];

  // 将数组转换为 JSON 字串
  const jsonString = JSON.stringify(subscriptionData);
  const base64String = btoa(encodeURIComponent(jsonString));

  // 创建完整的 URL
  const fullUrl = `bettergi://script?import=${base64String}`;

  if (mode === 'single') {
    try {
      await subscribeToLocal(fullUrl);
    } catch (error) {
      console.error('订阅失败:', error);
      Message.error(`订阅失败: ${error.message}`);
    }
  } else {
    // 将完整的 URL 复制到剪贴板
    copy(fullUrl).then(() => {
      Message.success(`已将 ${script.name} 的订阅链接复制到剪贴板`);
    }).catch((error) => {
      console.error('复制到剪贴板失败:', error);
      Message.error(`复制 ${script.name} 的订阅链接失败`);
    });
  }
};

const subscribeToLocal = async (url) => {
  const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
  await repoWebBridge.ImportUri(url);
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

// 获取节点图标
const getIconUrl = (tag) => {
  const baseIconUrl = "https://raw.githubusercontent.com/babalae/bettergi-scripts-list/refs/heads/main/repo/pathing/";
  const encodedTag = tag
  const iconPath = `${baseIconUrl}${encodedTag}/icon.ico`;
  return iconPath;
};

// 递归收集所有 file 节点
function collectFiles(node) {
  let files = [];
  if (node.type === 'file') {
    files.push(node);
  } else if (node.children) {
    node.children.forEach(child => {
      files = files.concat(collectFiles(child));
    });
  }
  return files;
}

// 处理节点数据
const processNode = (node, parentKey = '') => {
  const currentKey = parentKey ? `${parentKey}/${node.name}` : node.name;
  const children = node.children?.map(child => processNode(child, currentKey)) || [];
  const iconPath = getIconUrl(currentKey);

  let files = [];
  let authors = '';
  let lastUpdated = '';
  if (node.type === 'directory') {
    files = collectFiles(node);
    // 合并作者
    const authorSet = new Set(files.map(f => f.author).filter(Boolean));
    authors = Array.from(authorSet).join('，');
    // 取最新更新时间
    lastUpdated = files.reduce((latest, f) => {
      return (!latest || new Date(f.lastUpdated) > new Date(latest)) ? f.lastUpdated : latest;
    }, '');
  }

  return {
    key: currentKey,
    title: node.name,
    name: node.name,
    type: node.type || '',
    hash: node.hash || '',
    version: node.version,
    author: node.author || '',
    description: node.description || '无',
    tags: node.tags || [],
    lastUpdated: node.lastUpdated || '',
    rawChildren: node.children || [],
    children,
    icon: iconPath,
    showIcon: node.showIcon || false,
    path: `pathing/${currentKey}`,
    files, // 该目录下所有file节点
    authors, // 该目录下所有file的作者合并
    lastUpdated, // 该目录下所有file的最新更新时间
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

const updateExpandedKeysForSearch = (newSearchKey) => {
  if (!newSearchKey) {
    expandedKeys.value = [];
    return;
  }

  const newExpandedKeys = new Set();
  const searchText = newSearchKey.toLowerCase();

  const findPaths = (nodes, currentPath) => {
    for (const node of nodes) {
      if (match(node.title.toLowerCase(), searchText)) {
        currentPath.forEach(parentNode => {
          if (hasExpandableChildren(parentNode)) {
            newExpandedKeys.add(parentNode.key);
          }
        });
      }
      if (node.children && node.children.length > 0) {
        findPaths(node.children, [...currentPath, node]);
      }
    }
  };
  findPaths(treeData.value, []);
  expandedKeys.value = [...newExpandedKeys];
}

watch(
  () => props.searchKey,
  (newSearchKey) => {
    updateExpandedKeysForSearch(newSearchKey);
  }
);

// 监听 repoData 变化，重新处理 treeData
watch(
  () => props.repoData,
  (newVal) => {
    if (newVal && newVal.indexes) {
      treeData.value = generateTreeData(newVal);
    } else {
      treeData.value = [];
    }
  },
  { immediate: true, deep: true }
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
  padding: 4px 0px 4px 0px;
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
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
            <a-image v-if="dataRef.showIcon" :src="dataRef.icon" :placeholder="false"
              @error="dataRef.showIcon = false" />
            <span class="tree-node-title-text">{{ title }}</span>
            <span v-if="dataRef.hasUpdate" class="has-update-dot"></span>
          </div>
          <a-button class="subscribe-btn" type="text" size="small" @click.stop="handleSubscribe(dataRef)">
            {{ dataRef.isSubscribed ? $t('mapTreeList.subscribeAgain') : $t('mapTreeList.subscribe') }}
          </a-button>
        </div>
      </template>
    </a-tree>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons-vue';
import { useClipboard } from '@vueuse/core';
import { message as Message } from 'ant-design-vue';
import { getRepoPath } from '@/utils/basePaths';
import { subscribePaths } from '@/utils/subscription';
import { useI18n } from 'vue-i18n';
import iconUrlMap from '@/assets/icon_url.json';
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
  startPollingUserConfig: Function
});
const { copy } = useClipboard();
const mode = import.meta.env.VITE_MODE;
const emit = defineEmits(['select', 'updateHasUpdate']);
const expandedKeys = ref([]);
const selectedKeys = ref([]);
const treeData = ref([]);

onMounted(() => {
  treeData.value = generateTreeData(props.repoData);
});

watch(() => props.repoData, (val) => {
  treeData.value = generateTreeData(val);
}, { deep: true });

watch(() => props.subscribedPaths, (newPaths) => {
  treeData.value = generateTreeData(props.repoData);
});

// 监听 showSubscribedOnly 变化，重置树展开状态
watch(() => props.showSubscribedOnly, () => {
  expandedKeys.value = [];
  selectedKeys.value = [];
});

// 判断节点是否有可展开的子节点（只允许有子目录的节点可展开，若children全为file则不可展开）
const hasExpandableChildren = (dataRef) => {
  if (!dataRef?.children || dataRef.children.length === 0) return false;
  // 只要有一个子节点是目录即可展开
  return dataRef.children.some(child => child.type === 'directory');
};

// 处理节点展开
const handleExpand = (keys) => {
  expandedKeys.value = keys.filter(key => {
    const node = findNodeByKey(filteredTreeData.value, key);
    return hasExpandableChildren(node);
  });
};

// 处理节点选择
const handleSelect = async (selectedKeysList) => {
  if (selectedKeysList.length === 0) return;

  const selectedNode = findNodeByKey(filteredTreeData.value, selectedKeysList[0]);
  if (!selectedNode) return;

  emit('select', selectedNode);
  selectedKeys.value = selectedNode.key ? [selectedNode.key] : [];

  if (selectedNode.hasUpdate && mode === 'single') {
    const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
    const result = await repoWebBridge.UpdateSubscribed(selectedNode.path);
    if (result) {
      // 通知父组件更新repoData中的hasUpdate状态
      emit('updateHasUpdate', selectedNode.path, false);
    } else {
      console.error('Failed to update subscription:');
    }
  }

  console.log("Node selected", selectedNode);
};

// 处理订阅
const handleSubscribe = async (nodeData) => {
  if (!nodeData || !nodeData.key) {
    Message.error($t('mapTreeList.selectValidNode'));
    return;
  }
  try {
    const result = await subscribePaths([nodeData.path]);
    if (result.needsCopy) {
      await copy(result.url);
      Message.success($t('mapTreeList.subscribeSuccess', { name: nodeData.name }));
    }
  } catch (error) {
    console.error('Subscribe failed:', error);
    Message.error($t('mapTreeList.subscribeFailedWithMsg', { msg: error.message }));
  }
  if (typeof props.startPollingUserConfig === 'function') {
    props.startPollingUserConfig();
  }
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

// // 获取节点图标
// const getIconUrl = (tag) => {
//   const mode = import.meta.env.VITE_MODE;
//   const relPath = tag + '/icon.ico';
//   if (mode === 'single') {
//     // 本地模式下直接拼接回退路径
//     return '../../../Repos/bettergi-scripts-list-git/repo/' + relPath;
//   } else {
//     return getRepoPath() + relPath;
//   }
// };

// 递归收集所有 file 节点，并补全 path 字段
function collectFiles(node, parentPath = '') {
  let files = [];
  if (node.type === 'file') {
    // 生成与订阅时完全一致的路径格式
    const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    files.push({ ...node, path: `pathing/${fullPath}` });
  } else if (node.children) {
    node.children.forEach(child => {
      const childParentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
      files = files.concat(collectFiles(child, childParentPath));
    });
  }
  return files;
}

// 递归收集 authors
function collectAuthors(node) {
  // 优先用 node.authors
  if (Array.isArray(node.authors) && node.authors.length > 0) {
    return node.authors;
  }
  // 文件节点
  if (node.type === 'file') {
    if (node.author) {
      return [{ name: node.author }];
    }
    return [];
  }
  // 目录节点递归
  if (Array.isArray(node.children)) {
    const all = node.children.flatMap(collectAuthors);
    // 去重（按 name）
    const map = new Map();
    all.forEach(a => {
      if (a && a.name) map.set(a.name, a);
    });
    return Array.from(map.values());
  }
  return [];
}

// 递归给 files 节点赋 isSubscribed 字段
function markFilesSubscribed(files, subscribedPaths) {
  if (!Array.isArray(files)) return [];
  return files.map(file => ({
    ...file,
    isSubscribed: subscribedPaths.some(sub => file.path && file.path.startsWith(sub))
  }));
}

// 获取最新更新时间
const getLatestUpdateTime = (files) => {
  if (!Array.isArray(files) || files.length === 0) return '';
  return files.reduce((latest, f) => {
    return (!latest || new Date(f.lastUpdated) > new Date(latest)) ? f.lastUpdated : latest;
  }, '');
};

// 处理节点数据
const processNode = (node, parentKey = '', parentSubscribed = false) => {
  const currentKey = parentKey ? `${parentKey}/${node.name}` : node.name;
  // 先判断自身是否订阅
  const selfSubscribed = props.subscribedPaths.some(sub => (`pathing/${currentKey}`).startsWith(sub));
  // 如果父节点已订阅，自己也视为已订阅
  const isSubscribed = parentSubscribed || selfSubscribed;
  const children = node.children?.map(child => processNode(child, currentKey, isSubscribed)) || [];
  let iconPath = '';
  let showIcon = node.showIcon || false;
  if (node.children && node.children.length > 0) {
    // if (mode === 'single') {
    //   if (showIcon) {
    //     iconPath = getIconUrl('pathing/' + currentKey);
    //   }
    // } else {
    //   // web模式根据名称匹配
    //   const mappedItem = Array.isArray(iconUrlMap) ? iconUrlMap.find(item => item && item.name === node.name) : undefined;
    //   if (mappedItem && mappedItem.link) {
    //     iconPath = mappedItem.link;
    //     showIcon = true;
    //   }
    // }
    const mappedItem = Array.isArray(iconUrlMap) ? iconUrlMap.find(item => item && item.name === node.name) : undefined;
    if (mappedItem && mappedItem.link) {
      iconPath = mappedItem.link;
      showIcon = true;
    }
  }
  let files = [];
  let lastUpdated = '';
  if (node.type === 'directory') {
    // 传递父级路径，不包含当前目录名
    files = collectFiles(node, parentKey);
    files = markFilesSubscribed(files, props.subscribedPaths);
    // 目录显示最新文件时间
    lastUpdated = getLatestUpdateTime(files);
  } else if (node.type === 'file') {
    // 文件显示自身时间
    lastUpdated = node.lastUpdated || '';
  }

  const authors = collectAuthors(node);

  return {
    key: currentKey,
    title: node.name,
    name: node.name,
    type: node.type || '',
    version: node.version,
    author: node.author || '',
    authors: authors,
    description: node.description,
    tags: node.tags || [],
    time: node.lastUpdated || '',
    lastUpdated: lastUpdated,
    rawChildren: node.children || [],
    children,
    icon: iconPath,
    showIcon: showIcon,
    path: `pathing/${currentKey}`,
    files,
    isSubscribed,
    hasUpdate: node.hasUpdate || false,
  };
};

// 生成树形数据
const generateTreeData = (data) => {
  if (!data?.indexes) return [];

  const mapCategory = data.indexes.find(c => c.name === 'pathing');
  return mapCategory?.children?.map(node => processNode(node, '', false)) || [];
};

// 获取匹配数据
const filteredTreeData = computed(() => {
  // 只显示已订阅”
  if (props.showSubscribedOnly) {
    if (!props.subscribedPaths || props.subscribedPaths.length === 0) {
      return [];
    }
    const pathingSubs = props.subscribedPaths.filter(p => p.startsWith('pathing/'));
    function filterTreeBySubscribedPaths(nodes, subscribedPaths) {
      if (!nodes) return [];
      return nodes.map(node => {
        const isSubscribed = subscribedPaths.some(sub => node.path.startsWith(sub));
        if (isSubscribed) {
          return {
            ...node,
            children: node.children ? filterTreeBySubscribedPaths(node.children, subscribedPaths) : []
          };
        }
        if (node.children) {
          const filteredChildren = filterTreeBySubscribedPaths(node.children, subscribedPaths);
          if (filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
        }
        return null;
      }).filter(Boolean);
    }
    // 只在已订阅节点中做搜索
    let baseTree = filterTreeBySubscribedPaths(treeData.value, pathingSubs);
    if (!props.searchKey) return baseTree;
    const keyword = props.searchKey.trim().toLowerCase();
    // 递归过滤并加分
    function scoreNode(node) {
      let isExact = false;
      if (node.title && node.title.toLowerCase() === keyword) isExact = true;
      if (node.authors && node.authors.some(a => normalize(a.name) === keyword)) isExact = true;
      if ((node.tags || []).some(tag => tag.toLowerCase() === keyword)) isExact = true;
      if (node.description && node.description.toLowerCase() === keyword) isExact = true;
      let score = 0;
      if (!isExact) {
        if (node.title && node.title.toLowerCase().includes(keyword)) score += 3;
        if (node.authors && node.authors.some(a => normalize(a.name).includes(keyword))) score += 3;
        if ((node.tags || []).some(tag => tag.toLowerCase().includes(keyword))) score += 2;
        if (node.description && node.description.toLowerCase().includes(keyword)) score += 2;
      }
      return { ...node, _isExact: isExact, _score: score };
    }
    function filterAndScore(nodes) {
      let result = [];
      for (const node of nodes) {
        if (node.children && node.children.length) {
          const children = filterAndScore(node.children);
          if (children.length) {
            result.push({ ...scoreNode(node), children });
          }
        } else {
          const scored = scoreNode(node);
          if (scored._isExact || scored._score > 0) {
            result.push(scored);
          }
        }
      }
      return result;
    }
    let filtered = filterAndScore(baseTree);
    // 展平所有叶子节点，分为exact和others
    function flatten(nodes, arr = []) {
      for (const node of nodes) {
        if (node.children && node.children.length) {
          flatten(node.children, arr);
        } else {
          arr.push(node);
        }
      }
      return arr;
    }
    const allLeaf = flatten(filtered);
    const exactLeaf = allLeaf.filter(n => n._isExact);
    const otherLeaf = allLeaf.filter(n => !n._isExact && n._score > 0);
    otherLeaf.sort((a, b) => (b._score || 0) - (a._score || 0));
    function filterByLeaf(nodes, leafSet) {
      let result = [];
      for (const node of nodes) {
        if (node.children && node.children.length) {
          const children = filterByLeaf(node.children, leafSet);
          if (children.length) {
            result.push({ ...node, children });
          }
        } else if (leafSet.has(node)) {
          result.push(node);
        }
      }
      return result;
    }
    if (exactLeaf.length) {
      const leafSet = new Set(exactLeaf);
      return filterByLeaf(filtered, leafSet);
    } else if (otherLeaf.length) {
      const leafSet = new Set(otherLeaf);
      return filterByLeaf(filtered, leafSet);
    } else {
      return [];
    }
  }

  if (!props.searchKey) return treeData.value;
  const keyword = props.searchKey.trim().toLowerCase();

  // 递归过滤并加分
  function scoreNode(node) {
    let isExact = false;
    if (node.title && node.title.toLowerCase() === keyword) isExact = true;
    if (node.authors && node.authors.some(a => normalize(a.name) === keyword)) isExact = true;
    if ((node.tags || []).some(tag => tag.toLowerCase() === keyword)) isExact = true;
    if (node.description && node.description.toLowerCase() === keyword) isExact = true;
    let score = 0;
    if (!isExact) {
      if (node.title && node.title.toLowerCase().includes(keyword)) score += 3;
      if (node.authors && node.authors.some(a => normalize(a.name).includes(keyword))) score += 3;
      if ((node.tags || []).some(tag => tag.toLowerCase().includes(keyword))) score += 2;
      if (node.description && node.description.toLowerCase().includes(keyword)) score += 2;
    }
    return { ...node, _isExact: isExact, _score: score };
  }

  function filterAndScore(nodes) {
    let result = [];
    for (const node of nodes) {
      if (node.children && node.children.length) {
        const children = filterAndScore(node.children);
        if (children.length) {
          result.push({ ...scoreNode(node), children });
        }
      } else {
        const scored = scoreNode(node);
        if (scored._isExact || scored._score > 0) {
          result.push(scored);
        }
      }
    }
    return result;
  }

  let filtered = filterAndScore(treeData.value);

  // 展平所有叶子节点，分为exact和others
  function flatten(nodes, arr = []) {
    for (const node of nodes) {
      if (node.children && node.children.length) {
        flatten(node.children, arr);
      } else {
        arr.push(node);
      }
    }
    return arr;
  }
  const allLeaf = flatten(filtered);
  const exactLeaf = allLeaf.filter(n => n._isExact);
  const otherLeaf = allLeaf.filter(n => !n._isExact && n._score > 0);
  otherLeaf.sort((a, b) => (b._score || 0) - (a._score || 0));

  // 只保留有相关叶子的分支
  function filterByLeaf(nodes, leafSet) {
    let result = [];
    for (const node of nodes) {
      if (node.children && node.children.length) {
        const children = filterByLeaf(node.children, leafSet);
        if (children.length) {
          result.push({ ...node, children });
        }
      } else if (leafSet.has(node)) {
        result.push(node);
      }
    }
    return result;
  }

  if (exactLeaf.length) {
    const leafSet = new Set(exactLeaf);
    return filterByLeaf(filtered, leafSet);
  } else if (otherLeaf.length) {
    const leafSet = new Set(otherLeaf);
    return filterByLeaf(filtered, leafSet);
  } else {
    return [];
  }
});

const updateExpandedKeysForSearch = (newSearchKey) => {
  if (!newSearchKey) {
    expandedKeys.value = [];
    return;
  }
  // 递归收集所有叶子节点及其路径
  function collectMatchedLeafKeys(nodes, path = [], result = []) {
    for (const node of nodes) {
      if (node.children && node.children.length) {
        collectMatchedLeafKeys(node.children, [...path, node], result);
      } else {
        result.push({ node, path });
      }
    }
    return result;
  }
  const matchedLeafs = collectMatchedLeafKeys(filteredTreeData.value);
  const expandedSet = new Set();
  matchedLeafs.forEach(({ path }) => {
    path.forEach(parentNode => {
      if (hasExpandableChildren(parentNode)) {
        expandedSet.add(parentNode.key);
      }
    });
  });
  expandedKeys.value = [...expandedSet];
}

watch(
  () => props.searchKey,
  (newSearchKey) => {
    updateExpandedKeysForSearch(newSearchKey);
  }
);

function normalize(str) {
  return (str || '').toLowerCase().replace(/[\s【】\[\]（）()·,，.。!！?？\-_]/g, '');
}

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
  display: flex;
  align-items: center;
  padding-right: 62px;
}

:deep(.ant-image-img) {
  width: 26px;
  height: 26px;
  border-radius: 10px;
}

.tree-node-title-text {
  font-size: 14px;
  margin-left: 5px;
}

.subscribe-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #1677ff;
  background: none;
  border: none;
  width: 72px;
  text-align: center;
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

.subscribe-btn[disabled] {
  background: #fff !important;
  color: #1677ff !important;
  border-color: #1677ff !important;
  cursor: default !important;
}

.has-update-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #00b96b;
  border-radius: 50%;
  margin-left: 6px;
  vertical-align: middle;
  position: relative;
  top: -1px;
}
</style>
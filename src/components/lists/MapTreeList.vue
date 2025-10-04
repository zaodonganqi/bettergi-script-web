<template>
  <div class="list-container">
    <a-tree :treeData="filteredTreeData" :expandedKeys="expandedKeys" :selectedKeys="selectedKeys"
      @select="handleSelect" @expand="handleExpand" :block-node="true">
      <template #switcherIcon="{ expanded, dataRef }">
        <span v-if="hasExpandableChildren(dataRef)">
          <CaretDownOutlined v-if="expanded" />
          <CaretRightOutlined v-else />
        </span>
        <span v-else class="empty-switcher"></span>
      </template>
      <template #title="{ title, dataRef }">
        <div class="tree-node-container">
          <div class="tree-node-left">
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
import {computed, onMounted, ref, watch} from 'vue';
import {CaretDownOutlined, CaretRightOutlined} from '@ant-design/icons-vue';
import {useClipboard} from '@vueuse/core';
import {message as Message} from 'ant-design-vue';
import {subscribePaths} from '@/utils/subscription';
import {useI18n} from 'vue-i18n';
import iconUrlMap from '@/assets/icon_url.json';
import {useMainStore} from "@/stores/mainStore.js";

const { t: $t } = useI18n();

const { copy } = useClipboard();
const mainStore = useMainStore();
const expandedKeys = ref([]);
const selectedKeys = ref([]);
const treeData = ref([]);

onMounted(() => {
  treeData.value = generateTreeData(mainStore.repoData);
});

watch(() => mainStore.repoData, (val) => {
  treeData.value = generateTreeData(val);
}, { deep: true });

watch(() => mainStore.subscribedScriptPaths, (newPaths) => {
  treeData.value = generateTreeData(mainStore.repoData);
});

// 监听 showSubscribedOnly 变化，重置树展开状态
watch(() => mainStore.scriptTab === 'subscribed', () => {
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

  // 使用mainStore的方法选择节点
  mainStore.handleMapSelect(selectedNode);
  selectedKeys.value = selectedNode.key ? [selectedNode.key] : [];

  if (selectedNode.hasUpdate && mainStore.isModeSingle) {
    const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
    const result = await repoWebBridge.UpdateSubscribed(selectedNode.path);
    if (result) {
      // 使用mainStore的方法更新hasUpdate状态
      mainStore.updateScriptHasUpdate(selectedNode.path, false);
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
    await handleSelect([nodeData.key]);
    const result = await subscribePaths([nodeData.path]);
    if (result.needsCopy) {
      await copy(result.url);
      Message.success($t('mapTreeList.subscribeSuccess', { name: nodeData.name }));
    } else {
      mainStore.startPollingUserConfig();
    }
  } catch (error) {
    console.error('Subscribe failed:', error);
    Message.error($t('mapTreeList.subscribeFailedWithMsg', { msg: error.message }));
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

// 递归收集authors
function collectAuthors(node) {
  let authors = [];

  // 收集当前节点的作者
  if (Array.isArray(node.authors)) {
    authors = [...node.authors];
  }

  // 收集子节点的作者
  if (Array.isArray(node.children)) {
    const childAuthors = node.children.flatMap(collectAuthors);
    authors.push(...childAuthors);
  }

  // 去重
  return Array.from(
      new Map(authors.filter(a => a && a.name).map(a => [a.name, a])).values()
  );
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

// 国家图标仅用于地方特产直接子目录下
const countries = ["蒙德", "璃月", "稻妻", "枫丹", "纳塔", "挪德卡莱", "至冬"];
const countriesParentNode = "地方特产";

// 处理节点数据
const processNode = (node, parentKey = '', parentSubscribed = false) => {
  const currentKey = parentKey ? `${parentKey}/${node.name}` : node.name;
  // 先判断自身是否订阅
  const selfSubscribed = mainStore.subscribedScriptPaths.some(sub => (`pathing/${currentKey}`).startsWith(sub));
  // 如果父节点已订阅，自己也视为已订阅
  const isSubscribed = parentSubscribed || selfSubscribed;
  const children = node.children?.map(child => processNode(child, currentKey, isSubscribed)) || [];
  let iconPath = '';
  let showIcon = node.showIcon || false;
  // 添加图标路径
  if (node.children && node.children.length > 0) {
    const mappedItem = Array.isArray(iconUrlMap) ? iconUrlMap.find(item => item && item.name === node.name) : undefined;
    if (mappedItem && mappedItem.link) {
      iconPath = mappedItem.link;
      showIcon = true;
    }
    if (countries.some(country => node.name.includes(country)) && !parentKey.includes(countriesParentNode)) {
      iconPath = '';
      showIcon = false;
    }
  }
  let files = [];
  let lastUpdated = '';
  if (node.type === 'directory') {
    // 传递父级路径，不包含当前目录名
    files = collectFiles(node, parentKey);
    files = markFilesSubscribed(files, mainStore.subscribedScriptPaths);
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
    authors: authors,
    description: node.description,
    tags: node.tags || [],
    lastUpdated: lastUpdated,
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
  // 递归过滤并加分
  function scoreNode(node, keyword) {
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

  // 筛选并为节点计算权重
  function filterAndScore(nodes, keyword) {
    let result = [];
    for (const node of nodes) {
      if (node.children && node.children.length) {
        const children = filterAndScore(node.children, keyword);
        if (children.length) {
          result.push({ ...scoreNode(node, keyword), children });
        }
      } else {
        const scored = scoreNode(node, keyword);
        if (scored._isExact || scored._score > 0) {
          result.push(scored);
        }
      }
    }
    return result;
  }

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

  // 只显示已订阅
  if (mainStore.scriptTab === 'subscribed') {
    if (!mainStore.subscribedScriptPaths || mainStore.subscribedScriptPaths.length === 0) {
      return [];
    }
    const pathingSubs = mainStore.subscribedScriptPaths.filter(p => p.startsWith('pathing/'));
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
    if (!mainStore.search) return baseTree;
    // 搜索框输入
    const keyword = mainStore.search.trim().toLowerCase();
    let filtered = filterAndScore(baseTree, keyword);

    const allLeaf = flatten(filtered);
    const exactLeaf = allLeaf.filter(n => n._isExact);
    const otherLeaf = allLeaf.filter(n => !n._isExact && n._score > 0);
    otherLeaf.sort((a, b) => (b._score || 0) - (a._score || 0));
    if (exactLeaf.length) {
      const leafSet = new Set(exactLeaf);
      return filterByLeaf(filtered, leafSet);
    } else if (otherLeaf.length) {
      const leafSet = new Set(otherLeaf);
      return filterByLeaf(filtered, leafSet);
    } else {
      return [];
    }
  } else {
    if (!mainStore.search) return treeData.value;
    // 搜索框输入
    const keyword = mainStore.search.trim().toLowerCase();
    let filtered = filterAndScore(treeData.value, keyword);

    const allLeaf = flatten(filtered);
    const exactLeaf = allLeaf.filter(n => n._isExact);
    const otherLeaf = allLeaf.filter(n => !n._isExact && n._score > 0);
    otherLeaf.sort((a, b) => (b._score || 0) - (a._score || 0));

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
  () => mainStore.search,
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
  padding: 4px 0 4px 0;
  scrollbar-gutter: stable both-edges;
}

.tree-node-container {
  display: flex;
  align-items: center;
  width: 100%;
  transition: all 0.2s ease;
}

.tree-node-left {
  display: flex;
  align-content: center;
}

.empty-switcher {
  display: inline-block;
  width: 24px;
}

:deep(.ant-image) {
  align-content: center;
  justify-content: center;
}

:deep(.ant-image-img) {
  width: 26px;
  height: 26px;
  border-radius: 10px;
}

.tree-node-title-text {
  flex: 1;
  font-size: 14px;
  margin-left: 5px;
}

.subscribe-btn {
  margin-left: auto;
  background: none;
  border: none;
  width: 72px;
  text-align: center;
  color: var(--color-primary);
}

:deep(.ant-tree) {
  width: calc(100% - 10px);
  background: var(--bg-menu);
}

:deep(.ant-tree-treenode) {
  width: 100%;
  padding: 5px;
}

:deep(.ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected) {
  background: var(--bg-item-selected);
}

.subscribe-btn[disabled] {
  cursor: default !important;
}

.has-update-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--color-update);
  border-radius: 50%;
  margin-left: 6px;
  vertical-align: middle;
  position: relative;
  top: -1px;
}
</style>
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
            <span>
              {{ title }}<span v-if="dataRef.isSubscribed"> （已订阅）</span>
            </span>
          </div>
          <a-button
            class="subscribe-btn"
            type="text"
            size="small"
            @click.stop="handleSubscribe(dataRef)"
          >
            {{ dataRef.isSubscribed ? '再次订阅' : '订阅' }}
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
const emit = defineEmits(['select', 'leafCount']);
const expandedKeys = ref([]);
const selectedKeys = ref([]);
const treeData = ref([]);

onMounted(() => {
  treeData.value = generateTreeData(props.repoData);
});

watch(() => props.repoData, (val) => {
  treeData.value = generateTreeData(val);
});

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
const handleSelect = (selectedKeysList) => {
  if (selectedKeysList.length === 0) return;

  const selectedNode = findNodeByKey(filteredTreeData.value, selectedKeysList[0]);
  if (!selectedNode) return;

  emit('select', selectedNode);
  selectedKeys.value = selectedNode.key ? [selectedNode.key] : [];
  console.log("已选择节点", selectedNode);
};

// 处理订阅
const handleSubscribe = (nodeData) => {
  if (!nodeData || !nodeData.key) {
    Message.error('请选择一个有效的节点进行订阅');
    return;
  }
  downloadScript(nodeData);
  if (typeof props.startPollingUserConfig === 'function') {
    props.startPollingUserConfig();
  }
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

// 递归收集所有 file 节点，并补全 path 字段
function collectFiles(node, parentPath = '') {
  let files = [];
  if (node.type === 'file') {
    // 递归时传入完整路径
    const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    files.push({ ...node, path: `pathing/${fullPath}` });
  } else if (node.children) {
    node.children.forEach(child => {
      const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
      files = files.concat(collectFiles(child, currentPath));
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
  const iconPath = getIconUrl(currentKey);

  let files = [];
  let lastUpdated = '';
  if (node.type === 'directory') {
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
    hash: node.hash || '',
    version: node.version,
    author: node.author || '',
    authors: authors,
    description: node.description || '无',
    tags: node.tags || [],
    time: node.lastUpdated || '',
    lastUpdated: lastUpdated,
    rawChildren: node.children || [],
    children,
    icon: iconPath,
    showIcon: node.showIcon || false,
    path: `pathing/${currentKey}`,
    files,
    isSubscribed,
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
  return mapCategory?.children?.map(node => processNode(node, '', false)) || [];
};

function normalize(str) {
  return (str || '').toLowerCase().replace(/[\s【】\[\]（）()·,，.。!！?？\-_]/g, '');
}

// 替换原有的scoreNode函数
function scoreNode(node, keyword) {
  let isExact = false;
  if (normalize(node.title) === keyword) isExact = true;
  let score = 0;
  if (!isExact) {
    if (normalize(node.title).includes(keyword)) score += 3;
    if (normalize(node.author).includes(keyword)) score += 2;
    if ((node.tags || []).some(tag => normalize(tag).includes(keyword))) score += 2;
    if (normalize(node.description).includes(keyword)) score += 1;
  }
  return { ...node, _isExact: isExact, _score: score };
}

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
    const keyword = normalize(props.searchKey.trim());
    // 递归过滤并加分
    function filterAndScore(nodes) {
      let result = [];
      for (const node of nodes) {
        if (node.children && node.children.length) {
          const children = filterAndScore(node.children);
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
  const keyword = normalize(props.searchKey.trim());

  function filterAndScore(nodes) {
    let result = [];
    for (const node of nodes) {
      if (node.children && node.children.length) {
        const children = filterAndScore(node.children);
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

  let filtered = filterAndScore(treeData.value);

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
});

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
  findPaths(filteredTreeData.value, []);
  expandedKeys.value = [...newExpandedKeys];
}

watch(
  () => props.searchKey,
  (newSearchKey) => {
    updateExpandedKeysForSearch(newSearchKey);
  }
);

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
  padding-right: 62px;
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

.subscribed-tag {
  color: #1677ff;
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
</style>
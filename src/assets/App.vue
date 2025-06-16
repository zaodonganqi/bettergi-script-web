<template>
  <a-layout>
    <a-layout-content :style="{ padding: '20px 50px' }">
      <a-space direction="vertical" size="large" fill>
        <a-space>
          <a-select v-model="selectedRepo" placeholder="选择脚本仓库" style="width: 320px" @change="fetchRepoData">
            <a-option v-for="(repo, index) in repoOptions" :key="index" :value="repo.value">
              {{ repo.label }}
            </a-option>
          </a-select>
          <a-typography-text v-if="repoUpdateTime">
            更新时间：{{ repoUpdateTime }}
          </a-typography-text>
        </a-space>

        <a-tabs v-if="repoData.length">
          <a-tab-pane v-for="category in repoData" :key="category.name" :title="getCategoryDisplayName(category.name)">
            <a-row :gutter="16">
              <a-col :span="6" v-if="showTree(category)">
                <!-- 添加搜索框 -->
                <a-input-search v-model="treeSearchText" placeholder="搜索下方目录" style="margin-bottom: 8px;" allow-clear
                  @input="handleTreeSearch" @clear="handleTreeSearch" />
                <!-- 添加滚动容器 -->
                <div
                  style="height: calc(100vh - 200px); overflow-y: auto; overflow-x: hidden; border-right: 1px solid #e5e5e5;">
                  <a-tree :data="filteredTreeData[category.name] || getCategoryTree(category)"
                    :defaultExpandedKeys="getExpandedKeys(category)"
                    @select="(selectedKeys, event) => handleTreeSelect(selectedKeys, event, category.name)">
                    <template #extra="nodeData">
                      <a-button type="text" size="mini"
                        style="position: absolute; right: 8px; top: 6px; color: #3370ff;"
                        @click.stop="() => onTreeIconClick(nodeData)">
                        订阅
                      </a-button>
                    </template>
                  </a-tree>
                </div>
              </a-col>
              <a-col :span="showTree(category) ? 18 : 24">

                <a-space direction="vertical" size="medium" style="width: 100%;">
                  <a-row :gutter="16">
                    <a-col :span="6">
                      <a-input v-model="searchConditions[category.name].name" placeholder="搜索名称" allow-clear
                        @change="filterData(category.name)" />
                    </a-col>
                    <a-col :span="6">
                      <a-select v-model="searchConditions[category.name].author" placeholder="选择作者" style="width: 100%;"
                        allow-clear @change="filterData(category.name)">
                        <a-option v-for="author in getUniqueAuthors(category)" :key="author" :value="author">{{ author
                          }}</a-option>
                      </a-select>
                    </a-col>
                    <a-col :span="6">
                      <a-select v-model="searchConditions[category.name].tags" placeholder="选择标签" style="width: 100%;"
                        :filter-option="handleTagFilter" allow-clear @change="handleTagSelect(category.name)" multiple>
                        <a-option v-for="tag in getUniqueTags(category)" :key="tag" :value="tag">{{ tag }}</a-option>
                      </a-select>
                    </a-col>
                    <a-col :span="6">
                      <a-select v-model="searchConditions[category.name].etags" placeholder="排除标签" style="width: 100%;"
                        :filter-option="handleTagFilter" allow-clear @change="handleTagSelect(category.name)" multiple>
                        <a-option v-for="tag in getUniqueTags(category)" :key="tag" :value="tag">{{ tag }}</a-option>
                      </a-select>
                    </a-col>
                  </a-row>
                  <!-- 大盒子，整体高度 calc(100vh - 200px) -->
                  <div style="height: calc(100vh - 200px); display: flex; flex-direction: column; flex: 1">
                    <!-- 表格内容区域，占满剩余空间并启用滚动 -->
                    <div class="table-scroll-container" style="flex: 1; overflow-y: auto; overflow-x: hidden; padding-left: 16px;">
                      <!-- 表格内容 -->
                      <a-table :columns="columns" :data="filteredData[category.name].slice((currentPage - 1) * pageSize, currentPage*pageSize)" :pagination="false"
                        @page-size-change="handlePageSizeChange" :stickyHeader="true">
                        <template #name="{ record }">
                          <a-popover position="right" v-if="record.description" :content="record.description"
                            :mouseEnterDelay="0.5" :mouseLeaveDelay="0.2">
                            <span :ellipsis="{ rows: 1, showTooltip: false }">
                              {{ record.name }}
                            </span>
                          </a-popover>
                          <span v-else :ellipsis="{ rows: 1, showTooltip: true }">
                            {{ record.name }}
                          </span>
                        </template>
                        <template #tags="{ record }">
                          <a-space :style="{ flexWrap: 'wrap', rowGap: '8px' }">
                            <a-tag v-for="tag in record.tags" :key="tag" :color="getTagColor(tag)"
                              style="cursor: pointer" @click="handleTagClick(tag, category.name)" @contextmenu.prevent="handleTagRightClick(tag, category.name)">{{ tag }}</a-tag>
                          </a-space>
                        </template>
                        <template #operations="{ record }">
                          <a-space>
                            <a-button v-if="category.name !== 'pathing'" type="primary" size="mini"
                              @click="downloadScript(record)">
                              订阅
                            </a-button>
                            <a-button size="mini" @click="showDetails(record)">
                              详情
                            </a-button>
                          </a-space>
                        </template>
                      </a-table>
                    </div>

                    <!-- 分页器区域，固定在大盒子底部 -->
                    <div style="margin-top: 10px;">
                      <a-pagination v-model:current="currentPage" :total="filteredData[category.name]?.length"
                        :pageSize="pageSize" :show-page-size="true" @change="handlePageChange" @page-size-change="handlePageSizeChange"
                        style="display: flex; align-items: center; justify-content: flex-end;" />
                    </div>
                  </div>
                </a-space>
              </a-col>
            </a-row>
          </a-tab-pane>
        </a-tabs>

        <a-empty v-else description="请选择一个仓库" />
      </a-space>
    </a-layout-content>

    <a-drawer :visible="drawerVisible" @cancel="closeDrawer" @ok="closeDrawer" unmountOnClose :width="480">
      <template #title>
        脚本详情
      </template>
      <a-descriptions :data="drawerData" layout="vertical" bordered />
    </a-drawer>

    <!-- 添加加载模态框 -->
    <a-modal :visible="loading" :footer="false" :closable="false" :mask-closable="false" :unmount-on-close="true">
      <div style="text-align: center;">
        <a-spin size="large" />
        <p style="margin-top: 16px;">正在加载仓库数据...</p>
      </div>
    </a-modal>
  </a-layout>
</template>

<script setup>
import { ref, onMounted, reactive, computed, h } from 'vue';
import { Message, Popover, Typography } from '@arco-design/web-vue';
import { useClipboard } from '@vueuse/core';
import { match } from 'pinyin-pro';

// 添加环境变量的引用
const mode = import.meta.env.VITE_MODE;
// 添加新的环境变量引用
const hiddenTabs = import.meta.env.VITE_HIDDEN_TABS ? import.meta.env.VITE_HIDDEN_TABS.split(',') : [];

const baseRepo = "https://raw.githubusercontent.com/babalae/bettergi-scripts-list/refs/heads/main/repo.json";
const mirrorUrls = [
  "{0}",
  "https://hub.gitmirror.com/{0}",
  "https://ghproxy.cc/{0}",
  "https://www.ghproxy.cc/{0}",
  "https://ghproxy.cn/{0}",
  "https://ghproxy.net/{0}",
  "https://mirror.ghproxy.com/{0}"
];

const isPinyinMatch = (text, search) => {
  const searchLower = search.toLowerCase();
  const textLower = text.toLowerCase();

  if (textLower.includes(searchLower)) {
    return true;
  }

  const pinyinMatch = match(textLower, searchLower);
  return !!pinyinMatch
};

// 添加树搜索相关的响应式变量
const treeSearchText = ref('');
const filteredTreeData = reactive({});

// 添加树搜索处理函数
const handleTreeSearch = () => {
  repoData.value.forEach(category => {
    if (showTree(category)) {
      if (!treeSearchText.value) {
        filteredTreeData[category.name] = getCategoryTree(category);
      } else {
        const searchText = treeSearchText.value.toLowerCase();
        const originalTree = getCategoryTree(category);
        filteredTreeData[category.name] = filterTreeNodes(originalTree, searchText);
      }
    }
  });
};

// 添加树节点过滤函数
const filterTreeNodes = (nodes, searchText) => {
  return nodes.map(node => {
    const isSelfMatch = isPinyinMatch(node.title, searchText);
    
    if (isSelfMatch) {
      return { ...node };
    }

    const newNode = { ...node };
    if (newNode.children) {
      newNode.children = filterTreeNodes(newNode.children, searchText);
    }
    return (newNode.children?.length > 0) ? newNode : null;
  }).filter(Boolean);
};

// 修改 repoOptions 的定义

/* const repoOptions = computed(() => {
  if (mode === 'single') {
    return [{ label: "BetterGI 本地仓库", value: "local" }];
  } else {
    return mirrorUrls.map((url, index) => ({
      label: index === 0 ? "BetterGI 中央仓库" : `BetterGI 中央仓库 镜像 ${index}`,
      value: url.replace("{0}", baseRepo)
    }));
  }
}); */

const repoOptions = computed(() => {
  // 生成镜像选项列表
  const mirrorOptions = mirrorUrls.map((url, index) => ({
    label: index === 0 ? "BetterGI 中央仓库" : `镜像源 ${index}`,
    value: url.replace("{0}", baseRepo)
  }));

  // 本地模式追加镜像选项
  if (mode === 'single') {
    return [
      { label: "BetterGI 本地仓库", value: "local" },
      ...mirrorOptions.map(opt => ({
        ...opt,
        label: `在线仓库 ${opt.label}` // 添加前缀区分
      }))
    ];
  }

  return mirrorOptions;
});

const selectedRepo = ref('');
// 修改 repoData 的定义为 computed 属性
const repoData = computed(() => {
  return repoDataRaw.value.filter(category => !hiddenTabs.includes(category.name));
});
// 添加一个新的 ref 来存储原始数据
const repoDataRaw = ref([]);
const drawerVisible = ref(false);
const drawerData = ref([]);
const searchConditions = reactive({});
const filteredData = reactive({});

// 添加 loading 状态
const loading = ref(false);

// 添加新的响应式量
const repoUpdateTime = ref('');

const currentPage = ref(1);
const pageSize = ref(20);

const handlePageChange = (newPage) => {
  currentPage.value = newPage;

  const tableContainer = document.querySelector('.table-scroll-container');
  if (tableContainer) {
    tableContainer.scrollTop = 0;
  }
};

const handlePageSizeChange = (newPageSize) => {
  pageSize.value = newPageSize;
  currentPage.value = 1;

  const tableContainer = document.querySelector('.table-scroll-container');
  if (tableContainer) {
    tableContainer.scrollTop = 0;
  }
};

const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    slotName: 'name',
    ellipsis: true,
    tooltip: false // 关闭默认的 tooltip
  },
  { title: '作者', dataIndex: 'author', width: 200 },
  { title: '版本', dataIndex: 'version', width: 100 },
  { title: '标签', dataIndex: 'tags', slotName: 'tags' },
  { title: '最后更新', dataIndex: 'lastUpdated', width: 250 },
  { title: '操作', slotName: 'operations' },
];

const GetRepoDataFromLocal = async () => {
  const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
  const jsonString = await repoWebBridge.GetRepoJson();
  return JSON.parse(jsonString);
};

const fetchRepoData = async () => {
  if (!selectedRepo.value) return;

  loading.value = true;

  // 清空现有数据
  repoDataRaw.value = [];
  repoUpdateTime.value = '';
  treeSearchText.value = ''; // 清空树搜索文本
  Object.keys(searchConditions).forEach(key => {
    searchConditions[key] = {
      name: '',
      author: '',
      tags: [],
      etags: [],
      path: ''
    };
  });
  Object.keys(filteredData).forEach(key => {
    filteredData[key] = [];
  });

  try {
    let repoInfo;
    
    /* if (mode === 'single') {
      repoInfo = await GetRepoDataFromLocal();
    } else {
      const response = await fetch(selectedRepo.value);
      repoInfo = await response.json();
    } */

    if (mode === 'single') {
      if (selectedRepo.value === 'local') { // 根据选择的仓库判断
        repoInfo = await GetRepoDataFromLocal();
      } else {
        const response = await fetch(selectedRepo.value);
        repoInfo = await response.json();
      }
    } else {
      const response = await fetch(selectedRepo.value);
      repoInfo = await response.json();
    }

    // 从 indexes 中获取数据
    repoDataRaw.value = repoInfo.indexes;

    // 解析并设置更新时间
    if (repoInfo.time) {
      repoUpdateTime.value = formatDate(repoInfo.time);
    }

    // 为所有节点生成 path
    repoDataRaw.value.forEach(category => generatePaths(category));

    initializeSearchConditions();

    // 初始化 tagColorMap
    repoDataRaw.value.forEach(category => {
      traverseCategory(category, (item) => {
        if (Array.isArray(item.tags)) {
          item.tags.forEach(tag => {
            if (tag && typeof tag === 'string' && !tagColorMap[tag]) {
              tagColorMap[tag] = getRandomColor();
            }
          });
        }
      });
    });
  } catch (error) {
    Message.error('获取仓库数据失败，请尝试更换仓库');
    console.error('Error fetching repo data:', error);
  } finally {
    loading.value = false;
  }
};

// 新增函数：为所有节点生成 path
const generatePaths = (node, parentPath = '') => {
  const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
  node.path = currentPath;

  if (node.type === 'directory' && Array.isArray(node.children)) {
    node.children.forEach(child => generatePaths(child, currentPath));
  }
};

const traverseCategory = (category, callback) => {
  if (category.type === 'file') {
    callback(category);
  } else if (category.type === 'directory' && Array.isArray(category.children)) {
    if (category.name === 'js') {
      category.children.forEach(child => {
        if (child.type === 'directory') {
          // 处理 JS 脚本
          if (child.description && child.description.includes('~|~')) {
            const [nameSuffix, newDescription] = child.description.split('~|~');
            child.name = `${child.name} - ${nameSuffix.trim()}`;
            child.description = newDescription.trim();
          }
          callback(child);
        } else {
          traverseCategory(child, callback);
        }
      });
    } else {
      category.children.forEach(child => traverseCategory(child, callback));
    }
  }
};

const getUniqueAuthors = (category) => {
  const authors = new Set();
  traverseCategory(category, (item) => {
    if (item.author) authors.add(item.author);
  });
  return [...authors];
};

const getUniqueTags = (category) => {
  const tags = new Set();
  traverseCategory(category, (item) => {
    if (Array.isArray(item.tags)) {
      item.tags.forEach(tag => tags.add(tag));
    }
  });
  return [...tags];
};

const filterData = (categoryName) => {
  const category = repoDataRaw.value.find(cat => cat.name === categoryName);
  const condition = searchConditions[categoryName];

  const filtered = [];
  traverseCategory(category, (item) => {
    // 名称匹配：如果条件为空或项名称满足拼音匹配则认为匹配
    const nameMatch = !condition.name || isPinyinMatch(item.name, condition.name);
    // 作者匹配：如果条件为空或项作者与条件一致则认为匹配
    const authorMatch = !condition.author || item.author === condition.author;
    // 标签匹配：如果 condition.tags 为空或者 item.tags 包含条件中的所有标签，则认为匹配
    const tagMatch = condition.tags.length === 0 || (Array.isArray(item.tags) && condition.tags.every(tag => item.tags.includes(tag)));
    // 排除标签匹配：如果 condition.etags 有内容，则要求 item.tags 不包含其中任一标签
    const etagMatch = condition.etags.length === 0 || (Array.isArray(item.tags) && condition.etags.every(excludeTag => !item.tags.includes(excludeTag)));
    // 路径匹配：满足条件时 item.path 存在且以指定条件开头，但不完全等于该条件
    const pathMatch = !condition.path || (item.path && item.path.startsWith(condition.path) && item.path !== condition.path);

    // 当各条件均满足，且类型为 'file' 或（如果当前分类为 'js' 则允许 'directory'）时，将该项加入过滤结果
    if (nameMatch && authorMatch && tagMatch && etagMatch && pathMatch &&
        (item.type === 'file' || (category.name === 'js' && item.type === 'directory'))) {
      filtered.push(item);
    }
  });

  filteredData[categoryName] = filtered;
};


const initializeSearchConditions = () => {
  repoDataRaw.value.forEach(category => {
    searchConditions[category.name] = {
      name: '',
      author: '',
      tags: [],
      etags: [],
      path: ''
    };
    filteredData[category.name] = [];
    traverseCategory(category, (item) => {
      filteredData[category.name].push(item);
    });
  });
};

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const tagColorMap = reactive({});

const getTagColor = (tag) => {
  if (!tagColorMap[tag]) {
    tagColorMap[tag] = getRandomColor();
  }
  return tagColorMap[tag];
};

const { copy } = useClipboard();

const downloadScript = async (script) => {
  // 创建一个包含脚本路径的数组
  const subscriptionData = [script.path];

  // 将数组转换为 JSON 字串
  const jsonString = JSON.stringify(subscriptionData);
  const base64String = btoa(encodeURIComponent(jsonString));

  // 创建完整的 URL
  const fullUrl = `bettergi://script?import=${base64String}`;

  /* if (mode === 'single') {
    try {
      await subscribeToLocal(fullUrl);
      // Message.success(`已成功订阅 ${script.name}`);
    } catch (error) {
      console.error('订阅脚本失败:', error);
      Message.error(`订阅 ${script.name} 失败`);
    }
  } else {
    // 将完整的 URL 复制到剪贴板
    copy(fullUrl).then(() => {
      Message.success(`已将 ${script.name} 的订阅链接复制到剪贴板`);
    }).catch((error) => {
      console.error('复制到剪贴板失败:', error);
      Message.error(`复制 ${script.name} 的订阅链接失败`);
    });
  } */

  if (mode === 'single') {
    if (selectedRepo.value === 'local') {
      try {
        await subscribeToLocal(fullUrl);
      } catch (error) {
        console.error('订阅失败:', error);
        Message.error(`订阅失败: ${error.message}`);
      }
    } else {
      copy(fullUrl).then(() => {
        Message.success(`订阅链接已复制，回到地图追踪页面以继续导入`);
      }).catch((error) => {
        console.error('复制到剪贴板失败:', error);
        Message.error(`复制 ${script.name} 的订阅链接失败`);
      });
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

const showDetails = (script) => {
  drawerData.value = [
    { label: '名称', value: script.name },
    { label: '作者', value: script.author },
    { label: '版本', value: script.version },
    { label: '描述', value: script.description || '无描述' },
    { label: '标签', value: script.tags },
    { label: 'Hash', value: script.hash },
    { label: '最后更新', value: script.lastUpdated || '未知' },
  ];
  drawerVisible.value = true;
};

const closeDrawer = () => {
  drawerVisible.value = false;
};

const getCategoryTree = (category) => {
  const buildTree = (node, isRoot = false) => {
    if (node.type === 'file') {
      return null;
    }

    // 创建基本树节点
    const treeNode = {
      title: isRoot ? getCategoryDisplayName(node.name) : node.name,
      key: node.path,
      children: Array.isArray(node.children)
        ? node.children
          .map(child => buildTree(child, false))
          .filter(Boolean)
        : undefined,
      selectable: true
    };

    // 添加图标（仅网页端显示图标，逻辑有需要再修改）
    if (mode !== 'single') {
      treeNode.icon = () => h('img', {
        src: getIconUrl(node.name),
        style: {
          width: '22px',
          height: '22px',
        },
        onError: (e) => {
          e.target.style.display = 'none';
        }
      });
    }

    return treeNode;
  };

  return [buildTree(category, true)].filter(Boolean);
};

const showTree = (category) => {
  return category.name === 'pathing';
};

const handleTreeSelect = (selectedKeys, event, categoryName) => {
  const selectedNode = event.node;
  searchConditions[categoryName].path = selectedNode.key;
  filterData(categoryName);
};

const handleTagSelect = (categoryName) => {
  filterData(categoryName);
};

const handleTagClick = (tag, categoryName) => {
  if (!searchConditions[categoryName].tags.includes(tag)) {
    searchConditions[categoryName].tags.push(tag);
  } else {
    searchConditions[categoryName].tags = searchConditions[categoryName].tags.filter(t => t !== tag);
  }
  filterData(categoryName);
}

const handleTagRightClick = (tag, categoryName) => {
  if (!searchConditions[categoryName].etags.includes(tag)) {
    searchConditions[categoryName].etags.push(tag);
  } else {
    searchConditions[categoryName].etags = searchConditions[categoryName].etags.filter(t => t !== tag);
  }
  filterData(categoryName);
}

const handleTagFilter = (value, option) => {
  return isPinyinMatch(option.value, value);
};

// 添加类别名称映射
const categoryNameMap = {
  'pathing': '地图追踪',
  'js': 'JS脚本',
  'keymouse': '键鼠脚本',
  'combat': '战斗策略',
  'tcg': '七圣召唤',
  'onekey': '一键宏'
};

// 添加获取显示名称的函数
const getCategoryDisplayName = (name) => {
  return categoryNameMap[name] || name;
};

const onTreeIconClick = (nodeData) => {
  downloadScript({ name: nodeData.title, path: nodeData.key });
};

// 修改日期格式化函数
const formatDate = (timeString) => {
  if (typeof timeString !== 'string' || timeString.length !== 14) {
    return '无效的时间格式';
  }

  const year = timeString.slice(0, 4);
  const month = timeString.slice(4, 6);
  const day = timeString.slice(6, 8);
  const hours = timeString.slice(8, 10);
  const minutes = timeString.slice(10, 12);
  const seconds = timeString.slice(12, 14);

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 在 script setup 部分添加图标 URL 处理函数
const getIconUrl = (tag) => {
  const baseIconUrl = "https://raw.githubusercontent.com/babalae/bettergi-scripts-list/refs/heads/main/repo/pathing/";
  const encodedTag = encodeURIComponent(tag);
  const iconPath = `${baseIconUrl}${encodedTag}/icon.ico`;

  // 使用当前选中的镜像URL格式
  if (selectedRepo.value && selectedRepo.value !== 'local') {
    const mirrorFormat = selectedRepo.value.split(baseRepo)[0];
    return mirrorFormat + iconPath;
  }

  return iconPath;
};

// 添加一个新的函数来获取前两级节点的 keys
const getExpandedKeys = (category) => {
  const keys = [];

  // 添加根节点
  keys.push(category.path);

  // 添加第一级子节点
  // if (Array.isArray(category.children)) {
  //   category.children.forEach(child => {
  //     if (child.path) {
  //       keys.push(child.path);
  //     }
  //   });
  // }

  return keys;
};

onMounted(() => {
  // 默认选中第一个仓库
  if (repoOptions.value.length > 0) {
    selectedRepo.value = repoOptions.value[0].value;
    fetchRepoData();
  }
});
</script>

<style scoped>
.arco-tree {
  background-color: var(--color-fill-2);
  padding: 16px;
}

:deep(.arco-tree-node) {
  position: relative;
  padding-right: 80px !important; /* 给按钮留出空间 */
}

/* 添加图标相关样式 */
:deep(.arco-tree-node-title) {
  display: flex;
  align-items: center;
  width: calc(100% - 60px); /* 留出按钮空间 */
  min-width: 0; /* 允许文本截断 */
}

:deep(.arco-tree-node-title-text) {
  white-space: normal !important;
  word-break: break-word;
  line-height: 1.5;
  max-width: 100%;
  flex: 1;
  margin-right: 4px; /* 与按钮间距 */
}

:deep(.arco-tree-node-icon) {
  margin-right: 4px;
}

/* 移除之前为表格单元格添加的样式 */
.arco-table-td {
  max-width: none;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}

.footer {
  position: fixed;
}
</style>

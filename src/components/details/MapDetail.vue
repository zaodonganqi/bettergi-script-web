<template>
  <div class="map-detail">
    <template v-if="script">
      <div class="detail-content-wrapper">
        <div class="detail-header">
          <div class="header-left">
            <div class="detail-title">{{ script.title }}</div>
            <div class="detail-meta">
              <span v-if="script.type === 'directory' && script.authors">作者：{{ script.authors }}</span>
              <span v-else-if="script.author">作者：{{ script.author }}</span>
              <span v-else class="detail-author">暂无作者信息</span>
            </div>
            <div class="detail-time">{{ script.type === 'directory' && script.dirLastUpdated ? script.dirLastUpdated :
              script.time }}</div>
          </div>
          <div class="header-right">
            <a-button type="primary" @click="handleSubscribe">订阅</a-button>
          </div>
        </div>
        <div class="detail-tabs">
          <a-segmented v-model:value="activeTab" :options="tabOptions" size="large" class="detail-tab-btns" />
          <div v-if="isLoading" class="readme-loading-indicator">
            <a-spin size="small" />
            <span>正在加载readme文件</span>
          </div>
          <div v-else-if="loadError" class="readme-loading-indicator">
            <a-button type="text" size="small" @click="retryLoadReadme">
              <template #icon>
                <ReloadOutlined />
              </template>
            </a-button>
            <span>readme文件加载失败，请重试</span>
          </div>
        </div>
        <div class="tab-content-slider">
          <transition :name="tabTransitionName">
            <div :key="activeTab" class="tab-content-inner">
              <div v-if="activeTab === 'readme'" class="tab-pane readme-pane">
                <ReadmeViewer :path="script.path" :desc="script.desc" />
              </div>
              <div v-else class="tab-pane files-pane">
                <div class="table-pagination-outer" v-if="script.type === 'directory' && files && files.length > 0">
                  <div class="table-scroll-container" ref="tableScrollRef">
                    <a-table :columns="columns" :data-source="pagedData" row-key="hash" :bordered="true"
                      :pagination="false">
                      <template #bodyCell="{ column, record }">
                        <template v-if="column.dataIndex === 'name'">
                          <a-popover v-if="record.description" :content="record.description">
                            <span style="word-break: break-all; white-space: normal;">{{ record.name }}</span>
                          </a-popover>
                          <span v-else style="word-break: break-all; white-space: normal;">{{ record.name }}</span>
                        </template>
                        <template v-else-if="column.dataIndex === 'tags'">
                          <div class="tags-container">
                            <a-tag v-for="tag in record.tags" :key="tag" :color="getTagColor(tag)" class="tag-item">{{
                              tag }}</a-tag>
                          </div>
                        </template>
                        <template v-else-if="column.key === 'operations'">
                          <a-space>
                            <a-button type="primary" size="small" @click="downloadScript(record)">订阅</a-button>
                            <a-button size="small" @click="showDetails(record)">详情</a-button>
                          </a-space>
                        </template>
                        <template v-else>
                          {{ record[column.dataIndex] }}
                        </template>
                      </template>
                    </a-table>
                  </div>
                  <div class="custom-pagination">
                    <a-pagination :current="currentPage" :page-size="pageSize" :total="files.length"
                      @change="onPageChange" @showSizeChange="onPageSizeChange" :show-size-changer="true"
                      :page-size-options="['10', '20', '50', '100']" />
                  </div>
                </div>
                <div v-else class="no-files">暂无文件数据</div>
              </div>
            </div>
          </transition>
        </div>
        <!-- 详情弹窗 -->
        <a-modal v-model:open="modalOpen" title="文件详情" :footer="null" width="480" centered>
          <a-descriptions bordered size="small" :column="1">
            <a-descriptions-item label="名称">{{ modalRecord.name }}</a-descriptions-item>
            <a-descriptions-item label="作者">{{ modalRecord.author }}</a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-space>
                <a-tag v-for="tag in modalRecord.tags" :key="tag" :color="getTagColor(tag)">{{ tag }}</a-tag>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="更新时间">{{ modalRecord.lastUpdated }}</a-descriptions-item>
            <a-descriptions-item label="hash">{{ modalRecord.hash }}</a-descriptions-item>
            <a-descriptions-item label="描述">{{ modalRecord.description }}</a-descriptions-item>
            <a-descriptions-item label="版本">{{ modalRecord.version }}</a-descriptions-item>
            <a-descriptions-item label="路径">{{ modalRecord.path }}</a-descriptions-item>
          </a-descriptions>
        </a-modal>
      </div>
    </template>
    <template v-else>
      <div class="detail-empty">请选择左侧脚本查看详情</div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import 'highlight.js/styles/github.css';
import { useClipboard } from '@vueuse/core';
import { message as Message } from 'ant-design-vue';
import { Table as ATable, Tag as ATag, Popover as APopover, Space as ASpace, Button as AButton, Input as AInput, Spin as ASpin, Modal as AModal, Descriptions as ADescriptions, DescriptionsItem as ADescriptionsItem, Segmented as ASegmented } from 'ant-design-vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import ReadmeViewer from '../ReadmeViewer.vue';

const props = defineProps({
  script: {
    type: Object,
    default: null
  }
});

const mode = import.meta.env.VITE_MODE;
const isLoading = ref(false);
const loadError = ref(null);
const { copy } = useClipboard();

const currentPage = ref(1);
const pageSize = ref(10);
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return files.value.slice(start, start + pageSize.value);
});
const onPageChange = (page) => {
  currentPage.value = page;
};
const onPageSizeChange = (current, size) => {
  pageSize.value = size;
  currentPage.value = 1;
};

const tableScrollRef = ref(null);

const columns = [
  { title: '名称', dataIndex: 'name', width: '30%' },
  { title: '作者', dataIndex: 'author', width: '10%' },
  { title: '标签', dataIndex: 'tags', width: '24%' },
  { title: '更新时间', dataIndex: 'lastUpdated', width: '16%' },
  { title: '操作', key: 'operations', width: '20%' }
];

// tab切换，默认简介优先
const tabOptions = ref([
  { label: '简介', value: 'readme' },
  { label: '文件列表', value: 'files' }
]);
const activeTab = ref('readme');

// 预加载files数据
const files = ref([]);

// 详情弹窗
const modalOpen = ref(false);
const modalRecord = ref({});
function showDetails(record) {
  const fullPath = props.script && props.script.path ? 
    `${props.script.path}/${record.name}` : 
    record.path || record.name;
  
  modalRecord.value = { 
    ...record, 
    path: fullPath 
  };
  modalOpen.value = true;
}

// 重试加载readme
const retryLoadReadme = () => {
  if (props.script && props.script.path) {
    
  }
};

// 随机颜色缓存，保证同一tag颜色一致
const tagColorMap = ref({});
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
function getTagColor(tag) {
  if (!tagColorMap.value[tag]) {
    tagColorMap.value[tag] = getRandomColor();
  }
  return tagColorMap.value[tag];
}

// Removed md, originalLinkRender, getReadmeContent, fetchAndRenderReadme

const handleSubscribe = () => {
  if (props.script) {
    downloadScript({ name: props.script.title, path: props.script.path });
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

// tab切换动画
const tabTransitionName = computed(() => {
  return activeTab.value === 'readme' ? 'slide-right' : 'slide-left';
});

// 保证 watch 里每次切换 script 或 tab 时 fetch readme，并赋值文件列表
watch([
  () => props.script,
  () => activeTab.value
], async ([newScript, newTab]) => {
  if (newScript) {
    files.value = Array.isArray(newScript.files) ? newScript.files : [];
  } else {
    files.value = [];
  }
  if (newScript && newTab === 'readme' && newScript.path) {
    // Removed readme fetching logic
  }
}, { immediate: true });

</script>

<style scoped>
.map-detail {
  height: 100%;
  background: #fff;
  padding: 16px 30px 30px 30px;
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.detail-content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.detail-header {
  margin-bottom: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.header-right {
  display: flex;
  gap: 8px;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin-bottom: 4px;
  word-break: break-word;
}

.detail-meta {
  color: #888;
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 10px;
  word-break: break-word;
}

.detail-author {
  margin-right: 12px;
}

.detail-time {
  color: #aaa;
  font-size: 13px;
  margin-bottom: 10px;
  word-break: break-word;
}

.detail-tabs {
  margin: 12px 0 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 10px;
  margin-left: 5px;
  flex-shrink: 0;
}

.detail-tab-btns {
  flex-shrink: 0;
}

:deep(.ant-segmented-item-selected) {
  background: #1677ff;
  color: #fff;
}

.readme-loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.tab-content-slider {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  margin-right: 5px;
}

.tab-content-inner {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.tab-pane {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  padding-bottom: 5px;
  display: flex;
  flex-direction: column;
}

.readme-pane {
  overflow-y: auto;
  padding: 5px;
  margin-right: 40px;
  margin-bottom: 10px;
  max-width: 100%;
  overflow-x: hidden;
  position: relative;
}

.files-pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.no-files {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active {
  transition: all 0.3s cubic-bezier(.55,0,.1,1);
}
.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 1;
  z-index: 2;
}
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 1;
  z-index: 1;
}
.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 1;
  z-index: 2;
}
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 1;
  z-index: 1;
}

.detail-input-wrap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0 0 0 0;
  width: 100%;
  display: flex;
  align-items: center;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 10px 16px;
  box-shadow: 0 2px 8px #f2f3f5;
  z-index: 10;
}

.detail-input {
  flex: 1;
  margin-right: 10px;
  border-radius: 6px;
  height: 36px;
  font-size: 15px;
}

.detail-send {
  height: 36px;
  border-radius: 6px;
  font-size: 15px;
  background: #1677ff !important;
  border: none !important;
}

.detail-table-wrap {
  margin-bottom: 16px;
  /* 预留评论条空间，防止被遮挡 */
  padding-bottom: 80px;
}

:deep(.ant-table-thead > tr > th),
:deep(.ant-table-tbody > tr > td) {
  border: 1px solid #d9d9d9 !important;
  word-break: break-all;
  white-space: normal;
  text-align: left;
}

:deep(.ant-table-thead > tr > th) {
  background: #e6f4ff;
}

.comment-float-btn {
  position: fixed;
  right: 60px;
  bottom: 60px;
  z-index: 1001;
  box-shadow: 0 2px 8px #e6e6e6;
  padding: 0 22px 0 18px;
  height: 48px;
  border-radius: 24px;
  background: #e6f0ff;
  color: #1677ff;
  font-size: 18px;
  display: flex;
  align-items: center;
  border: none;
  transition: background 0.2s, color 0.2s;
}
.comment-float-btn:hover {
  background: #1677ff;
  color: #fff;
}
.comment-round-btn {
  border-radius: 24px !important;
}

.comment-modal-content {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
}

.detail-input {
  flex: 1;
  border-radius: 6px;
  height: 36px;
  font-size: 15px;
}

.detail-send {
  height: 36px;
  border-radius: 6px;
  font-size: 15px;
  background: #1677ff !important;
  border: none !important;
}

.table-pagination-outer {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  flex: 1;
}
.table-scroll-container {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}
.tag-item {
  margin-bottom: 3px;
  word-break: break-word;
  white-space: normal;
}
.custom-pagination {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: #fff;
  z-index: 10;
  margin-top: 10px;
  padding: 6px 12px 0 0;
}
.ant-table-cell {
  word-break: break-all !important;
  white-space: normal !important;
  vertical-align: top !important;
}
.ant-table-thead > tr > th {
  word-break: break-all !important;
  white-space: normal !important;
}
.detail-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #bbb;
  text-align: center;
  margin-top: 80px;
}
</style>
<template>
  <div class="map-detail">
    <template v-if="script">
      <div class="detail-content-wrapper">
        <div class="detail-header">
          <div class="header-left">
            <div class="detail-title">{{ script.title }}</div>
            <div class="detail-meta">
              <template v-if="script.authors && Array.isArray(script.authors) && script.authors.length">
                <span class="detail-author">
                  {{ $t('detail.author') }}：
                  <template v-for="(author, idx) in script.authors" :key="author.name">
                    <template v-if="author.link">
                      <a :href="author.link" class="author-link" target="_blank" rel="noopener noreferrer">{{
                        author.name }}</a>
                    </template>
                    <template v-else>
                      <span>{{ author.name }}</span>
                    </template>
                    <span v-if="idx < script.authors.length - 1">{{ $t('common.comma') }}</span>
                  </template>
                </span>
              </template>
              <span v-else class="detail-author">{{ $t('detail.noAuthor') }}</span>
            </div>
            <div class="detail-time">{{ script.type === 'directory' && script.lastUpdated ? script.lastUpdated :
              script.time
            }}</div>
          </div>
          <div class="header-right" style="display: flex; align-items: center; gap: 8px;">
            <a-button type="primary" v-if="!script.isSubscribed" @click="handleSubscribe(script)">{{ $t('detail.subscribe') }}</a-button>
            <a-button type="primary" v-if="script.isSubscribed" :disabled="script.isSubscribed"
              class="subscribed-btn">{{ $t('detail.subscribed') }}</a-button>
            <a-button type="primary" v-if="script.isSubscribed" @click="handleSubscribe(script)">{{ $t('detail.subscribeAgain') }}</a-button>
          </div>
        </div>
        <div class="detail-tabs">
          <a-segmented v-model:value="activeTab" :options="tabOptions" size="large" class="detail-tab-btns" />
          <div v-if="isLoadingReadme" class="readme-loading-indicator">
            <a-spin size="small" />
            <span>{{ $t('detail.loadingReadme') }}</span>
          </div>
          <div v-else-if="loadError" class="readme-loading-indicator">
            <a-button type="text" size="small" @click="retryLoadReadme">
              <template #icon>
                <ReloadOutlined />
              </template>
            </a-button>
            <span>{{ $t('detail.readmeFailed') }}</span>
          </div>
        </div>
        <div class="tab-content-slider">
          <transition :name="tabTransitionName">
            <div :key="activeTab" class="tab-content-inner">
              <div v-if="activeTab === 'readme'" class="tab-pane readme-pane">
                <ReadmeViewer :key="readmeKey" :path="script.path" :desc="script.desc" @loaded="handleReadmeLoaded"
                  @error="handleReadmeError" @hasContent="handleReadmeHasContent" />
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
                          <a-space size="small" wrap>
                            <a-button class="subscribe-btn-bordered" type="default" size="small"
                              :disabled="record.isSubscribed && !record._hover"
                              @mouseenter="onSubscribeBtnHover(record)" @mouseleave="onSubscribeBtnLeave(record)"
                              @click="handleSubscribe(record)">
                              <template v-if="record.isSubscribed">
                                <span v-if="!record._hover">{{ $t('detail.subscribed') }}</span>
                                <span v-else class="subscribe-btn-hover">{{ $t('detail.subscribeAgain') }}</span>
                              </template>
                              <template v-else>
                                {{ $t('detail.subscribe') }}
                              </template>
                            </a-button>
                            <a-button class="more-detail" size="small" @click="showDetails(record)">{{ $t('detail.showDetails') }}</a-button>
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
                <div v-else class="no-files">{{ $t('detail.noFiles') }}</div>
              </div>
            </div>
          </transition>
        </div>
        <!-- 详情弹窗 -->
        <a-modal v-model:open="modalOpen" :title="$t('detail.modalTitle')" :footer="null" width="480" centered>
          <a-descriptions bordered size="small" :column="1">
            <a-descriptions-item :label="$t('detail.name')">{{ modalRecord.name }}</a-descriptions-item>
            <a-descriptions-item :label="$t('detail.author')">{{ modalRecord.author }}</a-descriptions-item>
            <a-descriptions-item :label="$t('detail.tags')">
              <a-space>
                <a-tag v-for="tag in modalRecord.tags" :key="tag" :color="getTagColor(tag)">{{ tag }}</a-tag>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item :label="$t('detail.lastUpdated')">{{ modalRecord.lastUpdated }}</a-descriptions-item>
            <a-descriptions-item :label="$t('detail.hash')">{{ modalRecord.hash }}</a-descriptions-item>
            <a-descriptions-item :label="$t('detail.description')">{{ modalRecord.description }}</a-descriptions-item>
            <a-descriptions-item :label="$t('detail.version')">{{ modalRecord.version }}</a-descriptions-item>
            <a-descriptions-item :label="$t('detail.path')">{{ modalRecord.path }}</a-descriptions-item>
          </a-descriptions>
        </a-modal>
      </div>
    </template>
    <template v-else>
      <div class="detail-empty">{{ $t('detail.empty') }}</div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { message as Message } from 'ant-design-vue';
import { Table as ATable, Tag as ATag, Popover as APopover, Space as ASpace, Modal as AModal, Descriptions as ADescriptions, DescriptionsItem as ADescriptionsItem, Segmented as ASegmented, Spin as ASpin } from 'ant-design-vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import ReadmeViewer from '../ReadmeViewer.vue';
import { useClipboard } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
const { t: $t } = useI18n();

const props = defineProps({
  script: {
    type: Object,
    default: null
  },
  startPollingUserConfig: Function
});

const mode = import.meta.env.VITE_MODE;
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

const columns = computed(() => {
  if (mode === 'single') {
    return [
      { title: $t('detail.name'), dataIndex: 'name', width: '30%' },
      { title: $t('detail.scriptAuthor'), dataIndex: 'author', width: '13%' },
      { title: $t('detail.tags'), dataIndex: 'tags', width: '24%' },
      { title: $t('detail.lastUpdated'), dataIndex: 'lastUpdated', width: '16%' },
      { title: $t('detail.operations'), key: 'operations', width: '17%' }
    ]
  } else {
    return [
      { title: $t('detail.name'), dataIndex: 'name', width: '30%' },
      { title: $t('detail.scriptAuthor'), dataIndex: 'author', width: '10%' },
      { title: $t('detail.tags'), dataIndex: 'tags', width: '24%' },
      { title: $t('detail.lastUpdated'), dataIndex: 'lastUpdated', width: '16%' },
      { title: $t('detail.operations'), key: 'operations', width: '20%' }
    ]
  }
});

// tab切换选项
const tabOptions = ref([
  { label: $t('detail.tabReadme'), value: 'readme' },
  { label: $t('detail.tabFiles'), value: 'files' }
]);
const activeTab = ref('readme');

// 文件数据
const files = ref([]);

// readme加载状态
const isLoadingReadme = ref(false);
const loadError = ref(false);
const readmeKey = ref(0);
const hasReadmeContent = ref(false);

const handleReadmeLoaded = (payload) => {
  isLoadingReadme.value = false;
  loadError.value = false;
  if (payload && payload.status === '404' && props.script && props.script.path) {
    setReadme404(props.script.path);
  } else if (payload && payload.status === 'error') {
    loadError.value = true;
  }
};

// 记录404
function setReadme404(path) {
  if (path) {
    localStorage.setItem('readme404:' + path, '1');
  }
}

function isReadme404(path) {
  return !!localStorage.getItem('readme404:' + path);
}

const handleReadmeError = (error) => {
  console.log(error);
  isLoadingReadme.value = false;
  loadError.value = true;
  hasReadmeContent.value = false;
  updateTabLabel();
  let is404 = false;
  if (typeof error === 'string' && error.includes('404')) is404 = true;
  if (error && typeof error === 'object') {
    if (error.status === 404) is404 = true;
    if (error.message && error.message.includes('404')) is404 = true;
  }
  if (props.script && props.script.path && is404) {
    setReadme404(props.script.path);
  }
};

const handleReadmeHasContent = (hasContent) => {
  hasReadmeContent.value = hasContent;
  updateTabLabel();
};

const updateTabLabel = () => {
  const readmeOption = tabOptions.value.find(option => option.value === 'readme');
  if (readmeOption) {
    readmeOption.label = hasReadmeContent.value ? 'README' : $t('detail.tabReadme');
  }
};

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

const handleSubscribe = (item) => {
  if (item.path) {
    downloadScript(item);
    if (typeof props.startPollingUserConfig === 'function') {
      props.startPollingUserConfig();
    }
  }
};

const downloadScript = async (script) => {
  let scriptPath = script.path;
  if (!scriptPath && script.type === 'file' && props.script && props.script.path) {
    scriptPath = `${props.script.path}/${script.name}`;
  }
  // 创建一个包含脚本路径的数组
  const subscriptionData = [scriptPath];

  // 将数组转换为 JSON 字串
  const jsonString = JSON.stringify(subscriptionData);
  const base64String = btoa(encodeURIComponent(jsonString));

  const fullUrl = `bettergi://script?import=${base64String}`;

  if (mode === 'single') {
    try {
      await subscribeToLocal(fullUrl);
    } catch (error) {
      console.error('Subscribe failed:', error);
      Message.error($t('detail.subscribeFailedWithMsg', { msg: error.message }));
    }
  } else {
    copy(fullUrl).then(() => {
      Message.success($t('detail.subscribeSuccess', { name: script.name }));
    }).catch((error) => {
      console.error('Copy to clipboard failed:', error);
      Message.error($t('detail.copyFailed', { name: script.name }));
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

// 切换节点时重置 tab
watch(() => props.script, (newScript) => {
  if (newScript) {
    activeTab.value = 'readme';
  }
});

// 每次切换 script时 fetch readme，并赋值文件列表
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
    if (isReadme404(newScript.path)) {
      // 已知404，不再加载
      isLoadingReadme.value = false;
      loadError.value = false;
      hasReadmeContent.value = false;
      updateTabLabel();
      return;
    }
    // 未知404，正常加载
    hasReadmeContent.value = false;
    updateTabLabel();
    isLoadingReadme.value = true;
    loadError.value = false;
    readmeKey.value++;
  }
  if (newTab !== 'readme') {
    isLoadingReadme.value = false;
    loadError.value = false;
  }
});

const retryLoadReadme = () => {
  isLoadingReadme.value = true;
  loadError.value = false;
  hasReadmeContent.value = false;
  updateTabLabel();
  readmeKey.value++;
};

function onSubscribeBtnHover(node) {
  node._hover = true;
}
function onSubscribeBtnLeave(node) {
  node._hover = false;
}

</script>

<style scoped>
.map-detail {
  height: 100%;
  background: #fff;
  position: relative;
  padding: 16px 10px 16px 10px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.detail-content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.detail-header {
  margin-bottom: 8px;
  padding: 0px 26px 2px 26px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-left {
  flex: 1;
  min-width: 0;
  margin-right: 5px;
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
  padding: 0px 10px 0px 10px;
  flex-shrink: 0;
}

.detail-tab-btns {
  flex-shrink: 0;
  position: relative;
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
  margin-left: auto;
}

.tab-content-slider {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  padding: 0px 16px 0px 10px;
}

.tab-content-inner {
  width: 100%;
  height: 100%;
  position: absolute;
  padding: 0px 0px 0px 10px;
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

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(.55, 0, .1, 1);
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
  padding-bottom: 80px;
}

:deep(.ant-table-thead > tr > th),
:deep(.ant-table-tbody > tr > td) {
  border: 1px solid #c5c5c5 !important;
  word-break: break-all;
  white-space: normal;
  text-align: left;
}

:deep(.ant-table-thead > tr > th) {
  background: #f2f3f5;
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

.ant-table-thead>tr>th {
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

.author-link {
  text-decoration: underline;
  color: #1890ff;
  cursor: pointer;
}

.a-button[disabled],
.subscribe-btn[disabled] {
  background: #f6ffed !important;
  color: #1677ff !important;
  border-color: #1677ff !important;
  cursor: default !important;
}

:deep(.ant-table-cell.operations-cell) {
  white-space: nowrap;
}

.subscribe-btn {
  color: #1677ff;
  background: none;
  border: none;
  width: 72px;
  text-align: center;
}

.subscribe-btn[disabled] {
  color: #1677ff !important;
}

.subscribe-btn-hover {
  color: #1677ff;
}

.subscribed-btn {
  background: #fff;
  color: #1677ff;
  border-color: #1677ff;
}

.subscribe-btn-bordered {
  color: #1677ff;
  border: 1px solid #1677ff;
  background: #fff;
  width: 72px;
  text-align: center;
}

.subscribe-btn-bordered[disabled] {
  color: #1677ff !important;
  border-color: #1677ff !important;
  background: #fff !important;
}

.more-detail {
  width: 72px;
}
</style>
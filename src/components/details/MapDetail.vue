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
                  {{ $t('detail.author') }}
                  <template v-for="(author, idx) in script.authors" :key="author.name">
                    <template v-if="author.link">
                      <a :href="author.link" class="author-link" target="_blank" rel="noopener noreferrer">
                        {{ author.name }}
                      </a>
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
            <div class="detail-time">
              {{ script.lastUpdated }}
            </div>
          </div>
          <div class="header-right">
            <a-button type="primary" @click="jumpToGitHub(script)">
              {{ $t('action.jumpToGitHub') }}
            </a-button>
            <a-button type="primary" @click="mainStore.showCommentModal = true">
              {{ $t('action.comment') }}
            </a-button>
            <a-button type="primary" v-if="!script.isSubscribed" @click="handleSubscribe(script)">
              {{ $t('detail.subscribe') }}
            </a-button>
            <a-button type="primary" v-if="script.isSubscribed" @click="handleSubscribe(script)">
              {{ $t('detail.subscribeAgain') }}
            </a-button>
          </div>
        </div>
        <div class="detail-tabs">
          <a-segmented v-model:value="activeTab" :options="tabOptions" size="large" class="detail-tab-btns"/>
          <div v-if="isLoadingReadme" class="readme-loading-indicator">
            <a-spin size="small"/>
            <span>{{ $t('detail.loadingReadme') }}</span>
          </div>
          <div v-else-if="loadError" class="readme-loading-indicator">
            <a-button type="text" size="small" @click="retryLoadReadme">
              <template #icon>
                <ReloadOutlined/>
              </template>
            </a-button>
            <span>{{ $t('detail.readmeFailed') }}</span>
          </div>
        </div>
        <div class="tab-content-slider">
          <transition :name="tabTransitionName" mode="out-in">
            <div :key="activeTab" class="tab-content-inner">
              <div v-if="activeTab === 'readme'" class="tab-pane readme-pane">
                <div v-if="script && script.desc && script.desc.trim()" class="desc-block">
                  <div class="desc-title">{{ $t('detail.desc') }}</div>
                  <div class="desc-content">{{ script.desc }}</div>
                </div>
                <ReadmeViewer :key="readmeKey" :path="script.path" :desc="null" :showDescTitle="false"
                              :showNoDesc="true" @loaded="handleReadmeLoaded"
                              @error="handleReadmeError" @hasContent="handleReadmeHasContent"/>
              </div>
              <div v-else class="tab-pane files-pane">
                <div class="table-pagination-outer" v-if="script.type === 'directory' && files && files.length > 0">
                  <div class="table-scroll-container">
                    <a-table :columns="columns" :data-source="pagedData" row-key="hash" :bordered="true"
                             :pagination="false" :sticky="true" @change="onTableChange">
                      <template #bodyCell="{ column, record }">
                        <template v-if="column.dataIndex === 'name'">
                          <a-popover v-if="record.description" :content="record.description">
                            <span style="word-break: break-all; white-space: normal;" v-html="hl(record.name)"></span>
                          </a-popover>
                          <span v-else style="word-break: break-all; white-space: normal;" v-html="hl(record.name)"></span>
                        </template>
                        <template v-else-if="column.dataIndex === 'authors'">
                          <span v-html="hl(Array.isArray(record.authors)
                            ? record.authors.map(a => (typeof a === 'string' ? a : a && a.name)).filter(Boolean).join($t('common.comma'))
                            : (record.authors || ''))"></span>
                        </template>
                        <template v-else-if="column.dataIndex === 'tags'">
                          <div class="tags-container">
                            <a-tag v-for="tag in record.tags" :key="tag" :color="getTagColor(tag)" class="tag-item">
                              <span v-html="hl(tag)"></span>
                            </a-tag>
                          </div>
                        </template>
                        <template v-else-if="column.key === 'operations'">
                          <a-space size="small" wrap>
                            <a-button class="subscribe-btn-bordered" type="default" size="small"
                                      :disabled="record.isSubscribed && !record._hover"
                                      @mouseenter="onSubscribeBtnHover(record)"
                                      @mouseleave="onSubscribeBtnLeave(record)"
                                      @click="handleSubscribe(record)">
                              <template v-if="record.isSubscribed">
                                <span v-if="!record._hover">{{ $t('detail.subscribed') }}</span>
                                <span v-else >{{ $t('detail.subscribeAgain') }}</span>
                              </template>
                              <template v-else>
                                {{ $t('detail.subscribe') }}
                              </template>
                            </a-button>
                            <a-button class="more-detail" size="small" @click="showDetails(record)">
                              {{ $t('detail.showDetails') }}
                            </a-button>
                          </a-space>
                        </template>
                        <template v-else>
                          {{ record[column.dataIndex] }}
                        </template>
                      </template>
                    </a-table>
                  </div>
                  <div class="custom-pagination">
                    <a-pagination :current="currentPage" :page-size="pageSize" :total="filteredSortedData.length"
                                  @change="onPageChange" @showSizeChange="onPageSizeChange" :show-size-changer="true"
                                  :page-size-options="['10', '20', '50', '100']"/>
                  </div>
                </div>
                <div v-else class="no-files">{{ $t('detail.noFiles') }}</div>
              </div>
            </div>
          </transition>
        </div>

        <!-- 评论弹窗-->
        <Comment />

        <!-- 详情弹窗 -->
        <a-modal v-model:open="modalOpen" :title="$t('detail.modalTitle')" :footer="null" width="480" centered>
          <a-descriptions bordered size="small" :column="1">
            <a-descriptions-item :label="$t('detail.name')"><span v-html="hl(modalRecord.name)"></span></a-descriptions-item>
            <a-descriptions-item :label="$t('detail.scriptAuthor')">
              <template v-if="Array.isArray(modalRecord.authors)">
                <span v-html="hl(modalRecord.authors.map(a => a.name || a).join($t('common.comma')))"></span>
              </template>
              <template v-else>
                {{ modalRecord.authors || $t('detail.noAuthor') }}
              </template>
            </a-descriptions-item>
            <a-descriptions-item :label="$t('detail.tags')">
              <a-space>
                <a-tag v-for="tag in modalRecord.tags" :key="tag" :color="getTagColor(tag)"><span v-html="hl(tag)"></span></a-tag>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item :label="$t('detail.lastUpdated')">{{ modalRecord.lastUpdated }}</a-descriptions-item>
            <a-descriptions-item :label="$t('detail.description')"><span v-html="hl(modalRecord.description)"></span></a-descriptions-item>
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
import {ref, watch, computed} from 'vue';
import {message as Message} from 'ant-design-vue';
import {
  Table as ATable,
  Tag as ATag,
  Popover as APopover,
  Space as ASpace,
  Modal as AModal,
  Descriptions as ADescriptions,
  DescriptionsItem as ADescriptionsItem,
  Segmented as ASegmented,
  Spin as ASpin
} from 'ant-design-vue';
import {ReloadOutlined} from '@ant-design/icons-vue';
import ReadmeViewer from '../items/ReadmeViewer.vue';
import {useClipboard} from '@vueuse/core';
import { subscribePaths } from '@/utils/subscription';
import {useI18n} from 'vue-i18n';
import {jumpToGitHub} from "@/utils/actions.js";
import Comment from "@/components/items/Comment.vue";
import {useMainStore} from "@/stores/mainStore.js";
import { highlightText } from '@/utils/highlight.js';

const {t: $t, locale} = useI18n();

// 获取script数据
const script = computed(() => mainStore.selectedScript);

const mainStore = useMainStore();
const {copy} = useClipboard();
const hl = (text) => highlightText(text, mainStore.search?.trim());
const currentPage = ref(1);
const pageSize = ref(10);

// 筛选与排序状态
const columnFilters = ref({
  authors: [],
  tags: []
});
const currentSorter = ref({
  field: null,
  order: null
});

// 筛选排序的结果
const filteredSortedData = computed(() => {
  let data = Array.isArray(files.value) ? files.value.slice() : [];

  // 作者筛选
  const authors = columnFilters.value.authors || [];
  if (authors.length > 0) {
    data = data.filter(item => {
      const itemAuthors = Array.isArray(item.authors)
        ? item.authors.map(a => (typeof a === 'string' ? a : a && a.name).trim()).filter(Boolean)
        : (item.authors ? [String(item.authors)] : []);
      return itemAuthors.some(name => authors.includes(name));
    });
  }

  // 标签筛选
  const tags = columnFilters.value.tags || [];
  if (tags.length > 0) {
    data = data.filter(item => Array.isArray(item.tags) && item.tags.some(tag => tags.includes(tag)));
  }

  // 排序
  if (currentSorter.value && currentSorter.value.field === 'lastUpdated' && currentSorter.value.order) {
    const direction = currentSorter.value.order === 'ascend' ? 1 : -1;
    data.sort((a, b) => (new Date(a.lastUpdated) - new Date(b.lastUpdated)) * direction);
  }

  return data;
});

// 分页
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredSortedData.value.slice(start, start + pageSize.value);
});

const onPageChange = (page) => {
  currentPage.value = page;
};

const onPageSizeChange = (current, size) => {
  pageSize.value = size;
  currentPage.value = 1;
};

// 表格筛选/排序
const onTableChange = (pagination, filters, sorter) => {
  // 筛选
  columnFilters.value = {
    authors: (filters && (filters.authors || filters['authors'])) || [],
    tags: (filters && (filters.tags || filters['tags'])) || []
  };

  // 排序
  if (Array.isArray(sorter)) {
    const s = sorter.find(s => s.field === 'lastUpdated');
    currentSorter.value = s ? {field: s.field, order: s.order} : {field: null, order: null};
  } else if (sorter && sorter.field) {
    currentSorter.value = {field: sorter.field, order: sorter.order};
  } else {
    currentSorter.value = {field: null, order: null};
  }

  // 变更后回到第一页
  currentPage.value = 1;
};

const columns = computed(() => {
  if (mainStore.isModeSingle) {
    return [
      {
        title: $t('detail.name'),
        dataIndex: 'name',
        width: '30%'},
      {
        title: $t('detail.scriptAuthor'),
        dataIndex: 'authors',
        width: '13%',
        onFilter: (value, record) => {
          const itemAuthors = Array.isArray(record.authors)
            ? record.authors.map(a => (typeof a === 'string' ? a : a && a.name).trim()).filter(Boolean)
            : (record.authors ? [String(record.authors)] : []);
          return itemAuthors.includes(value);
        },
        filters: buildAuthorFilters(files.value),
        filterSearch: true,
        filterMultiple: true,
        filteredValue: columnFilters.value.authors
      },
      {
        title: $t('detail.tags'),
        dataIndex: 'tags',
        width: '24%',
        onFilter: (value, record) => record.tags && record.tags.includes(value),
        filters: buildTagFilters(files.value),
        filterSearch: true,
        filterMultiple: true,
        filteredValue: columnFilters.value.tags
      },
      {
        title: $t('detail.lastUpdated'),
        dataIndex: 'lastUpdated',
        width: '16%',
        sorter: (a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated),
        sortOrder: currentSorter.value.field === 'lastUpdated' ? currentSorter.value.order : null
      },
      {
        title: $t('detail.operations'),
        key: 'operations',
        width: '17%'}
    ]
  } else {
    return [
      {
        title: $t('detail.name'),
        dataIndex: 'name',
        width: '30%'},
      {
        title: $t('detail.scriptAuthor'),
        dataIndex: 'authors',
        width: '10%',
        onFilter: (value, record) => {
          const itemAuthors = Array.isArray(record.authors)
            ? record.authors.map(a => (typeof a === 'string' ? a : a && a.name).trim()).filter(Boolean)
            : (record.authors ? [String(record.authors)] : []);
          return itemAuthors.includes(value);
        },
        filters: buildAuthorFilters(files.value),
        filterSearch: true,
        filterMultiple: true,
        filteredValue: columnFilters.value.authors
      },
      {
        title: $t('detail.tags'),
        dataIndex: 'tags',
        width: '24%',
        onFilter: (value, record) => record.tags && record.tags.includes(value),
        filters: buildTagFilters(files.value),
        filterSearch: true,
        filterMultiple: true,
        filteredValue: columnFilters.value.tags
      },
      {
        title: $t('detail.lastUpdated'),
        dataIndex: 'lastUpdated',
        width: '16%',
        sorter: (a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated),
        sortOrder: currentSorter.value.field === 'lastUpdated' ? currentSorter.value.order : null
      },
      {
        title: $t('detail.operations'),
        key: 'operations',
        width: '20%'}
    ]
  }
});

// tab切换选项
function isReadme404(path) {
  return !!localStorage.getItem('readme404:' + path);
}

const tabOptions = computed(() => [
  {
    label: (isReadme404(script.value?.path) || !hasReadmeContent.value)
        ? $t('detail.tabReadme')
        : 'README',
    value: 'readme'
  },
  {label: $t('detail.tabFiles'), value: 'files'}
]);
const activeTab = ref('readme');

// 文件数据
const files = ref([]);

// readme加载状态
const isLoadingReadme = ref(false);
const loadError = ref(false);
const readmeKey = ref(0);
const hasReadmeContent = ref(false);
const hasAutoSwitched = ref(false); // 标记是否已经自动切换过

const handleReadmeLoaded = (payload) => {
  isLoadingReadme.value = false;
  loadError.value = false;
  if (payload && payload.status === '404' && script.value && script.value.path) {
    setReadme404(script.value.path);
    // README为404时检查是否需要自动切换
    checkAndSwitchToFiles();
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

const handleReadmeError = (error) => {
  console.log(error);
  isLoadingReadme.value = false;
  loadError.value = true;
  hasReadmeContent.value = false;
  let is404 = false;
  if (typeof error === 'string' && error.includes('404')) is404 = true;
  if (error && typeof error === 'object') {
    if (error.status === 404) is404 = true;
    if (error.message && error.message.includes('404')) is404 = true;
  }
  if (script.value && script.value.path && is404) {
    setReadme404(script.value.path);
    // README为404时检查是否需要自动切换
    checkAndSwitchToFiles();
  }
};

const handleReadmeHasContent = (hasContent) => {
  hasReadmeContent.value = hasContent;
};

// 检查是否需要自动切换到文件列表
const checkAndSwitchToFiles = () => {
  if (script.value && script.value.path && activeTab.value === 'readme' && !hasAutoSwitched.value) {
    const is404 = isReadme404(script.value.path);
    const hasDesc = script.value.desc && script.value.desc.trim() !== '';

    if (!hasDesc && is404 && !hasReadmeContent.value && files.value.length > 0) {
      activeTab.value = 'files';
      hasAutoSwitched.value = true;
    }
  }
};


// 详情弹窗
const modalOpen = ref(false);
const modalRecord = ref({});

function showDetails(record) {
  const fullPath = record.path || record.name;

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

// 作者筛选项
function buildAuthorFilters(fileList) {
  const names = (Array.isArray(fileList) ? fileList : [])
    .flatMap(f => Array.isArray(f.authors)
      ? f.authors.map(a => (typeof a === 'string' ? a : a && a.name)).filter(Boolean)
      : (f && f.authors ? [String(f.authors)] : [])
    );
  const unique = Array.from(new Set(names)).sort((a, b) => String(a).localeCompare(String(b)));
  return unique.map(name => ({ text: name, value: name }));
}

// tag筛选项
function buildTagFilters(fileList) {
  const tags = fileList.flatMap(f => f.tags || []).filter(Boolean);
  const uniqueTags = Array.from(new Set(tags)).sort((a, b) => String(a).localeCompare(String(b)));
  return uniqueTags.map(tag => ({text: tag, value: tag}));
}

const handleSubscribe = async (item) => {
  if (!item.path) return;
  try {
    const result = await subscribePaths([item.path]);
    if (result.needsCopy) {
      await copy(result.url);
      Message.success($t('detail.subscribeSuccess', {name: item.name}));
    } else {
      mainStore.startPollingUserConfig();
    }
  } catch (error) {
    console.error('Subscribe failed:', error);
    Message.error($t('detail.subscribeFailedWithMsg', {msg: error.message}));
  }
};

// tab切换动画
const tabTransitionName = computed(() => {
  return activeTab.value === 'readme' ? 'slide-right' : 'slide-left';
});

// 切换节点时重置 tab
watch(() => script.value, (newScript) => {
  if (newScript) {
    activeTab.value = 'readme';
    hasAutoSwitched.value = false; // 重置自动切换标记
    // 重置分页器状态
    currentPage.value = 1;
    pageSize.value = 10;
    // 重置筛选与排序
    columnFilters.value = {authors: [], tags: []};
    currentSorter.value = {field: null, order: null};
    files.value = Array.isArray(newScript.files) ? newScript.files : [];
    // 只有script变化时才重置和加载README
    if (newScript.path) {
      if (isReadme404(newScript.path)) {
        isLoadingReadme.value = false;
        loadError.value = false;
        hasReadmeContent.value = false;
        // 如果README已知为404，立即检查是否需要切换
        checkAndSwitchToFiles();
      } else {
        hasReadmeContent.value = false;
        isLoadingReadme.value = true;
        loadError.value = false;
        readmeKey.value++;
      }
    }
  } else {
    files.value = [];
    currentPage.value = 1;
    pageSize.value = 10;
  }
});

// tab切换时只控制loading和error，不影响README内容
watch(() => activeTab.value, (newTab) => {
  if (newTab !== 'readme') {
    isLoadingReadme.value = false;
    loadError.value = false;
    // 不重置hasReadmeContent
  }
});

watch(locale, () => {
  isLoadingReadme.value = false;
  loadError.value = false;
});

const retryLoadReadme = () => {
  isLoadingReadme.value = true;
  loadError.value = false;
  hasReadmeContent.value = false;
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
.map-detail :deep(mark) {
  background: yellow;
  color: black;
  padding: 0;
  border-radius: 2px;
}
.map-detail {
  height: 100%;
  background: var(--bg-container);
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
  padding: 0 26px 2px 26px;
  border-bottom: 1px solid var(--border-base);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-left {
  flex: 1;
  min-width: 0;
  padding-right: 30px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
  word-break: break-word;
}

.detail-meta {
  color: var(--text-base3);
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 10px;
  word-break: break-word;
}

.detail-author {
  margin-right: 12px;
  color: var(--text-base2);
}

.detail-time {
  color: var(--text-base3);
  font-size: 13px;
  margin-bottom: 10px;
  word-break: break-word;
}

.detail-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2px;
  margin-bottom: 10px;
  margin-left: 5px;
  padding: 0 10px 0 10px;
  flex-shrink: 0;
}

.detail-tab-btns {
  flex-shrink: 0;
  position: relative;
}

.readme-loading-indicator {
  display: flex;
  background: var(--bg-menu);
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 4px 8px;
  border-color: var(--bg-desc);
  border-radius: 4px;
  box-shadow: 0 1px 4px var(--bg-shadow-light);
  z-index: 10;
  margin-left: auto;
}

.tab-content-slider {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  padding: 0 16px 0 10px;
}

.tab-content-inner {
  width: 100%;
  height: 100%;
  position: absolute;
  padding: 0 0 0 10px;
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

:deep(.ant-segmented-item-selected) {
  background: var(--color-primary);
  color: var(--text-light);
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
  z-index: 10;
  margin-top: 10px;
  padding: 6px 12px 0 0;
}

.ant-table-thead > tr > th {
  word-break: break-all !important;
  white-space: normal !important;
}

.detail-empty {
  display: flex;
  justify-content: center;
  color: var(--text-base4);
  align-items: center;
  height: 100%;
  text-align: center;
}

.author-link {
  text-decoration: underline;
  cursor: pointer;
  color: var(--color-primary);
}

:deep(.ant-table-cell.operations-cell) {
  white-space: nowrap;
}

.subscribe-btn-bordered {
  width: 72px;
  color: var(--color-primary);
  text-align: center;
}

.subscribe-btn-bordered[disabled] {
  color: var(--color-primary);
}

.more-detail {
  width: 72px;
}

.desc-block {
  margin-bottom: 20px;
  border: 1px solid var(--color-shadow);
  background: var(--bg-desc);
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px var(--bg-shadow-light);
  position: relative;
}

.desc-title {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.desc-title::before {
  content: '📝';
  margin-right: 8px;
  font-size: 14px;
}

.desc-content {
  font-size: 15px;
  line-height: 1.8;
  margin: 0;
  color: var(--text-base2);
  white-space: pre-line;
  word-break: break-word;
}

/* tab 切换过渡动画 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

/* 从左向右进入 */
.slide-left-enter-from {
  transform: translateX(40px);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-40px);
  opacity: 0;
}

/* 从右向左进入 */
.slide-right-enter-from {
  transform: translateX(-40px);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(40px);
  opacity: 0;
}
</style>

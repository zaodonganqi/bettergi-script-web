<template>
  <a-layout class="main-layout">
    <!-- 左侧菜单 -->
    <div class="custom-sider">
      <div class="sider-header">
        <div class="sider-logo" :title="$t('sider.document')" @click="openExternalLink('https://bettergi.com/')"></div>
        <span class="repo-title">{{ $t('sider.repoTitle') }}</span>
      </div>
      <div class="sider-menu-wrap">
        <div class="menu-content">
          <a-menu v-model:selectedKeys="selectedMenu" mode="vertical" class="custom-menu" @select="handleMenuSelect">
            <a-menu-item v-for="item in menuList" :key="item.key" class="custom-menu-item">
              <span class="menu-icon">
                <component :is="item.icon"/>
              </span>
              <span class="menu-label">{{ item.label }}</span>
              <span v-if="item.count !== undefined" class="menu-count">{{ item.count }}</span>
            </a-menu-item>
          </a-menu>
        </div>
        <!-- 外链（需要可自行添加，修改链接即可） -->
        <div class="sider-footer">
          <div class="sider-link" @click="openExternalLink('https://github.com/babalae/better-genshin-impact')">
            {{ $t('sider.mainRepo') }}
          </div>
          <div class="sider-link" @click="openExternalLink('https://github.com/babalae/bettergi-scripts-list')">
            {{ $t('sider.scriptRepo') }}
          </div>
          <div v-if="mode === 'single'" class="sider-link" @click="openExternalLink('https://bgi.sh')">
            {{ $t('sider.onlineRepo') }}
          </div>
          <div class="sider-link" @click="openExternalLink('https://bettergi.com/doc.html')">
            {{ $t('sider.document') }}
          </div>
        </div>
      </div>
      <!-- 最后更新时间 -->
      <div v-if="lastUpdateTime" class="last-update-time" @click="showEggModal = true">
        <div class="update-content" :class="{ 'column-mode': mode === 'single' }">
          <template v-if="mode === 'single'">
            <div class="update-label">{{ $t('sider.lastUpdate') }}</div>
            <div class="update-time">{{ lastUpdateTime }}</div>
          </template>
          <template v-else>
            <span>{{ $t('sider.lastUpdate') + lastUpdateTime }}</span>
          </template>
        </div>
      </div>
    </div>

    <!-- 中间内容区域 -->
    <a-layout-sider class="script-sider">
      <div class="script-header">
        <span class="script-title">{{ currentMenuTitle }}</span>
        <div v-if="mode === 'single'" class="script-actions">
          <a-button type="primary" class="script-btn" :class="{ 'script-btn-active': scriptTab === 'all' }"
                    @click="onClickShowAll">{{ $t('button.all') }}
          </a-button>
          <a-button class="script-btn" :class="{ 'script-btn-active': scriptTab === 'subscribed' }"
                    @click="onClickShowSubscribed">{{ $t('button.subscribed') }}
          </a-button>
        </div>
      </div>
      <div class="search-section">
        <a-input v-model:value="search" :placeholder="searchPlaceholder" class="script-search" @search="handleSearch"
                 allow-clear>
          <template #prefix>
            <SearchOutlined/>
          </template>
        </a-input>
        <a-dropdown v-if="selectedMenu[0] !== '1'" placement="bottomLeft" trigger="click" class="sort-dropdown"
                    v-model:open="sortDropdownOpen">
          <a-button class="sort-button" size="middle">
            <AlignRightOutlined/>
          </a-button>
          <template #overlay>
            <a-menu class="sort-menu" @click="handleSortMenuClick">
              <a-menu-item-group :title="$t('sort.sortBy')">
                <a-menu-item key="recommend" :class="{ active: sortType === 'recommend' }">
                  <span>{{ $t('sort.recommend') }}</span>
                  <CheckOutlined v-if="sortType === 'recommend'" class="check-icon"/>
                </a-menu-item>
                <a-menu-item key="time" :class="{ active: sortType === 'time' }">
                  <span>{{ $t('sort.time') }}</span>
                  <CheckOutlined v-if="sortType === 'time'" class="check-icon"/>
                </a-menu-item>
                <a-menu-item key="name" :class="{ active: sortType === 'name' }">
                  <span>{{ $t('sort.name') }}</span>
                  <CheckOutlined v-if="sortType === 'name'" class="check-icon"/>
                </a-menu-item>
              </a-menu-item-group>
              <a-menu-divider/>
              <a-menu-item-group :title="$t('sort.sortOrder')">
                <a-menu-item key="asc" :class="{ active: sortOrder === 'asc' }">
                  <span>{{ $t('sort.ascending') }}</span>
                  <CheckOutlined v-if="sortOrder === 'asc'" class="check-icon"/>
                </a-menu-item>
                <a-menu-item key="desc" :class="{ active: sortOrder === 'desc' }">
                  <span>{{ $t('sort.descending') }}</span>
                  <CheckOutlined v-if="sortOrder === 'desc'" class="check-icon"/>
                </a-menu-item>
              </a-menu-item-group>
              <a-menu-divider v-if="selectedMenu[0] === '3'"/>
              <a-sub-menu v-if="selectedMenu[0] === '3'">
                <template #title>
                  <span>{{ $t('sort.filterByRole') || '角色筛选' }}</span>
                </template>
                <div class="role-filter-panel" @mousedown.stop @click.stop>
                  <a-input v-model:value="roleFilterSearch" size="middle" class="role-filter-search"
                           :placeholder="$t('sort.searchRole') || '搜索角色'">
                    <template #prefix>
                      <SearchOutlined/>
                    </template>
                  </a-input>
                  <div class="role-filter-list">
                    <a-checkbox
                        v-for="tag in displayedRoleTags"
                        :key="tag"
                        :checked="selectedRoleTags.includes(tag)"
                        :disabled="!selectedRoleTags.includes(tag) && selectedRoleTags.length >= 4"
                        class="role-filter-checkbox"
                        @change="onRoleCheckboxChange(tag, $event)"
                    >
                      <span class="role-filter-label">{{ tag }}</span>
                    </a-checkbox>
                  </div>
                  <div class="role-filter-footer">
                    <a-button size="middle" class="role-filter-btn" @click="resetRoleFilter">
                      {{ $t('common.reset') || '重置' }}
                    </a-button>
                    <a-button size="middle" type="primary" class="role-filter-btn-primary" @click="confirmRoleFilter">
                      {{ $t('common.confirm') || '确定' }}
                    </a-button>
                  </div>
                </div>
              </a-sub-menu>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <!-- 地图追踪的树状结构 -->
      <div v-if="selectedMenu[0] === '1'" class="script-list">
        <MapTreeList :search-key="search" :repo-data="repoData" :subscribed-paths="subscribedScriptPaths"
                     :show-subscribed-only="scriptTab === 'subscribed'"
                     :start-polling-user-config="startPollingUserConfig" @select="handleMapSelect"
                     @update-has-update="updateScriptHasUpdate"/>
      </div>
      <!-- Javascript脚本列表 -->
      <div v-else-if="selectedMenu[0] === '2'" class="script-list">
        <ScriptList :search-key="search" :repo-data="repoData" :subscribed-paths="subscribedScriptPaths"
                    :show-subscribed-only="scriptTab === 'subscribed'" :sort-type="sortType" :sort-order="sortOrder"
                    @select="handleScriptSelect"
                    @update-has-update="updateScriptHasUpdate"/>
      </div>
      <!-- 战斗策略列表 -->
      <div v-else-if="selectedMenu[0] === '3'" class="script-list">
        <CombatStrategyList :search-key="search" :repo-data="repoData" :subscribed-paths="subscribedScriptPaths"
                            :show-subscribed-only="scriptTab === 'subscribed'" :sort-type="sortType"
                            :sort-order="sortOrder" :role-tags="appliedRoleTags"
                            @select="handleScriptSelect"
                            @update-has-update="updateScriptHasUpdate"/>
      </div>
      <!-- 七圣召唤策略列表 -->
      <div v-else-if="selectedMenu[0] === '4'" class="script-list">
        <CardStrategyList :search-key="search" :repo-data="repoData" :subscribed-paths="subscribedScriptPaths"
                          :show-subscribed-only="scriptTab === 'subscribed'" :sort-type="sortType"
                          :sort-order="sortOrder"
                          @select="handleScriptSelect"
                          @update-has-update="updateScriptHasUpdate"/>
      </div>
    </a-layout-sider>

    <!-- 右侧内容区域 -->
    <a-layout>
      <!-- 顶部操作栏 -->
      <div class="detail-top-bar">
        <div class="top-bar-left">
          <a-tooltip v-if="mode === 'single'" :title="$t('action.update')">
            <a-button type="text" class="action-btn" @click="showUpdateMessageModal = true">
              <FieldTimeOutlined />
            </a-button>
          </a-tooltip>
          <a-tooltip v-if="mode === 'single'" :title="$t('action.subscribe')">
            <a-button type="text" class="action-btn" @click="showUpdateSubscribeModal = true">
              <CloudDownloadOutlined />
            </a-button>
          </a-tooltip>
        </div>
        <div class="top-bar-right">
          <a-tooltip :title="$t('action.help')">
            <a-button type="text" class="action-btn" @click="showHelpModal = true">
              <QuestionCircleOutlined/>
            </a-button>
          </a-tooltip>
          <a-tooltip :title="$t('settings.title')">
            <a-button type="text" class="action-btn" @click="showSettingsModal = true">
              <SettingOutlined/>
            </a-button>
          </a-tooltip>
        </div>
      </div>
      <div v-if="selectedMenu[0] === '1'" class="main-right">
        <MapDetail :script="selectedScript" :subscribed-paths="subscribedScriptPaths"
                   :start-polling-user-config="startPollingUserConfig"/>
      </div>
      <div v-else-if="selectedMenu[0] === '2'" class="main-right">
        <ScriptDetail :script="selectedScript" :start-polling-user-config="startPollingUserConfig"/>
      </div>
      <div v-else-if="selectedMenu[0] === '3' || selectedMenu[0] === '4'" class="main-right">
        <StrategyDetail :script="selectedScript" :start-polling-user-config="startPollingUserConfig"/>
      </div>
    </a-layout>

    <!-- 错误弹窗 -->
    <div v-if="repoError" class="repo-error-modal">
      <div class="repo-error-content">
        <div class="repo-error-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#fdecea"/>
            <path d="M24 14v12" stroke="#f44336" stroke-width="3" stroke-linecap="round"/>
            <circle cx="24" cy="32" r="2.5" fill="#f44336"/>
          </svg>
        </div>
        <div class="repo-error-title">{{ $t('repoError.title') }}</div>
        <div class="repo-error-desc">{{ $t('repoError.desc') }}</div>
        <div class="repo-error-btn-group">
          <button class="repo-error-btn" @click="getRepoJson">{{ $t('repoError.refresh') }}</button>
          <button class="repo-help-btn" @click="showHelpModal = true">{{ $t('repoError.help') }}</button>
        </div>
      </div>
    </div>

    <!-- 全局加载弹窗 -->
    <div v-if="globalLoading" class="global-loading-modal">
      <a-spin size="large" :tip="`${$t('loading.repoData')}...`"/>
    </div>

    <!-- 彩蛋弹窗 -->
    <a-modal v-model:open="showEggModal" :title="$t('egg.title')" :footer="null" centered width="80%"
             :style="{ maxWidth: '900px' }" @cancel="showEggModal = false">
      <div class="egg-modal-content">
        <div class="egg-readme-tabs">
          <div v-if="isLoadingEggReadme" class="egg-readme-loading-indicator">
            <a-spin size="small"/>
            <span>{{ $t('egg.loading') }}</span>
          </div>
          <div v-else-if="eggReadmeError" class="egg-readme-loading-indicator">
            <a-button type="text" size="small" @click="retryLoadEggReadme">
              <template #icon>
                <ReloadOutlined/>
              </template>
            </a-button>
            <span>{{ $t('egg.failed') }}</span>
          </div>
        </div>
        <div class="egg-readme-content">
          <ReadmeViewer :key="eggReadmeKey"
                        :path="'https://raw.githubusercontent.com/zaodonganqi/BGI-bsw-egg/main/README.md'"
                        :force-web="true"
                        @loaded="handleEggReadmeLoaded" @error="handleEggReadmeError"/>
        </div>
      </div>
    </a-modal>

    <!-- 更新信息弹窗 -->
    <a-modal v-model:open="showUpdateMessageModal" :title="$t('action.recent')" :footer="null" centered width="50%" :style="{ maxWidth: '900px' }">
      <div class="update-message-content">
        <a-list :data-source="updatedScripts" size="small">
          <template #renderItem="{ item, index }">
            <div class="update-list-item">
              <div class="item-header">
                <span class="item-index">{{ index + 1 }}.</span>
                <span class="item-title">{{ item[0] }}</span>
              </div>
              <div class="item-path">{{ item[1] }}</div>
              <div class="item-time" v-if="item[2]">{{ $t('detail.lastUpdated') }}:{{ item[2] }}</div>
            </div>
          </template>
        </a-list>
      </div>
      <div class="update-modal-footer">
        <a-button type="primary" size="middle" @click="handleClearUpdate" :loading="clearUpdateLoading">
          {{ $t('action.clearDot') }}
        </a-button>
      </div>
    </a-modal>

    <!-- 一键更新弹窗 -->
    <a-modal
      v-model:open="showUpdateSubscribeModal"
      :title="$t('action.updateAll')"
      :ok-text="$t('action.confirm')"
      :cancel-text="$t('action.cancel')"
      centered
      width="50%"
      :style="{ maxWidth: '900px' }"
      @ok="updateSubscribedScripts"
      :confirmLoading="updatingSubscribed"
      :maskClosable="!updatingSubscribed"
      :keyboard="!updatingSubscribed"
      :closable="!updatingSubscribed"
    >
      <div class="update-subscribe-content">
        <a-list :data-source="subscribedScripts" size="small">
          <template #renderItem="{ item, index }">
            <div class="update-list-item">
              <div class="item-header">
                <span class="item-index">{{ index + 1 }}.</span>
                <span class="item-title">{{ item[0] }}</span>
              </div>
              <div class="item-path">{{ item[1] }}</div>
            </div>
          </template>
        </a-list>
      </div>
    </a-modal>

    <!-- 帮助弹窗 -->
    <a-modal v-model:open="showHelpModal" :title="$t('help.title')" :footer="null" centered width="80%"
             :style="{ maxWidth: '900px' }" @cancel="showHelpModal = false">
      <Help/>
    </a-modal>

    <!-- 设置弹窗 -->
    <a-modal v-model:open="showSettingsModal" :title="$t('settings.title')" :footer="null" centered width="400px"
             @cancel="showSettingsModal = false">
      <div class="settings-row">
        <span class="settings-label">{{ $t('settings.language') }}</span>
        <a-select :value="selectedLocale" size="middle" style="width: 160px;" @change="onLocaleChange"
                  popupClassName="lang-select-dropdown">
          <a-select-option value="zh-CN">{{ $t('settings.zhCN') }}</a-select-option>
          <a-select-option value="zh-TW">{{ $t('settings.zhTW') }}</a-select-option>
          <a-select-option value="en-US">{{ $t('settings.enUS') }}</a-select-option>
          <a-select-option value="ja-JP">{{ $t('settings.jaJP') }}</a-select-option>
          <a-select-option value="fr-FR">{{ $t('settings.frFR') }}</a-select-option>
        </a-select>
      </div>
      <a-divider v-if="mode === 'single'"/>
      <div v-if="mode === 'single'" class="settings-row">
        <span class="settings-label">{{ $t('settings.clearUpdate') }}</span>
        <a-button type="primary" size="middle" @click="handleClearUpdate" :loading="clearUpdateLoading">
          {{ $t('settings.clearUpdateBtn') }}
        </a-button>
      </div>
    </a-modal>
  </a-layout>
</template>

<script setup>
import {ref, reactive, computed, onMounted, onUnmounted, watch, nextTick} from 'vue';
import {
  FolderOutlined,
  FileOutlined,
  FieldTimeOutlined,
  CalculatorOutlined,
  BulbOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  AlignRightOutlined,
  CheckOutlined,
  CloudDownloadOutlined
} from '@ant-design/icons-vue';
import {message as Message} from 'ant-design-vue';
import MapTreeList from './lists/MapTreeList.vue';
import ScriptList from './lists/ScriptList.vue';
import CombatStrategyList from './lists/CombatStrategyList.vue';
import CardStrategyList from './lists/CardStrategyList.vue';
import ScriptDetail from './details/ScriptDetail.vue';
import StrategyDetail from './details/StrategyDetail.vue';
import MapDetail from './details/MapDetail.vue';
import ReadmeViewer from './items/ReadmeViewer.vue';
import Help from './items/Help.vue';
import { getRawPath, getMirrorPath} from '@/utils/basePaths';
import {useI18n} from 'vue-i18n';
import {mapTagsToCanonical} from '@/utils/roleAlias';
import { subscribePaths } from '@/utils/subscription';

const mode = import.meta.env.VITE_MODE;
const selectedMenu = ref(['1']);
const search = ref('');
const showUpdateMessageModal = ref(false);
const showUpdateSubscribeModal = ref(false);

// 排序相关数据
const sortType = ref('recommend');
const sortOrder = ref('desc');
const sortStateByMenu = reactive({
  '2': {type: 'recommend', order: 'desc'},
  '3': {type: 'recommend', order: 'desc'},
  '4': {type: 'recommend', order: 'desc'}
});

// 排序下拉显隐
const sortDropdownOpen = ref(false);

// 战斗策略角色筛选
const roleFilterSearch = ref('');
const selectedRoleTags = ref([]); // 面板中的临时选择（≤4）
const appliedRoleTags = ref([]);  // 确认后生效

function collectCombatTags(repo) {
  if (!repo?.indexes) return [];
  const combat = repo.indexes.find(i => i.name === 'combat');
  if (!combat || !Array.isArray(combat.children)) return [];
  const all = [];
  const dfs = (nodes) => {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        dfs(node.children);
      } else {
        const tags = mapTagsToCanonical(Array.isArray(node.tags) ? node.tags : []);
        for (const tag of tags) if (tag && typeof tag === 'string') all.push(tag);
      }
    }
  };
  dfs(combat.children);
  return Array.from(new Set(all)).sort((a, b) => String(a).localeCompare(String(b)));
}

const allRoleTags = computed(() => collectCombatTags(repoData.value));
const displayedRoleTags = computed(() => {
  const kw = (roleFilterSearch.value || '').trim().toLowerCase();
  if (!kw) return allRoleTags.value;
  return allRoleTags.value.filter(t => String(t).toLowerCase().includes(kw));
});

function onRoleCheckboxChange(tag, evt) {
  const checked = evt?.target?.checked;
  const current = new Set(selectedRoleTags.value);
  if (checked) {
    if (!current.has(tag) && current.size < 4) current.add(tag);
  } else {
    current.delete(tag);
  }
  selectedRoleTags.value = Array.from(current);
  appliedRoleTags.value = [...selectedRoleTags.value];
}

function resetRoleFilter() {
  selectedRoleTags.value = [];
  appliedRoleTags.value = [];
}

function confirmRoleFilter() {
  appliedRoleTags.value = [...selectedRoleTags.value];
  sortDropdownOpen.value = false;
}

function applySortForMenu(menuKey) {
  const state = sortStateByMenu[menuKey];
  if (state) {
    sortType.value = state.type || 'recommend';
    sortOrder.value = state.order || 'desc';
  } else {
    sortType.value = 'recommend';
    sortOrder.value = 'desc';
  }
}

function saveSortForMenu(menuKey) {
  if (!['2', '3', '4'].includes(menuKey)) return;
  sortStateByMenu[menuKey] = {type: sortType.value, order: sortOrder.value};
}

const {t: $t} = useI18n();

const {selectedLocale, handleLocaleChange} = defineProps({
  selectedLocale: {
    type: String,
    required: true
  },
  handleLocaleChange: {
    type: Function,
    required: true
  }
});

const menuList = computed(() => [
  {key: '1', label: $t('menu.map'), icon: FolderOutlined, count: menuCounts.value[0]},
  {key: '2', label: $t('menu.script'), icon: FileOutlined, count: menuCounts.value[1]},
  {key: '3', label: $t('menu.combat'), icon: CalculatorOutlined, count: menuCounts.value[2]},
  {key: '4', label: $t('menu.tcg'), icon: BulbOutlined, count: menuCounts.value[3]},
]);

const menuCounts = ref([0, 0, 0, 0]);

const repoData = ref({});
const repoError = ref(false);
const globalLoading = ref(false);
const useMirror = ref(false);
let fetchTimeoutId = null;

// 格式化时间
const formatTime = (timeString) => {
  if (!timeString) return '';
  const year = timeString.substring(0, 4);
  const month = timeString.substring(4, 6);
  const day = timeString.substring(6, 8);
  const hour = timeString.substring(8, 10);
  const minute = timeString.substring(10, 12);
  const second = timeString.substring(12, 14);

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

// 计算最后更新时间
const lastUpdateTime = computed(() => {
  if (repoData.value && repoData.value.time) {
    // 区分本地与web模式，如需更改最后更新时间格式请更改此处
    if (mode === 'web') {
      return `${formatTime(repoData.value.time)}`;
    }
    return `${formatTime(repoData.value.time)}`;
  }
  return '';
});

// 清理所有readme404缓存
function clearReadme404Cache() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('readme404:')) {
      localStorage.removeItem(key);
    }
  });
}

async function getRepoJson() {
  clearReadme404Cache();
  repoError.value = false;
  globalLoading.value = true;
  try {
    console.log("Current mode:", mode)
    if (mode === 'web') {
      const controller = new AbortController();
      let didTimeout = false;
      if (fetchTimeoutId) clearTimeout(fetchTimeoutId);
      fetchTimeoutId = setTimeout(() => {
        didTimeout = true;
        controller.abort();
      }, 10000);
      try {
        let repoPath = '';
        if (useMirror.value) {
          console.log("Using mirror for fetching repo.json");
          repoPath = getMirrorPath() + 'repo.json';
        } else {
          repoPath = getRawPath() + 'repo.json';
        }
        const response = await fetch(repoPath, {
          signal: controller.signal
        });
        clearTimeout(fetchTimeoutId);
        fetchTimeoutId = null;
        if (!response.ok) throw new Error('Network request failed');
        repoData.value = await response.json();
      } catch (err) {
        useMirror.value = true; // 下次使用镜像
        clearTimeout(fetchTimeoutId);
        fetchTimeoutId = null;
        if (didTimeout) {
          throw new Error('Request timed out');
        } else {
          throw err;
        }
      }
    } else {
      const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
      const json = await repoWebBridge.GetRepoJson();
      repoData.value = typeof json === 'string' ? JSON.parse(json) : json;
      // 获取订阅信息
      await fetchSubscribedConfig();
    }
    console.log("json info:", repoData.value)
    if (mode === 'single') {
      getUpdatedScripts();
    }
    menuCounts.value[0] = getMapCount(repoData.value);
    menuCounts.value[1] = getJsCount(repoData.value);
    menuCounts.value[2] = getCombatCount(repoData.value);
    menuCounts.value[3] = getCardCount(repoData.value);
  } catch (e) {
    console.error('Failed to fetch repo info', e);
    repoError.value = true;
  }
  globalLoading.value = false;
  return repoData.value;
}

const updatedScripts = ref([]);
// 获取所有更新节点信息
function getUpdatedScripts() {
  if (!repoData.value || !Array.isArray(repoData.value.indexes)) return;
  updatedScripts.value = [];
  // 递归构建完整路径，使用 name 作为标题
  function dfs(node, currentPath) {
    if (!node) return;
    const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
    if (node.hasUpdate && !['pathing', 'js', 'combat', 'tcg'].includes(node.name) && !String(node.type || '').includes('file')) {
      updatedScripts.value.push([node.name, fullPath, node.lastUpdated || '']);
    }
    // 继续向下遍历
    if (Array.isArray(node.children) && node.children.length > 0) {
      node.children.forEach(child => dfs(child, fullPath));
    }
  }
  repoData.value.indexes.forEach(index => {
    dfs(index, '');
  });
}

const subscribedScripts = ref([]);
const updatingSubscribed = ref(false);

async function updateSubscribedScripts() {
  if (updatingSubscribed.value) return;
  if (subscribedScriptPaths.value.length === 0) {
    showUpdateSubscribeModal.value = false;
    return;
  }

  updatingSubscribed.value = true;
  try {
    const result = await subscribePaths(subscribedScriptPaths.value);
    if (!result?.ok) {
      Message.error($t('detail.subscribeFailed'));
      return;
    }

    const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
    const paths = [...subscribedScriptPaths.value];
    const batchSize = 10;
    for (let i = 0; i < paths.length; i += batchSize) {
      const slice = paths.slice(i, i + batchSize);
      await Promise.all(slice.map(p => repoWebBridge.UpdateSubscribed(p)));
    }

    for (const p of paths) {
      updateScriptHasUpdate(p, false);
    }

    await fetchSubscribedConfig();

    showUpdateSubscribeModal.value = false;
  } catch (e) {
    console.error('updateSubscribedScripts failed', e);
    Message.error($t('detail.subscribeFailed'));
  } finally {
    updatingSubscribed.value = false;
  }
}

// 计算当前菜单标题
const currentMenuTitle = computed(() => {
  const current = menuList.value.find(item => item.key === selectedMenu.value[0]);
  return current ? current.label : '';
});

// 计算搜索框占位符
const searchPlaceholder = computed(() => {
  switch (selectedMenu.value[0]) {
    case '1':
      return $t('script.searchMap');
    case '2':
      return $t('script.searchScript');
    case '3':
      return $t('script.searchCombat');
    case '4':
      return $t('script.searchTCG');
    default:
      return $t('script.searchDefault');
  }
});

const handleSearch = (value) => {
  search.value = value;
};

// 处理排序菜单点击
const handleSortMenuClick = ({key}) => {
  if (['recommend', 'time', 'name'].includes(key)) {
    sortType.value = key;
  } else if (['asc', 'desc'].includes(key)) {
    sortOrder.value = key;
  }
  // 保存当前菜单的排序状态
  saveSortForMenu(selectedMenu.value[0]);
  console.log('排序设置已更新:', {sortType: sortType.value, sortOrder: sortOrder.value});
};

const handleMenuSelect = ({key}) => {
  selectedMenu.value = [key];
  search.value = '';
  selectedScript.value = null;
};

const openExternalLink = (link) => {
  window.open(link, '_blank');
};

const selectedScript = ref(null);

const handleScriptSelect = (script) => {
  selectedScript.value = script;
};

// 更新repoData中指定脚本的hasUpdate状态
const updateScriptHasUpdate = (scriptPath, hasUpdate) => {
  if (!repoData.value || !repoData.value.indexes) return;

  let targetNode = null;

  // 递归查找目标节点
  const findTargetNode = (node, currentPath = '') => {
    // 构建当前节点的完整路径
    const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;

    // 检查是否匹配目标路径
    if (nodePath === scriptPath || scriptPath.endsWith(`/${nodePath}`)) {
      targetNode = node;
      return;
    }

    // 如果有子节点，继续递归查找
    if (node.children && node.children.length > 0) {
      for (let child of node.children) {
        findTargetNode(child, nodePath);
        // 不return，继续查找所有分支
      }
    }
  };

  // 递归更新所有子节点的hasUpdate状态
  const updateDescendants = (node) => {
    if (!node) return;

    // 先更新所有子节点
    if (node.children && node.children.length > 0) {
      for (let child of node.children) {
        updateDescendants(child);
      }
    }

    // 最后更新当前节点
    node.hasUpdate = hasUpdate;
  };

  // 先从repoData递归查找目标节点
  for (let index of repoData.value.indexes) {
    findTargetNode(index);
    if (targetNode) break; // 找到目标节点后停止查找
  }

  if (targetNode) {

    // 先更新所有子节点，最后更新目标节点本身
    updateDescendants(targetNode);

    // 强制触发响应式更新
    nextTick(() => {
      repoData.value = {...repoData.value};
    });
  } else {
    console.log("updateScriptHasUpdate: 未找到匹配节点", scriptPath);
  }
};

// 地图追踪板块
const handleMapSelect = (location) => {
  selectedScript.value = location;
};

// 按分类统计脚本数量
function countCategoryLeaves(repo, categoryName, isLeaf) {
  if (!repo?.indexes) return 0;
  const category = repo.indexes.find(item => item.name === categoryName);
  if (!category || !Array.isArray(category.children)) return 0;

  const hasExpandableChildren = (node) => {
    if (!node?.children || node.children.length === 0) return false;
    return node.children.some(child => child.type === 'directory');
  };

  const defaultIsLeaf = (node) => !hasExpandableChildren(node);
  const leafPredicate = typeof isLeaf === 'function' ? isLeaf : defaultIsLeaf;

  function dfs(nodes) {
    if (!nodes) return 0;
    let total = 0;
    for (const node of nodes) {
      if (leafPredicate(node)) {
        total++;
      } else if (node.children && node.children.length > 0) {
        total += dfs(node.children);
      }
    }
    return total;
  }

  return dfs(category.children);
}

function getJsCount(repo) {
  return countCategoryLeaves(repo, 'js');
}

function getMapCount(repo) {
  return countCategoryLeaves(repo, 'pathing');
}

function getCombatCount(repo) {
  return countCategoryLeaves(repo, 'combat');
}

function getCardCount(repo) {
  // tcg 的叶子是文件节点
  return countCategoryLeaves(repo, 'tcg', (node) => node.type === 'file');
}

const subscribedScriptPaths = ref([]);
// 订阅信息获取失败标志
const subscribedConfigError = ref(false);

// 获取订阅信息
async function fetchSubscribedConfig() {
  if (mode !== 'single') return;
  try {
    const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
    const json = await repoWebBridge.GetUserConfigJson();
    let config = {};
    try {
      config = typeof json === 'string' ? JSON.parse(json) : json;
    } catch (e) {
      config = {};
    }
    const paths = Array.from(new Set(config.scriptConfig?.subscribedScriptPaths || []));
    if (JSON.stringify(paths) !== JSON.stringify(subscribedScriptPaths.value)) {
      if (!paths.length) {
        subscribedConfigError.value = true;
        subscribedScriptPaths.value = [];
      } else {
        subscribedScriptPaths.value = paths;
        if (!repoData.value || !Array.isArray(repoData.value.indexes)) return;
        subscribedScripts.value = [];
        // 递归构建完整路径，使用 name 作为标题
        function findNodes(node, currentPath) {
          if (!node) return;
          const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
          const isSubscribed = subscribedScriptPaths.value.some(sub => fullPath === sub);
          const isRoot = ['pathing', 'js', 'combat', 'tcg'].includes(node.name);
          if (isSubscribed && !isRoot) {
            subscribedScripts.value.push([node.name, fullPath]);
          }
          // 继续向下遍历
          if (Array.isArray(node.children) && node.children.length > 0) {
            node.children.forEach(child => findNodes(child, fullPath));
          }
        }
        repoData.value.indexes.forEach(index => {
          findNodes(index, '');
        });
        subscribedConfigError.value = false;
      }
    }
  } catch (e) {
    subscribedConfigError.value = true;
  }
}

// 静默刷新已订阅
async function refreshSubscribedConfigSilently(paths) {
  try {
    if (!paths.length) {
      subscribedConfigError.value = true;
      subscribedScriptPaths.value = [];
    } else {
      subscribedScriptPaths.value = paths;
      subscribedConfigError.value = false;
    }
  } catch (e) {
    subscribedConfigError.value = true;
  }
}

let pollingTimer = null;
let pollingTimeout = null;
let lastConfigStr = '';

function startPollingUserConfig() {
  if (pollingTimer) clearInterval(pollingTimer);
  if (pollingTimeout) clearTimeout(pollingTimeout);

  lastConfigStr = JSON.stringify(subscribedScriptPaths.value);

  pollingTimer = setInterval(async () => {
    const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
    const json = await repoWebBridge.GetUserConfigJson();
    if (json) {
      let config = {};
      try {
        config = typeof json === 'string' ? JSON.parse(json) : json;
      } catch (e) {
        config = {};
      }
      const paths = Array.from(new Set(config.scriptConfig?.subscribedScriptPaths || []));
      const newConfigStr = JSON.stringify(paths);
      if (newConfigStr !== lastConfigStr) {
        // config有变化，静默刷新
        await refreshSubscribedConfigSilently(paths);
        lastConfigStr = newConfigStr;
      }
    }
  }, 1000);

  pollingTimeout = setTimeout(() => {
    if (pollingTimer) clearInterval(pollingTimer);
    pollingTimer = null;
    pollingTimeout = null;
  }, 8000);
}

onMounted(() => {
  getRepoJson();
  if (['2', '3', '4'].includes(selectedMenu.value[0])) {
    applySortForMenu(selectedMenu.value[0]);
  }
  selectedRoleTags.value = [...appliedRoleTags.value];
});

onUnmounted(() => {
  if (fetchTimeoutId) {
    clearTimeout(fetchTimeoutId);
    fetchTimeoutId = null;
  }
});

const showEggModal = ref(false);

// 彩蛋 README 加载状态
const isLoadingEggReadme = ref(false);
const eggReadmeError = ref(false);
const eggReadmeKey = ref(0);

const handleEggReadmeLoaded = () => {
  isLoadingEggReadme.value = false;
  eggReadmeError.value = false;
};

const handleEggReadmeError = () => {
  console.log('Egg README load failed');
  isLoadingEggReadme.value = false;
  eggReadmeError.value = true;
};

const retryLoadEggReadme = () => {
  console.log('Retry loading egg README');
  isLoadingEggReadme.value = true;
  eggReadmeError.value = false;
  eggReadmeKey.value++;
};

// 监听彩蛋弹窗打开，重置加载状态
watch(showEggModal, (newVal) => {
  if (newVal) {
    // 重置状态
    isLoadingEggReadme.value = true;
    eggReadmeError.value = false;
    eggReadmeKey.value++;
  }
});

const showHelpModal = ref(false);

const scriptTab = ref('all');

const onClickShowAll = () => {
  if (mode === 'web') return;
  scriptTab.value = 'all';
};
const onClickShowSubscribed = () => {
  if (mode === 'web') return;
  if (subscribedConfigError.value || subscribedScriptPaths.value.length === 0) {
    scriptTab.value = 'subscribed';
    return;
  }
  scriptTab.value = 'subscribed';
};

watch(selectedMenu, () => {
  scriptTab.value = 'all';
  // 切换菜单时恢复该菜单上次会话内的排序状态
  applySortForMenu(selectedMenu.value[0]);
  // 同步 combat 面板临时选择
  roleFilterSearch.value = '';
  selectedRoleTags.value = [...appliedRoleTags.value];
});

watch(subscribedScriptPaths, (newPaths) => {
  if (!selectedScript.value) return;

  if (selectedScript.value.path) {
    const isSubscribed = newPaths.some(p => selectedScript.value.path === p || selectedScript.value.path.startsWith(p + '/'));
    if (selectedScript.value.isSubscribed !== isSubscribed) {
      selectedScript.value.isSubscribed = isSubscribed;
    }
  }

  if (selectedScript.value.type === 'directory' && selectedScript.value.files && Array.isArray(selectedScript.value.files)) {
    selectedScript.value.files.forEach(file => {
      if (file.path) {
        const fileIsSubscribed = newPaths.some(p => file.path === p || file.path.startsWith(p + '/'));
        file.isSubscribed = fileIsSubscribed;
      }
    });
  }
});

const showSettingsModal = ref(false);
const clearUpdateLoading = ref(false);

function onLocaleChange(val) {
  handleLocaleChange(val);
  showSettingsModal.value = false;
}

// 清除更新提示
const handleClearUpdate = async () => {
  if (mode !== 'single') return;

  clearUpdateLoading.value = true;
  try {
    const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
    const result = await repoWebBridge.ClearUpdate();

    if (result) {
      // 清除成功，更新所有脚本的hasUpdate状态
      updateAllScriptsHasUpdate(false);
      // 显示成功消息
      Message.success($t('settings.clearUpdateSuccess'));
    } else {
      // 清除失败
      Message.error($t('settings.clearUpdateFailed'));
    }
  } catch (error) {
    console.error('ClearUpdate failed:', error);
    Message.error($t('settings.clearUpdateFailed'));
  } finally {
    clearUpdateLoading.value = false;
    showUpdateMessageModal.value = false;
  }
};

// 更新所有脚本的hasUpdate状态
const updateAllScriptsHasUpdate = (hasUpdate) => {
  if (!repoData.value || !repoData.value.indexes) return;

  const updateNodeHasUpdate = (nodes) => {
    for (let node of nodes) {
      if (node.children && node.children.length > 0) {
        // 如果是目录，递归更新
        updateNodeHasUpdate(node.children);
        node.hasUpdate = hasUpdate;
      } else {
        // 如果是文件，更新hasUpdate状态
        node.hasUpdate = hasUpdate;
      }
    }
  };

  // 更新所有类型的脚本
  repoData.value.indexes.forEach(index => {
    if (index.children) {
      updateNodeHasUpdate(index.children);
    }
  });

  // 强制触发响应式更新
  nextTick(() => {
    repoData.value = {...repoData.value};
  });
};
</script>

<style scoped>
.main-layout {
  height: 100vh;
  width: 100%;
  margin: 0;
  background: #fff;
  display: flex;
}

.custom-sider {
  width: 18% !important;
  max-width: 300px !important;
  background: #f7f8fa !important;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  padding: 0;
  height: 100%;
}

.sider-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-weight: 600;
  font-size: 18px;
  color: #222;
  border-bottom: 1px solid #ececec;
  width: 100%;
  flex-shrink: 0;
  position: relative;
}

.sider-logo {
  width: 40px;
  height: 40px;
  background: url('@/assets/favicon.ico') no-repeat center/contain;
  margin-right: 10px;
  flex-shrink: 0;
  cursor: pointer;
  transition: opacity 0.2s;
}

.sider-logo:hover {
  opacity: 0.8;
}

.repo-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-left: 10px;
  align-items: center;
}

.sider-menu-wrap {
  padding: 8px;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  height: calc(100% - 60px - 60px);
}

.menu-content {
  overflow-y: auto;
  overflow-x: hidden;
}

.custom-menu {
  background: transparent !important;
  width: 100%;
}

.custom-menu-item {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #222;
  border-radius: 8px;
  margin: 0 8px;
  padding: 0 16px !important;
  min-width: 0;
  height: auto;
}

.menu-icon {
  margin-right: 10px;
  font-size: 18px;
  flex-shrink: 0;
}

.menu-label {
  flex: 1 1 0;
  min-width: 0;
}

.menu-count {
  color: #b0b0b0;
  font-size: 13px;
  margin-left: 8px;
  flex-shrink: 0;
}

.sider-footer {
  padding: 24px 16px;
  color: #999;
  font-size: 14px;
  border-top: 1px solid #ececec;
  width: 100%;
  flex-shrink: 0;
}

.sider-link {
  margin-bottom: 12px;
  cursor: pointer;
}

.last-update-time {
  padding: 12px 25px;
  color: #999;
  font-size: 12px;
  border-top: 1px solid #ececec;
  width: 100%;
  flex-shrink: 0;
  height: 60px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
}

.last-update-time.column-mode {
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: auto;
  gap: 0;
  padding-bottom: 8px;
}

.last-update-time span {
  color: #666;
  font-size: 15px;
}

.script-sider {
  width: 23% !important;
  min-width: 23% !important;
  max-width: 23% !important;
  background: #f7f8fa !important;
  border-right: 1px solid #e5e7eb;
  height: 100%;
  position: relative;
}

.script-header {
  height: 60px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ececec;
}

.script-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.script-actions {
  position:relative;
  display: flex;
  gap: 8px;
}

.script-btn {
  height: 28px;
  padding: 0 12px;
  font-size: 14px;
  border-radius: 4px;
  background: #fff !important;
  color: #1677ff !important;
  border: 1px solid #1677ff !important;
  transition: background 0.2s, color 0.2s;
}

.search-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 60px;
  padding: 10px 16px;
  border-bottom: 1px solid #ececec;
  gap: 8px;
}

.script-search {
  flex: 1;
  height: 40px;
}

.sort-dropdown {
  flex-shrink: 0;
}

.sort-button {
  height: 40px;
  width: 40px;
  background: #fff !important;
  border: 1px solid #d9d9d9 !important;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 16px;
  padding: 0;
  box-shadow: none;
  transition: all 0.2s;
}

.sort-button:hover {
  border-color: #4096ff !important;
  color: #4096ff;
}

.sort-button:focus {
  border-color: #4096ff !important;
  outline: none;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.2);
}

.sort-menu {
  min-width: 120px;
}

.role-filter-panel {
  width: 360px;
  max-height: 400px;
  padding: 8px 12px 12px 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.role-filter-search :deep(.ant-input-affix-wrapper) {
  height: 34px;
  border-radius: 8px;
  border-color: #d9d9d9;
}

.role-filter-search :deep(.ant-input-prefix) {
  color: #999;
}

.role-filter-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  display: grid;
  margin: 8px 0;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 10px;
}

.role-filter-checkbox :deep(.ant-checkbox) {
  transform: translateY(-1px);
}

.role-filter-checkbox :deep(.ant-checkbox-checked .ant-checkbox-inner) {
  background-color: #1677ff;
  border-color: #1677ff;
}

.role-filter-checkbox:hover {
  color: #1677ff;
}

.role-filter-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-filter-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
}

.role-filter-btn {
  border-radius: 8px;
  padding: 0 12px;
}

.role-filter-btn-primary {
  border-radius: 8px;
  padding: 0 14px;
}

.sort-menu .ant-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
}

.sort-menu .ant-menu-item.active {
  background-color: #f0f5ff;
  color: #1677ff;
}

.sort-menu .check-icon {
  color: #1677ff;
  font-size: 14px;
  margin-left: 8px;
}

.sort-menu .ant-menu-item-group-title {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  padding: 8px 16px 4px 16px;
}

.script-list {
  position: absolute;
  top: 120px;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background: #f7f8fa;
}

.main-right {
  flex: 1;
  height: 100%;
  background: #f5f6fa;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.detail-top-bar {
  height: 60px;
  background: #f7f8fa;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

.top-bar-left {
  display: flex;
  margin-left: 1px;
  gap: 8px;
}

.top-bar-right {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.action-btn {
  color: #444;
  border: none;
  padding: 3px 8px;
  border-radius: 6px;
  transition: all 0.2s;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

.main-right > div:last-child {
  flex: 1;
  overflow: hidden;
}

.strategy-tabs :deep(.ant-tabs-content) {
  flex: 1;
  overflow-y: auto;
}

.repo-error-modal {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.repo-error-content {
  background: #fff;
  color: #d32f2f;
  font-size: 18px;
  padding: 36px 48px 32px 48px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  text-align: center;
  min-width: 320px;
  max-width: 90vw;
  animation: popIn 0.3s;
}

@keyframes popIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.repo-error-icon {
  margin-bottom: 16px;
}

.repo-error-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #f44336;
}

.repo-error-desc {
  font-size: 15px;
  color: #666;
  margin-bottom: 24px;
}

.repo-error-btn {
  background: linear-gradient(90deg, #ff6a6a 0%, #f44336 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 32px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.12);
  transition: background 0.2s, box-shadow 0.2s;
}

.repo-error-btn:hover {
  background: linear-gradient(90deg, #f44336 0%, #ff6a6a 100%);
  box-shadow: 0 4px 16px rgba(244, 67, 54, 0.18);
}

.global-loading-modal {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 99999;
  background: rgba(255, 255, 255, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
}

.egg-modal-content {
  max-height: 65vh;
  overflow-y: auto;
  padding-left: 15px;
  padding-right: 15px;
  font-size: clamp(14px, 1.5vw, 16px);
  position: relative;
}

.egg-readme-tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  gap: 10px;
}

.egg-readme-loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.egg-readme-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.update-message-content {
  display: flex;
  flex-direction: column;
  max-height: 60vh;
  overflow-y: auto;
}

.update-list-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.update-list-item:last-child {
  border-bottom: none;
}

.item-header {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  display: flex;
  align-items: center;
}

.item-index {
  color: #000000;
  font-size: 15px;
  font-weight: bold;
  margin-right: 6px;
}

.item-title {
  word-break: break-all;
}

.item-path {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
  word-break: break-all;
}

.item-time {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
  word-break: break-all;
}

.update-modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}

.update-subscribe-content {
  max-height: 60vh;
  overflow-y: auto;
}

.repo-error-btn-group {
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: center;
  margin-top: 8px;
}

.repo-help-btn {
  background: linear-gradient(90deg, #1677ff 0%, #40a9ff 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 32px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.12);
  transition: background 0.2s, box-shadow 0.2s;
}

.repo-help-btn:hover {
  background: linear-gradient(90deg, #40a9ff 0%, #1677ff 100%);
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.18);
}

.script-btn-active {
  background: #1677ff !important;
  color: #fff !important;
  border: 1px solid #1677ff !important;
}
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.settings-label {
  font-size: 15px;
  color: #222;
  font-weight: 500;
}

.update-label {
  font-size: 15px;
  color: #666;
  line-height: 1.2;
}

.update-time {
  font-size: 14px;
  color: #888;
  margin-top: 2px;
  line-height: 1.2;
}

.update-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.update-content.column-mode {
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
}
</style>


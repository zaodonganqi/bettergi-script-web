<template>
  <a-layout class="main-layout">
    <!-- 左侧菜单 -->
    <div class="custom-sider">
      <div class="sider-header">
        <div class="sider-logo" :title="$t('sider.mainRepo')" @click="openExternalLink('https://bettergi.com/')"></div>
        <span class="repo-title">{{ $t('sider.repoTitle') }}</span>
      </div>
      <div class="sider-menu-wrap">
        <div class="menu-content">
          <a-menu v-model:selectedKeys="selectedMenu" mode="vertical" class="custom-menu" @select="handleMenuSelect">
            <a-menu-item v-for="item in menuList" :key="item.key" class="custom-menu-item">
              <span class="menu-icon">
                <component :is="item.icon" />
              </span>
              <span class="menu-label">{{ item.label }}</span>
              <span v-if="item.count !== undefined" class="menu-count">{{ item.count }}</span>
            </a-menu-item>
          </a-menu>
        </div>
        <!-- 外链（需要可自行添加，修改链接即可） -->
        <div class="sider-footer">
          <div class="sider-link" @click="openExternalLink('https://github.com/babalae/better-genshin-impact')">
            {{ $t('sider.mainRepo') }}</div>
          <div class="sider-link" @click="openExternalLink('https://github.com/babalae/bettergi-scripts-list')">
            {{ $t('sider.scriptRepo') }}</div>
          <div v-if="mode === 'single'" class="sider-link" @click="openExternalLink('https://s.bettergi.com')">{{
            $t('sider.onlineRepo') }}</div>
            <div class="sider-link" @click="openExternalLink('https://bettergi.com/doc.html')">
            {{ $t('sider.document') }}</div>
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
        <a-button class="settings-btn" type="text" size="small" @click.stop="showSettingsModal = true"
          :title="$t('settings.title')">
          <template #icon>
            <SettingOutlined />
          </template>
        </a-button>
      </div>
    </div>

    <!-- 中间内容区域 -->
    <a-layout-sider class="script-sider">
      <div class="script-header">
        <span class="script-title">{{ currentMenuTitle }}</span>
        <div class="script-actions" style="position:relative;">
          <a-button type="primary" class="script-btn" :class="{ 'script-btn-active': scriptTab === 'all' }"
            @click="onClickShowAll">{{ $t('button.all') }}</a-button>
          <a-button class="script-btn" :class="{ 'script-btn-active': scriptTab === 'subscribed' }"
            @click="onClickShowSubscribed">{{ $t('button.subscribed') }}</a-button>
          <div v-if="mode === 'web'" class="script-actions-mask">
            <span>{{ $t('script.onlyLocal') }}</span>
          </div>
        </div>
      </div>
      <div class="search-section">
        <a-input v-model:value="search" :placeholder="searchPlaceholder" class="script-search" @search="handleSearch"
          allow-clear>
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
        <a-dropdown v-if="selectedMenu[0] !== '1'" placement="bottomLeft" trigger="click" class="sort-dropdown">
          <a-button class="sort-button" size="middle">
            <AlignRightOutlined />
          </a-button>
          <template #overlay>
            <a-menu class="sort-menu" @click="handleSortMenuClick">
              <a-menu-item-group :title="$t('sort.sortBy')">
                <a-menu-item key="recommend" :class="{ active: sortType === 'recommend' }">
                  <span>{{ $t('sort.recommend') }}</span>
                  <CheckOutlined v-if="sortType === 'recommend'" class="check-icon" />
                </a-menu-item>
                <a-menu-item key="time" :class="{ active: sortType === 'time' }">
                  <span>{{ $t('sort.time') }}</span>
                  <CheckOutlined v-if="sortType === 'time'" class="check-icon" />
                </a-menu-item>
                <a-menu-item key="name" :class="{ active: sortType === 'name' }">
                  <span>{{ $t('sort.name') }}</span>
                  <CheckOutlined v-if="sortType === 'name'" class="check-icon" />
                </a-menu-item>
              </a-menu-item-group>
              <a-menu-divider />
              <a-menu-item-group :title="$t('sort.sortOrder')">
                <a-menu-item key="asc" :class="{ active: sortOrder === 'asc' }">
                  <span>{{ $t('sort.ascending') }}</span>
                  <CheckOutlined v-if="sortOrder === 'asc'" class="check-icon" />
                </a-menu-item>
                <a-menu-item key="desc" :class="{ active: sortOrder === 'desc' }">
                  <span>{{ $t('sort.descending') }}</span>
                  <CheckOutlined v-if="sortOrder === 'desc'" class="check-icon" />
                </a-menu-item>
              </a-menu-item-group>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <!-- 地图追踪的树状结构 -->
      <div v-if="selectedMenu[0] === '1'" class="script-list">
        <MapTreeList :search-key="search" :repo-data="repoData" :subscribed-paths="subscribedScriptPaths"
          :show-subscribed-only="scriptTab === 'subscribed'" ref="mapTreeRef"
          :start-polling-user-config="startPollingUserConfig" @select="handleMapSelect" @leaf-count="handleLeafCount"
          @update-has-update="updateScriptHasUpdate" />
      </div>
      <!-- Javascript脚本列表 -->
      <div v-else-if="selectedMenu[0] === '2'" class="script-list">
        <ScriptList :search-key="search" :repo-data="repoData" :subscribed-paths="subscribedScriptPaths"
          :show-subscribed-only="scriptTab === 'subscribed'" :sort-type="sortType" :sort-order="sortOrder"
          ref="scriptListRef" @select="handleScriptSelect" @script-count="handleScriptCount"
          @update-has-update="updateScriptHasUpdate" />
      </div>
      <!-- 战斗策略列表 -->
      <div v-else-if="selectedMenu[0] === '3'" class="script-list">
        <CombatStrategyList :search-key="search" :repo-data="repoData" :subscribed-paths="subscribedScriptPaths"
          :show-subscribed-only="scriptTab === 'subscribed'" :sort-type="sortType" :sort-order="sortOrder"
          ref="combatStrategyRef" @select="handleScriptSelect" @update-has-update="updateScriptHasUpdate" />
      </div>
      <!-- 七圣召唤策略列表 -->
      <div v-else-if="selectedMenu[0] === '4'" class="script-list">
        <CardStrategyList :search-key="search" :repo-data="repoData" :subscribed-paths="subscribedScriptPaths"
          :show-subscribed-only="scriptTab === 'subscribed'" :sort-type="sortType" :sort-order="sortOrder"
          ref="cardStrategyRef" @select="handleScriptSelect" @update-has-update="updateScriptHasUpdate" />
      </div>
    </a-layout-sider>

    <!-- 右侧内容区域 -->
    <a-layout>
      <div v-if="selectedMenu[0] === '1'" class="main-right">
        <!-- 顶部操作栏 -->
        <div v-if="selectedScript" class="detail-top-bar">
          <div class="top-bar-left">
            <a-tooltip :title="$t('action.jumpToGitHub')">
              <a-button type="text" size="small" class="action-btn" @click="jumpToGitHub">
                <LinkOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip :title="$t('action.comment')">
              <a-button type="text" size="small" class="action-btn" @click="commentModalOpen = true">
                <MessageOutlined />
              </a-button>
            </a-tooltip>
          </div>
          <div class="top-bar-right">
            <a-tooltip :title="$t('action.help')">
              <a-button type="text" size="small" class="action-btn" @click="showHelpModal = true">
                <QuestionCircleOutlined />
              </a-button>
            </a-tooltip>
          </div>
        </div>
        <MapDetail :script="selectedScript" :subscribed-paths="subscribedScriptPaths"
          :start-polling-user-config="startPollingUserConfig" />
      </div>
      <div v-else-if="selectedMenu[0] === '2'" class="main-right">
        <!-- 顶部操作栏 -->
        <div v-if="selectedScript" class="detail-top-bar">
          <div class="top-bar-left">
            <a-tooltip :title="$t('action.jumpToGitHub')">
              <a-button type="text" size="small" class="action-btn" @click="jumpToGitHub">
                <LinkOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip :title="$t('action.comment')">
              <a-button type="text" size="small" class="action-btn" @click="commentModalOpen = true">
                <MessageOutlined />
              </a-button>
            </a-tooltip>
          </div>
          <div class="top-bar-right">
            <a-tooltip :title="$t('action.help')">
              <a-button type="text" size="small" class="action-btn" @click="showHelpModal = true">
                <QuestionCircleOutlined />
              </a-button>
            </a-tooltip>
          </div>
        </div>
        <ScriptDetail :script="selectedScript" :start-polling-user-config="startPollingUserConfig" />
      </div>
      <div v-else-if="selectedMenu[0] === '3' || selectedMenu[0] === '4'" class="main-right">
        <!-- 顶部操作栏 -->
        <div v-if="selectedScript" class="detail-top-bar">
          <div class="top-bar-left">
            <a-tooltip :title="$t('action.jumpToGitHub')">
              <a-button type="text" size="small" class="action-btn" @click="jumpToGitHub">
                <LinkOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip :title="$t('action.comment')">
              <a-button type="text" size="small" class="action-btn" @click="commentModalOpen = true">
                <MessageOutlined />
              </a-button>
            </a-tooltip>
          </div>
          <div class="top-bar-right">
            <a-tooltip :title="$t('action.help')">
              <a-button type="text" size="small" class="action-btn" @click="showHelpModal = true">
                <QuestionCircleOutlined />
              </a-button>
            </a-tooltip>
          </div>
        </div>
        <StrategyDetail :script="selectedScript" :start-polling-user-config="startPollingUserConfig" />
      </div>
    </a-layout>

    <!-- 错误弹窗 -->
    <div v-if="repoError" class="repo-error-modal">
      <div class="repo-error-content">
        <div class="repo-error-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#fdecea" />
            <path d="M24 14v12" stroke="#f44336" stroke-width="3" stroke-linecap="round" />
            <circle cx="24" cy="32" r="2.5" fill="#f44336" />
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
      <a-spin size="large" :tip="`${$t('loading.repoData')}...`" />
    </div>

    <!-- 评论弹窗 -->
    <a-modal v-model:open="commentModalOpen" :title="$t('comment.title')" :footer="null" centered width="90%"
      :style="{ maxWidth: '1200px' }" @cancel="handleCommentModalCancel" class="comment-modal">
      <div class="comment-modal-content">
        <div class="comment-header">
          <div class="script-title-simple">
            {{ selectedScript?.title || $t('script.unknownScript') }}
            <template
              v-if="selectedScript?.authors && Array.isArray(selectedScript.authors) && selectedScript.authors.length">
              <span class="script-author">
                {{ $t('script.author') }}
                <template v-for="(author, idx) in selectedScript.authors" :key="author.name">
                  <template v-if="author.link">
                    <a :href="author.link" class="author-link" target="_blank" rel="noopener noreferrer">{{ author.name
                    }}</a>
                  </template>
                  <template v-else>
                    <span>{{ author.name }}</span>
                  </template>
                  <span v-if="idx < selectedScript.authors.length - 1">，</span>
                </template>
              </span>
            </template>
            <span v-else-if="selectedScript?.author" class="script-author">{{ $t('script.author') }}{{
              selectedScript.author
            }}</span>
            <span v-else class="script-author">{{ $t('script.noAuthor') }}</span>
          </div>
        </div>

        <div class="comments-container">
          <!-- 本地模式显示提示信息 -->
          <div v-if="mode === 'single'" class="local-mode-notice">
            <div class="notice-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#e3f2fd" />
                <path d="M24 12v16" stroke="#2196f3" stroke-width="3" stroke-linecap="round" />
                <circle cx="24" cy="36" r="2.5" fill="#2196f3" />
              </svg>
            </div>
            <div class="notice-title">{{ $t('comment.localModeNoticeTitle') }}</div>
            <div class="notice-desc">{{ $t('comment.localModeNoticeDesc') }}</div>
            <button class="notice-btn" @click="openExternalLink('https://bgi.sh')">{{ $t('comment.onlineRepo')
            }}</button>
          </div>

          <!-- Web模式显示giscus评论 -->
          <Giscus v-else :key="giscusKey" id="comments" :repo="giscusConfig.repo" :repoId="giscusConfig.repoId"
            :category="giscusConfig.category" :categoryId="giscusConfig.categoryId" :mapping="giscusConfig.mapping"
            :term="giscusTerm" :strict="giscusConfig.strict" :reactionsEnabled="giscusConfig.reactionsEnabled"
            :emitMetadata="giscusConfig.emitMetadata" :inputPosition="giscusConfig.inputPosition"
            :theme="giscusConfig.theme" :lang="giscusConfig.lang" loading="lazy" />
        </div>
      </div>
    </a-modal>

    <!-- 彩蛋弹窗 -->
    <a-modal v-model:open="showEggModal" :title="$t('egg.title')" :footer="null" centered width="80%"
      :style="{ maxWidth: '900px' }" @cancel="showEggModal = false">
      <div class="egg-modal-content">
        <div class="egg-readme-tabs">
          <div v-if="isLoadingEggReadme" class="egg-readme-loading-indicator">
            <a-spin size="small" />
            <span>{{ $t('egg.loading') }}</span>
          </div>
          <div v-else-if="eggReadmeError" class="egg-readme-loading-indicator">
            <a-button type="text" size="small" @click="retryLoadEggReadme">
              <template #icon>
                <ReloadOutlined />
              </template>
            </a-button>
            <span>{{ $t('egg.failed') }}</span>
          </div>
        </div>
        <div class="egg-readme-content">
          <ReadmeViewer :key="eggReadmeKey"
            :path="'https://raw.githubusercontent.com/zaodonganqi/BGI-bsw-egg/main/README.md'" :force-web="true"
            @loaded="handleEggReadmeLoaded" @error="handleEggReadmeError" />
        </div>
      </div>
    </a-modal>

    <!-- 帮助弹窗 -->
    <a-modal v-model:open="showHelpModal" :title="$t('help.title')" :footer="null" centered width="80%"
      :style="{ maxWidth: '900px' }" @cancel="showHelpModal = false">
      <Help />
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
      <a-divider v-if="mode === 'single'" />
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { FolderOutlined, FileOutlined, CalculatorOutlined, BulbOutlined, SearchOutlined, QuestionCircleOutlined, MessageOutlined, LinkOutlined, ReloadOutlined, SettingOutlined, AlignRightOutlined, CheckOutlined } from '@ant-design/icons-vue';
import { message as Message } from 'ant-design-vue';
import Giscus from '@giscus/vue';
import MapTreeList from './lists/MapTreeList.vue';
import ScriptList from './lists/ScriptList.vue';
import CombatStrategyList from './lists/CombatStrategyList.vue';
import CardStrategyList from './lists/CardStrategyList.vue';
import ScriptDetail from './details/ScriptDetail.vue';
import StrategyDetail from './details/StrategyDetail.vue';
import MapDetail from './details/MapDetail.vue';
import ReadmeViewer from './ReadmeViewer.vue';
import Help from './Help.vue';
import { getWebPath, getRawPath } from '@/utils/basePaths';
import { useI18n } from 'vue-i18n';

const mode = import.meta.env.VITE_MODE;
const selectedMenu = ref(['1']);
const search = ref('');

// 排序相关数据
const sortType = ref('recommend');
const sortOrder = ref('desc');

const { t: $t } = useI18n();

const { selectedLocale, handleLocaleChange } = defineProps({
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
  { key: '1', label: $t('menu.map'), icon: FolderOutlined, count: menuCounts.value[0] },
  { key: '2', label: $t('menu.script'), icon: FileOutlined, count: menuCounts.value[1] },
  { key: '3', label: $t('menu.combat'), icon: CalculatorOutlined, count: menuCounts.value[2] },
  { key: '4', label: $t('menu.tcg'), icon: BulbOutlined, count: menuCounts.value[3] },
]);

const menuCounts = ref([0, 0, 0, 0]);

const repoData = ref({});
const repoError = ref(false);
const globalLoading = ref(false);
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
        const response = await fetch(getRawPath() + 'repo.json', {
          signal: controller.signal
        });
        clearTimeout(fetchTimeoutId);
        fetchTimeoutId = null;
        if (!response.ok) throw new Error('Network request failed');
        repoData.value = await response.json();
      } catch (err) {
        clearTimeout(fetchTimeoutId);
        fetchTimeoutId = null;
        if (didTimeout) {
          throw new Error('Request timed out');
        } else {
          throw err;
        }
      }
    } else {
      // 先获取订阅信息
      await fetchSubscribedConfig();
      const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
      const json = await repoWebBridge.GetRepoJson();
      repoData.value = typeof json === 'string' ? JSON.parse(json) : json;
    }
    console.log("json info:", repoData.value)
    menuCounts.value[0] = getMapCount(repoData.value);
    menuCounts.value[1] = getJsCount(repoData.value);
    menuCounts.value[2] = getCombatCount(repoData.value);
    menuCounts.value[3] = getCardCount(repoData.value);
  } catch (e) {
    console.error('Failed to fetch repo info', e);
    repoError.value = true;
  }
  globalLoading.value = false;
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
const handleSortMenuClick = ({ key }) => {
  if (['recommend', 'time', 'name'].includes(key)) {
    sortType.value = key;
  } else if (['asc', 'desc'].includes(key)) {
    sortOrder.value = key;
  }
  console.log('排序设置已更新:', { sortType: sortType.value, sortOrder: sortOrder.value });
};

const handleMenuSelect = ({ key }) => {
  selectedMenu.value = [key];
  search.value = '';
  selectedScript.value = null;
};

const openExternalLink = (link) => {
  window.open(link, '_blank');
};

// 跳转到GitHub仓库指定位置
const jumpToGitHub = () => {
  if (!selectedScript.value) return;
  const baseUrl = getWebPath();
  let targetPath = '';

  // 优先使用脚本的path属性
  if (selectedScript.value.path) {
    targetPath = selectedScript.value.path;
  } else {
    // 如果没有path属性，则根据脚本名称和菜单类型构建路径
    const scriptName = selectedScript.value.name1 || selectedScript.value.name || selectedScript.value.title;
    if (!scriptName) return;

    // 根据当前选中的菜单类型构建不同的路径
    switch (selectedMenu.value[0]) {
      case '1': // 地图追踪
        targetPath = `pathing/${scriptName}`;
        break;
      case '2': // Javascript脚本
        targetPath = `js/${scriptName}`;
        break;
      case '3': // 战斗策略
        targetPath = `combat/${scriptName}`;
        break;
      case '4': // 七圣召唤策略
        targetPath = `tcg/${scriptName}`;
        break;
      default:
        targetPath = scriptName;
    }
  }

  // 清理路径，移除多余斜杠和点
  targetPath = targetPath
    .replace(/\/+/g, '/')
    .replace(/^\/|\/$/g, '');

  // 对路径进行编码，特别注意编码方括号等特殊字符
  const encodedPath = encodeURI(targetPath)
    .replace(/\[/g, '%5B')
    .replace(/\]/g, '%5D');

  const githubUrl = baseUrl + encodedPath;
  openExternalLink(githubUrl);
};

const selectedScript = ref(null);
const selectedLocation = ref(null);

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
      repoData.value = { ...repoData.value };
    });
  } else {
    console.log("updateScriptHasUpdate: 未找到匹配节点", scriptPath);
  }
};

// 地图追踪板块
const handleMapSelect = (location) => {
  selectedLocation.value = location;
  selectedScript.value = location;
};

const mapTreeRef = ref(null);
const scriptListRef = ref(null);
const combatStrategyRef = ref(null);
const cardStrategyRef = ref(null);

const handleLeafCount = (count) => {
  menuCounts.value[0] = count;
};

const handleScriptCount = (count) => {
  menuCounts.value[1] = count;
};

function getJsCount(repo) {
  const jsNode = repo.indexes.find(item => item.name === 'js');

  const hasExpandableChildren = (dataRef) => {
    if (!dataRef?.children || dataRef.children.length === 0) return false;
    return dataRef.children.some(child => child.type === 'directory');
  };

  function countLeaf(nodes) {
    if (!nodes) return 0;
    let count = 0;
    for (const node of nodes) {
      if (!hasExpandableChildren(node)) {
        count++;
      } else {
        count += countLeaf(node.children);
      }
    }
    return count;
  }
  return countLeaf(jsNode?.children);
}

function getMapCount(repo) {
  const mapNode = repo.indexes.find(item => item.name === 'pathing');

  const hasExpandableChildren = (dataRef) => {
    if (!dataRef?.children || dataRef.children.length === 0) return false;
    return dataRef.children.some(child => child.type === 'directory');
  };

  function countLeaf(nodes) {
    if (!nodes) return 0;
    let count = 0;
    for (const node of nodes) {
      if (!hasExpandableChildren(node)) {
        count++;
      } else {
        count += countLeaf(node.children);
      }
    }
    return count;
  }
  return countLeaf(mapNode?.children);
}

function getCombatCount(repo) {
  const combatNode = repo.indexes.find(item => item.name === 'combat');

  const hasExpandableChildren = (dataRef) => {
    if (!dataRef?.children || dataRef.children.length === 0) return false;
    return dataRef.children.some(child => child.type === 'directory');
  };

  function countLeaf(nodes) {
    if (!nodes) return 0;
    let count = 0;
    for (const node of nodes) {
      if (!hasExpandableChildren(node)) {
        count++;
      } else {
        count += countLeaf(node.children);
      }
    }
    return count;
  }
  return countLeaf(combatNode?.children);
}

function getCardCount(repo) {
  const cardNode = repo.indexes.find(item => item.name === 'tcg');

  function countLeaf(nodes) {
    if (!nodes) return 0;
    let count = 0;
    for (const node of nodes) {
      if (node.type === 'file') {
        count++;
      } else if (node.type === 'directory' && node.children) {
        count += countLeaf(node.children);
      }
    }
    return count;
  }

  return countLeaf(cardNode?.children);
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
});

onUnmounted(() => {
  if (fetchTimeoutId) {
    clearTimeout(fetchTimeoutId);
    fetchTimeoutId = null;
  }
});

const commentModalOpen = ref(false);

// giscus 配置
// 测试数据
//const giscusConfig = {
//  repo: 'zaodonganqi/bettergi-scripts-web',
//  repoId: 'R_kgDOOdJNqw',
//  category: 'General',
//  categoryId: 'DIC_kwDOOdJNq84CsJV3',
//  mapping: 'specific', 
//  strict: '0',
//  reactionsEnabled: '1',
//  emitMetadata: '0',
//  inputPosition: 'top',
//  theme: 'light',
//  lang: 'zh-CN'
//};
const giscusConfig = {
  repo: 'babalae/bettergi-script-web-giscus',
  repoId: 'R_kgDOPbW19A',
  category: 'General',
  categoryId: 'DIC_kwDOPbW19M4Ct_3t',
  mapping: 'specific',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  theme: 'light',
  lang: 'zh-CN'
};

// 强制 Giscus 组件重新渲染的 key
const giscusKey = ref(0);

// 计算 giscus term，用于区分不同脚本的评论
const giscusTerm = computed(() => {
  if (!selectedScript.value) return 'default';
  return selectedScript.value.path || selectedScript.value.title || 'default';
});

// 监听 giscusTerm 变化，强制重新渲染 Giscus 组件
watch(giscusTerm, (newTerm, oldTerm) => {
  if (newTerm !== oldTerm) {
    giscusKey.value++;
  }
});

// 监听评论弹窗打开
watch(commentModalOpen, (newVal) => {
  if (newVal) {
    console.log('Comment modal opened, current script:', selectedScript.value);
  }
});

const handleCommentModalCancel = () => {
  commentModalOpen.value = false;
};

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
  sortType.value = 'recommend';
  sortOrder.value = 'desc';
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
    repoData.value = { ...repoData.value };
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

.ant-menu-item-selected {
  background: #181822 !important;
  color: #000 !important;
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
  flex-shrink: 0;
}

.top-bar-left {
  display: flex;
  gap: 8px;
}

.top-bar-right {
  display: flex;
  gap: 8px;
}

.action-btn {
  color: #444;
  border: none;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

.main-right>div:last-child {
  flex: 1;
  overflow: hidden;
}

.strategy-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.strategy-tabs :deep(.ant-tabs-content) {
  flex: 1;
  overflow-y: auto;
}

.strategy-list {
  padding: 8px;
}

.strategy-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.strategy-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.strategy-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.strategy-title {
  font-size: 16px;
  font-weight: 500;
  color: #222;
}

.strategy-tag {
  font-size: 12px;
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.strategy-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.strategy-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.strategy-author {
  color: #1890ff;
}

.strategy-date {
  color: #999;
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

.comment-modal {
  border-radius: 12px;
  overflow: hidden;
}

.comment-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.comment-modal :deep(.ant-modal-header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 24px;
}

.comment-modal :deep(.ant-modal-title) {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.comment-modal :deep(.ant-modal-body) {
  padding: 0;
  max-height: 90vh;
  overflow: hidden;
}

.comment-modal-content {
  padding: 0;
  max-width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.comment-header {
  margin: 0;
  padding: 16px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.script-title-simple {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 8px;
}

.script-author {
  font-size: 14px;
  font-weight: 400;
  color: #666;
  opacity: 0.8;
}

.author-link {
  color: #1677ff;
  text-decoration: none;
}

.author-link:hover {
  text-decoration: underline;
}

.comments-container {
  flex: 1;
  max-height: calc(90vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  position: relative;
  width: 100%;
}

.comments-container :deep(.giscus) {
  border: none;
  border-radius: 0;
  background: transparent;
  width: 100%;
  min-width: 100%;
}

@media (max-width: 1400px) {
  .comment-modal {
    width: 95% !important;
    margin: 10px;
  }

  .comment-modal :deep(.ant-modal-body) {
    max-height: 85vh;
  }

  .comments-container {
    max-height: calc(85vh - 60px);
  }
}

@media (max-width: 768px) {
  .comment-modal {
    width: 98% !important;
    margin: 5px;
  }

  .comment-modal :deep(.ant-modal-body) {
    max-height: 90vh;
  }

  .comments-container {
    max-height: calc(90vh - 60px);
  }

  .comment-header {
    padding: 12px 16px;
  }

  .script-title-simple {
    font-size: 16px;
  }
}

.local-mode-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  height: 100%;
  min-height: 400px;
}

.notice-icon {
  margin-bottom: 24px;
}

.notice-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.notice-desc {
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.5;
}

.notice-btn {
  background: linear-gradient(135deg, #1677ff 0%, #096dd9 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
}

.notice-btn:hover {
  background: linear-gradient(135deg, #096dd9 0%, #0050b3 100%);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
  transform: translateY(-1px);
}

.notice-btn:active {
  transform: translateY(0);
}

.egg-modal-content {
  max-height: 65vh;
  overflow-y: overlay;
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


.egg-readme-loading {
  text-align: center;
  padding: 48px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.egg-readme-error {
  text-align: center;
  padding: 48px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
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

.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
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

.script-actions-mask {
  position: absolute;
  left: -8px;
  top: -8px;
  width: calc(100% + 16px);
  height: calc(100% + 16px);
  background: rgba(255, 255, 255, 0.88);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: #888;
  border-radius: 10px;
  pointer-events: all;
  box-sizing: border-box;
  padding: 8px 0;
}

.subscribed-error-msg {
  font-size: 15px;
}

.sider-settings-btn-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0 12px 0;
  background: #f7f8fa;
  border-top: 1px solid #ececec;
}

.settings-btn {
  margin-left: auto;
  color: #888;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  width: 36px;
}

.settings-btn:hover {
  background: #f0f5ff;
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

.lang-select-dropdown {
  font-size: 15px;
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

.last-update-time {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
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

<template>
  <a-layout class="main-layout">
    <!-- 左侧菜单 -->
    <div class="custom-sider">
      <div class="sider-header">
        <div class="sider-logo" :title="$t('sider.document')" @click="mainStore.openExternalLink('https://bettergi.com/')"></div>
        <span class="repo-title">{{ $t('sider.repoTitle') }}</span>
      </div>
      <div class="sider-menu-wrap">
        <div class="menu-content">
          <a-menu v-model:selectedKeys="mainStore.selectedMenu" mode="vertical" class="custom-menu" @select="mainStore.handleMenuSelect">
            <a-menu-item v-for="item in mainStore.menuList" :key="item.key" class="custom-menu-item">
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
          <div class="sider-link" @click="mainStore.openExternalLink('https://github.com/babalae/better-genshin-impact')">
            {{ $t('sider.mainRepo') }}
          </div>
          <div class="sider-link" @click="mainStore.openExternalLink('https://github.com/babalae/bettergi-scripts-list')">
            {{ $t('sider.scriptRepo') }}
          </div>
          <div v-if="mainStore.isModeSingle" class="sider-link" @click="mainStore.openExternalLink('https://bgi.sh')">
            {{ $t('sider.onlineRepo') }}
          </div>
          <div class="sider-link" @click="mainStore.openExternalLink('https://bettergi.com/open.html')">
            {{ $t('sider.otherExtensions') }}
          </div>
          <div class="sider-link" @click="mainStore.openExternalLink('https://bettergi.com/doc.html')">
            {{ $t('sider.document') }}
          </div>
        </div>
      </div>
      <!-- 最后更新时间 -->
      <div v-if="mainStore.lastUpdateTime" class="last-update-time" @click="mainStore.showEggModal = true">
        <div class="update-content" :class="{ 'column-mode': mainStore.isModeSingle }">
          <template v-if="mainStore.isModeSingle">
            <div class="update-label">{{ $t('sider.lastUpdate') }}</div>
            <div class="update-time">{{ mainStore.lastUpdateTime }}</div>
          </template>
          <template v-else>
            <span>{{ $t('sider.lastUpdate') + mainStore.lastUpdateTime }}</span>
          </template>
        </div>
      </div>
    </div>

    <!-- 中间内容区域 -->
    <div class="script-slider" :style="{ width: scriptSliderWidth + 'px' }">
      <div class="script-header">
        <span class="script-title">{{ mainStore.currentMenuTitle }}</span>
        <div v-if="mainStore.isModeSingle" class="script-actions">
          <a-button :type="mainStore.scriptTab === 'all' ? 'primary' : 'default'"
                    class="script-btn"
                    @click="mainStore.onClickShowAll">{{ $t('button.all') }}
          </a-button>
          <a-button :type="mainStore.scriptTab === 'subscribed' ? 'primary' : 'default'"
                    class="script-btn"
                    @click="mainStore.onClickShowSubscribed">{{ $t('button.subscribed') }}
          </a-button>
        </div>
      </div>
      <div class="search-section">
        <a-input v-model:value="mainStore.search" :placeholder="mainStore.searchPlaceholder" class="script-search" @change="mainStore.handleSearch"
                 allow-clear>
          <template #prefix>
            <SearchOutlined/>
          </template>
        </a-input>
        <a-dropdown v-if="mainStore.selectedMenu[0] !== '1'" placement="bottomLeft" :trigger="'click'" class="sort-dropdown"
                    v-model:open="mainStore.sortDropdownOpen">
          <a-button class="sort-button" size="middle">
            <AlignRightOutlined/>
          </a-button>
          <template #overlay>
            <a-menu class="sort-menu" @click="mainStore.handleSortMenuClick">
              <a-menu-item-group :title="$t('sort.sortBy')">
                <a-menu-item v-if="hasSearchKey" key="relevance" :class="{ active: mainStore.sortType === 'relevance' }">
                  <span>{{ $t('sort.relevance') }}</span>
                  <CheckOutlined v-if="mainStore.sortType === 'relevance'" class="check-icon"/>
                </a-menu-item>
                <a-menu-item key="time" :class="{ active: mainStore.sortType === 'time' }">
                  <span>{{ $t('sort.time') }}</span>
                  <CheckOutlined v-if="mainStore.sortType === 'time'" class="check-icon"/>
                </a-menu-item>
                <a-menu-item key="random" :class="{ active: mainStore.sortType === 'random' }">
                  <span>{{ $t('sort.random') }}</span>
                  <CheckOutlined v-if="mainStore.sortType === 'random'" class="check-icon"/>
                </a-menu-item>
                <a-menu-item key="name" :class="{ active: mainStore.sortType === 'name' }">
                  <span>{{ $t('sort.name') }}</span>
                  <CheckOutlined v-if="mainStore.sortType === 'name'" class="check-icon"/>
                </a-menu-item>
              </a-menu-item-group>
              <a-menu-divider/>
              <a-menu-item-group :title="$t('sort.sortOrder')">
                <a-menu-item key="asc" :class="{ active: mainStore.sortOrder === 'asc' }">
                  <span>{{ $t('sort.ascending') }}</span>
                  <CheckOutlined v-if="mainStore.sortOrder === 'asc'" class="check-icon"/>
                </a-menu-item>
                <a-menu-item key="desc" :class="{ active: mainStore.sortOrder === 'desc' }">
                  <span>{{ $t('sort.descending') }}</span>
                  <CheckOutlined v-if="mainStore.sortOrder === 'desc'" class="check-icon"/>
                </a-menu-item>
              </a-menu-item-group>
              <a-menu-divider v-if="mainStore.selectedMenu[0] === '3'"/>
              <a-sub-menu v-if="mainStore.selectedMenu[0] === '3'">
                <template #title>
                  <span>{{ $t('sort.filterByRole') }}</span>
                </template>
                <div class="role-filter-panel" @mousedown.stop @click.stop>
                  <a-input v-model:value="mainStore.roleFilterSearch" size="middle" class="role-filter-search"
                           :placeholder="$t('sort.searchRole')">
                    <template #prefix>
                      <SearchOutlined/>
                    </template>
                  </a-input>
                  <div class="role-filter-list">
                    <a-checkbox
                        v-for="tag in mainStore.displayedRoleTags"
                        :key="tag"
                        :checked="mainStore.selectedRoleTags.includes(tag)"
                        :disabled="!mainStore.selectedRoleTags.includes(tag) && mainStore.selectedRoleTags.length >= 4"
                        class="role-filter-checkbox"
                        @change="mainStore.onRoleCheckboxChange(tag, $event)"
                    >
                      <span class="role-filter-label">{{ tag }}</span>
                    </a-checkbox>
                  </div>
                  <div class="role-filter-footer">
                    <a-button size="middle" class="role-filter-btn" @click="mainStore.resetRoleFilter">
                      {{ $t('common.reset') }}
                    </a-button>
                    <a-button size="middle" type="primary" class="role-filter-btn-primary" @click="mainStore.confirmRoleFilter">
                      {{ $t('common.confirm') }}
                    </a-button>
                  </div>
                </div>
              </a-sub-menu>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <!-- 地图追踪的树状结构 -->
      <div v-if="mainStore.selectedMenu[0] === '1'" class="script-list">
        <MapTreeList/>
      </div>
      <!-- Javascript脚本列表 -->
      <div v-else-if="mainStore.selectedMenu[0] === '2'" class="script-list">
        <ScriptList/>
      </div>
      <!-- 战斗策略列表 -->
      <div v-else-if="mainStore.selectedMenu[0] === '3'" class="script-list">
        <CombatStrategyList/>
      </div>
      <!-- 七圣召唤策略列表 -->
      <div v-else-if="mainStore.selectedMenu[0] === '4'" class="script-list">
        <CardStrategyList/>
      </div>
    </div>

    <!-- 拖动分隔条 -->
    <div class="resize-handle" @mousedown="startResize"></div>

    <!-- 右侧内容区域 -->
    <a-layout class="main-right">
      <!-- 顶部操作栏 -->
      <div class="detail-top-bar">
        <div class="top-bar-left">
          <a-tooltip v-if="mainStore.isModeSingle" :title="$t('action.update')">
            <a-button type="text" class="action-btn" @click="settings.showUpdateMessageModal = true">
              <FieldTimeOutlined />
            </a-button>
          </a-tooltip>
          <a-tooltip v-if="mainStore.isModeSingle" :title="$t('action.subscribe')">
            <a-button type="text" class="action-btn" @click="mainStore.showUpdateSubscribeModal = true">
              <CloudDownloadOutlined />
            </a-button>
          </a-tooltip>
        </div>
        <div class="top-bar-right">
          <a-tooltip :title="$t('action.plan')">
            <a-button type="text" class="action-btn" @click="mainStore.showPlanModal = true">
              <EditOutlined />
            </a-button>
          </a-tooltip>
          <a-tooltip :title="$t('action.help')">
            <a-button type="text" class="action-btn" @click="mainStore.showHelpModal = true">
              <QuestionCircleOutlined/>
            </a-button>
          </a-tooltip>
          <a-tooltip :title="$t('settings.title')">
            <a-button type="text" class="action-btn" @click="settings.showSettingsModal = true">
              <SettingOutlined/>
            </a-button>
          </a-tooltip>
        </div>
      </div>
      <div v-if="mainStore.selectedMenu[0] === '1'" class="main-right-container">
        <MapDetail/>
      </div>
      <div v-else-if="mainStore.selectedMenu[0] === '2'" class="main-right-container">
        <ScriptDetail/>
      </div>
      <div v-else-if="mainStore.selectedMenu[0] === '3' || mainStore.selectedMenu[0] === '4'" class="main-right-container">
        <StrategyDetail/>
      </div>
    </a-layout>

    <!-- 错误弹窗 -->
    <div v-if="mainStore.repoError"
         class="repo-error-modal">
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
          <a-button class="repo-error-btn" @click="mainStore.getRepoJson" type="primary" danger>{{ $t('repoError.refresh') }}</a-button>
          <a-button class="repo-help-btn" @click="mainStore.showHelpModal = true" type="primary">{{ $t('repoError.help') }}</a-button>
        </div>
      </div>
    </div>

    <!-- 全局加载弹窗 -->
    <div v-if="mainStore.globalLoading"
         class="global-loading-modal">
      <a-spin size="large" :tip="`${$t('loading.repoData')}...`"/>
    </div>

    <!-- 彩蛋弹窗 -->
    <a-modal v-model:open="mainStore.showEggModal"
             :title="$t('egg.title')"
             :footer="null"
             centered width="80%"
             :style="{ maxWidth: '900px' }"
             :destroyOnClose="true"
             @cancel="mainStore.showEggModal = false">
      <div class="egg-modal-content">
        <div class="egg-readme-tabs">
          <div v-if="mainStore.isLoadingEggReadme" class="egg-readme-loading-indicator">
            <a-spin size="small"/>
            <span>{{ $t('egg.loading') }}</span>
          </div>
          <div v-else-if="mainStore.eggReadmeError" class="egg-readme-loading-indicator">
            <a-button type="text" size="small" @click="mainStore.retryLoadEggReadme">
              <template #icon>
                <ReloadOutlined/>
              </template>
            </a-button>
            <span>{{ $t('egg.failed') }}</span>
          </div>
        </div>
        <div class="egg-readme-content">
          <ReadmeViewer :path="'https://raw.githubusercontent.com/zaodonganqi/BGI-bsw-egg/main/README.md'"
                        :force-web="true"
                        @loaded="mainStore.handleEggReadmeLoaded"
                        @error="mainStore.handleEggReadmeError"/>
        </div>
      </div>
    </a-modal>

    <!-- 更新信息弹窗 -->
    <a-modal v-model:open="settings.showUpdateMessageModal"
             :title="$t('action.recent')"
             :footer="null"
             centered width="50%"
             :style="{ maxWidth: '900px' }">
      <div class="update-message-content">
        <a-list :data-source="mainStore.updatedScripts" size="small">
          <template #renderItem="{ item, index }">
            <div class="update-list-item">
              <div class="item-header">
                <span class="item-index">{{ index + 1 }}.</span>
                <span class="item-title">{{ item.name }}</span>
              </div>
              <div class="item-path">{{ item.path }}</div>
              <div class="item-time" v-if="item.lastUpdated">{{ $t('detail.lastUpdated') }}:{{ item.lastUpdated }}</div>
            </div>
          </template>
        </a-list>
      </div>
      <div class="update-modal-footer">
        <a-button type="primary" size="middle" @click="settings.handleClearUpdate(mainStore)" :loading="settings.clearUpdateLoading">
          {{ $t('action.clearDot') }}
        </a-button>
      </div>
    </a-modal>

    <!-- 一键更新弹窗 -->
    <a-modal
      v-model:open="mainStore.showUpdateSubscribeModal"
      :title="$t('action.updateAll')"
      :ok-text="$t('action.confirm')"
      :cancel-text="$t('action.cancel')"
      centered
      width="50%"
      :style="{ maxWidth: '900px' }"
      @ok="mainStore.updateSubscribedScripts"
      :confirmLoading="mainStore.updatingSubscribed"
      :maskClosable="!mainStore.updatingSubscribed"
      :keyboard="!mainStore.updatingSubscribed"
      :closable="!mainStore.updatingSubscribed"
      :cancelButtonProps="{ disabled: mainStore.updatingSubscribed }"
    >
      <div class="update-subscribe-content">
        <a-list :data-source="mainStore.subscribedScripts" size="small">
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

    <!-- 更新计划弹窗 -->
    <a-modal v-model:open="mainStore.showPlanModal"
             :title="$t('plan.title')"
             :footer="null"
             centered width="80%"
             :style="{ maxWidth: '900px' }"
             @cancel="mainStore.showPlanModal = false">
      <Plan/>
    </a-modal>

    <!-- 帮助弹窗 -->
    <a-modal v-model:open="mainStore.showHelpModal"
             :title="$t('help.title')"
             :footer="null"
             centered width="80%"
             :style="{ maxWidth: '900px' }"
             @cancel="mainStore.showHelpModal = false">
      <Help/>
    </a-modal>

    <!-- 设置弹窗 -->
    <a-modal v-model:open="settings.showSettingsModal"
             :title="$t('settings.title')"
             :footer="null"
             centered width="400px"
             @cancel="settings.showSettingsModal = false">
      <div class="settings-row">
        <span class="settings-label">{{ $t('settings.language') }}</span>
        <a-select :value="settings.selectedLocale" size="middle" style="width: 160px;" @change="onLocaleChange"
                  popupClassName="lang-select-dropdown">
          <a-select-option value="zh-CN">{{ $t('settings.zhCN') }}</a-select-option>
          <a-select-option value="zh-TW">{{ $t('settings.zhTW') }}</a-select-option>
          <a-select-option value="en-US">{{ $t('settings.enUS') }}</a-select-option>
          <a-select-option value="ja-JP">{{ $t('settings.jaJP') }}</a-select-option>
          <a-select-option value="fr-FR">{{ $t('settings.frFR') }}</a-select-option>
        </a-select>
      </div>
      <a-divider/>
      <div class="settings-row">
        <span class="settings-label">{{ $t('settings.theme') }}</span>
        <a-select :value="settings.selectedThemeName" size="middle" style="width: 160px;" @change="settings.onThemeChange"
                  popupClassName="lang-select-dropdown">
          <a-select-option value="light">{{ $t('settings.light') }}</a-select-option>
          <a-select-option value="dark">{{ $t('settings.dark') }}</a-select-option>
          <a-select-option value="egg">{{ $t('settings.egg') }}</a-select-option>
        </a-select>
      </div>
      <a-divider v-if="mainStore.isModeSingle"/>
      <div v-if="mainStore.isModeSingle" class="settings-row">
        <span class="settings-label">{{ $t('settings.clearUpdate') }}</span>
        <a-button type="primary" size="middle" @click="settings.handleClearUpdate(mainStore)" :loading="settings.clearUpdateLoading">
          {{ $t('settings.clearUpdateBtn') }}
        </a-button>
      </div>
    </a-modal>
    
    <!-- 安全声明弹窗 -->
    <a-modal
      v-model:open="settings.showSafetyModal"
      :title="$t('settings.eggSafetyTitle')"
      :ok-text="$t('settings.eggSafetyOk')"
      :cancel-text="$t('settings.eggSafetyCancel') || $t('action.cancel')"
      centered
      width="520px"
      @ok="settings.useTheme()"
      @cancel="() => settings.cancelSafety()"
    >
      <div class="safety-modal-content">
        <div class="safety-warning-icon" aria-hidden="true">⚠</div>
        <div class="safety-text">{{ $t('settings.eggSafetyDesc') }}</div>
      </div>
    </a-modal>
  </a-layout>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref} from 'vue';
import {useSettingsStore} from '@/stores/settingsStore.js';
import {
  AlignRightOutlined,
  CheckOutlined,
  CloudDownloadOutlined,
  EditOutlined,
  FieldTimeOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined
} from '@ant-design/icons-vue';
import MapTreeList from './lists/MapTreeList.vue';
import ScriptList from './lists/ScriptList.vue';
import CombatStrategyList from './lists/CombatStrategyList.vue';
import CardStrategyList from './lists/CardStrategyList.vue';
import ScriptDetail from './details/ScriptDetail.vue';
import StrategyDetail from './details/StrategyDetail.vue';
import MapDetail from './details/MapDetail.vue';
import ReadmeViewer from './items/ReadmeViewer.vue';
import Help from './items/Help.vue';
import {useI18n} from 'vue-i18n';
import Plan from "./items/Plan.vue";
import {useMainStore} from "@/stores/mainStore.js";

const mainStore = useMainStore();
const settings = useSettingsStore();

// 布局宽度管理
const scriptSliderWidth = ref(0);
const isResizing = ref(false);

// 宽度限制常量
const SCRIPT_MIN_WIDTH = 250;
const SCRIPT_MAX_WIDTH = 700;

// 动态计算两列布局阈值
const getTwoColumnThreshold = () => {
  const windowWidth = window.innerWidth;
  return Math.max(windowWidth * 0.20, 400);
};

// 缓存键名
const SCRIPT_WIDTH_CACHE_KEY = 'script-slider-width';

// 保存宽度到缓存
const saveWidthToCache = (width) => {
  localStorage.setItem(SCRIPT_WIDTH_CACHE_KEY, width.toString());
};

// 从缓存读取宽度
const getWidthFromCache = () => {
  const cachedWidth = localStorage.getItem(SCRIPT_WIDTH_CACHE_KEY);
  if (cachedWidth) {
    const width = parseInt(cachedWidth, 10);
    // 验证宽度是否在有效范围内
    if (width >= SCRIPT_MIN_WIDTH && width <= SCRIPT_MAX_WIDTH) {
      return width;
    }
  }
  return null;
};

// 初始化布局宽度
const initLayoutWidths = () => {
  // 优先使用缓存的宽度
  const cachedWidth = getWidthFromCache();
  let newWidth;
  
  if (cachedWidth) {
    // 使用缓存的宽度
    newWidth = cachedWidth;
  } else {
    // 使用默认宽度
    const windowWidth = window.innerWidth;
    const defaultScriptWidth = Math.min(windowWidth * 0.23, 500);
    newWidth = Math.min(Math.max(defaultScriptWidth, SCRIPT_MIN_WIDTH), SCRIPT_MAX_WIDTH);
  }
  
  scriptSliderWidth.value = newWidth;
  
  // 初始化时设置两列布局状态判断
  mainStore.isListTwoColumn = newWidth >= getTwoColumnThreshold();
};

// 拖动处理（第二栏和第三栏之间）
const handleResize = (e) => {
  if (!isResizing.value) return;

  const windowWidth = window.innerWidth;
  const leftSliderWidth = Math.min(windowWidth * 0.18, 300);
  const mouseX = e.clientX;
  
  // 计算第二栏的右边界位置
  const scriptRightBoundary = leftSliderWidth + 3;

  // 设置最终宽度
  const newWidth = Math.min(Math.max(mouseX - scriptRightBoundary, SCRIPT_MIN_WIDTH), SCRIPT_MAX_WIDTH);
  scriptSliderWidth.value = newWidth;
  
  // 更新 mainStore 中的两列布局状态
  mainStore.isListTwoColumn = newWidth >= getTwoColumnThreshold();
  
  // 保存宽度到缓存
  saveWidthToCache(newWidth);
};


// 拖动开始（第二栏和第三栏之间）
const startResize = (e) => {
  isResizing.value = true;
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  e.preventDefault();
};

// 拖动结束（第二栏和第三栏之间）
const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
};


// 窗口大小变化处理
const handleWindowResize = () => {
  if (!isResizing.value) {
    initLayoutWidths();
  }
};

// 判断是否有搜索关键词
const hasSearchKey = computed(() => {
  return mainStore.search && mainStore.search.trim() !== '';
});

// 采用vue-i18n组件获取选中语言的文本
const {t: $t} = useI18n();

// 挂载时获取仓库数据并应用部分排序
onMounted(() => {
  mainStore.getRepoJson();
  if (['2', '3', '4'].includes(mainStore.selectedMenu[0])) {
    mainStore.applySortForMenu(mainStore.selectedMenu[0]);
  }
  mainStore.selectedRoleTags = [...mainStore.appliedRoleTags];
  
  // 初始化布局宽度
  initLayoutWidths();
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleWindowResize);
});

// 组件卸载时清理事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize);
  if (isResizing.value) {
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  }
});

// 选择语言切换
function onLocaleChange(val) {
  mainStore.onLocaleChange(val);
  settings.setLocale(val);
  settings.showSettingsModal = false;
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  width: 100%;
  margin: 0;
  display: flex;
  flex-flow: row;
}

.custom-sider {
  width: 18% !important;
  max-width: 300px !important;
  border-right: 1px solid var(--border-base);
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
  border-bottom: 1px solid var(--border-base);
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
  width: 100%;
  background-color: var(--bg-menu);
}

.custom-menu-item {
  display: flex;
  align-items: center;
  font-size: 15px;
  border-radius: 8px;
  margin: 0 8px;
  padding: 0 16px !important;
  min-width: 0;
  height: auto;
}

:deep(.ant-menu-item-selected) {
  background: var(--bg-item-selected);
  color: var(--color-primary);
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
  font-size: 13px;
  margin-left: 8px;
  flex-shrink: 0;
  color: var(--text-base3);
}

.sider-footer {
  padding: 24px 16px;
  font-size: 14px;
  border-top: 1px solid var(--border-base);
  color: var(--text-base3);
  width: 100%;
  flex-shrink: 0;
}

.sider-link {
  margin-bottom: 12px;
  cursor: pointer;
}

.last-update-time {
  padding: 12px 25px;
  font-size: 12px;
  border-top: 1px solid var(--border-base);
  color: var(--text-base2);
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
  font-size: 15px;
}

.script-slider {
  border-right: 1px solid var(--border-base);
  background: var(--bg-menu);
  height: 100%;
  position: relative;
  flex-shrink: 0;
}

.script-header {
  height: 60px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-base);
}

.script-title {
  font-size: 16px;
  font-weight: 600;
}

.script-actions {
  position:relative;
  display: flex;
  gap: 8px;
}

.script-btn {
  height: 30px;
  padding: 0 12px;
  font-size: 14px;
}

.search-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 60px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-base);
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
  border: 1px solid var(--border-base);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  padding: 0;
  box-shadow: none;
  transition: all 0.2s;
}

.sort-button:focus {
  outline: none;
  color: var(--color-primary);
  border-color: var(--color-primary);
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
  border-top: 1px solid var(--border-base);
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

.sort-menu .check-icon {
  color: var(--color-primary);
  font-size: 14px;
  margin-left: 8px;
}

.sort-menu .ant-menu-item-group-title {
  font-size: 13px;
  font-weight: 600;
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
}

.main-right {
  flex: 1;
  height: 100%;
}

:deep(.main-right.ant-layout) {
  background: var(--bg-container);
  display: flex;
  flex-direction: column;
}

.main-right-container {
  flex: 1;
  height: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.detail-top-bar {
  height: 60px;
  border-bottom: 1px solid var(--border-base);
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
  border: none;
  padding: 3px 8px;
  border-radius: 6px;
  color: var(--text-base2);
  transition: all 0.2s;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  font-size: 18px;
  padding: 36px 48px 32px 48px;
  border-radius: 16px;
  box-shadow: 0 8px 32px var(--border-base);
  background: var(--bg-container);
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
  color: var(--text-error);
}

.repo-error-desc {
  font-size: 15px;
  margin-bottom: 24px;
  color: var(--text-base2);
}

.repo-error-btn-group {
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: center;
  margin-top: 8px;
}

.repo-error-btn {
  height: 40px;
  width: 120px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}

:deep(.ant-btn-primary.ant-btn-dangerous) {
  box-shadow: none;
}

.repo-help-btn {
  height: 40px;
  width: 120px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  justify-content: center;
  transition: background 0.2s, box-shadow 0.2s;
}

.global-loading-modal {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.30);
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
  border-bottom: 1px solid var(--border-base);
}

.update-list-item:last-child {
  border-bottom: none;
}

.item-header {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.item-index {
  font-size: 15px;
  font-weight: bold;
  margin-right: 6px;
}

.item-title {
  word-break: break-all;
}

.item-path {
  font-size: 13px;
  margin-top: 4px;
  color: var(--text-base2);
  word-break: break-all;
}

.item-time {
  font-size: 13px;
  margin-top: 4px;
  color: var(--text-base2);
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

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.settings-label {
  font-size: 15px;
  font-weight: 500;
}

.update-label {
  font-size: 15px;
  line-height: 1.2;
}

.update-time {
  font-size: 14px;
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

.safety-modal-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.safety-warning-icon {
  font-size: 22px;
  line-height: 1;
  color: var(--text-error);
  margin-top: 2px;
}

.safety-text {
  color: var(--text-base);
  font-size: 14px;
}

.resize-handle {
  width: 3px;
  height: 100%;
  background: transparent;
  cursor: col-resize;
  position: relative;
  flex-shrink: 0;
}

.resize-handle:hover {
  background: var(--color-primary);
  opacity: 0.3;
}

.resize-handle:active {
  background: var(--color-primary);
  opacity: 0.3;
}
</style>


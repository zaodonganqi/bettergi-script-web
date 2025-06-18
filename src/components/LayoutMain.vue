<template>
  <a-layout class="main-layout">
    <!-- 左侧菜单 -->
    <a-layout-sider class="custom-sider">
      <div class="sider-header">
        <div class="sider-logo" title="访问 BetterGI 官网" @click="openExternalLink"></div>
        <a-select v-model:value="selectedValue" class="repo-select" @change="handleChange">
          <a-select-option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-select-option>
        </a-select>
      </div>
      <div class="sider-menu-wrap">
        <a-menu v-model:selectedKeys="selectedMenu" mode="inline" class="custom-menu" @select="handleMenuSelect">
          <a-menu-item v-for="item in menuList" :key="item.key" class="custom-menu-item">
            <span class="menu-icon">
              <component :is="item.icon" />
            </span>
            <span class="menu-label">{{ item.label }}</span>
            <span v-if="item.count !== undefined" class="menu-count">{{ item.count }}</span>
          </a-menu-item>
        </a-menu>
      </div>
      <div class="sider-footer">
        <div class="sider-link">外链1</div>
        <div class="sider-link">外链2</div>
      </div>
    </a-layout-sider>

    <!-- 中间内容区域 -->
    <a-layout-sider class="script-sider">
      <div class="script-header">
        <span class="script-title">{{ currentMenuTitle }}</span>
        <div class="script-actions">
          <a-button type="primary" class="script-btn script-btn-all">全部</a-button>
          <a-button class="script-btn">已订阅</a-button>
        </div>
      </div>
      <div class="search-section">
        <a-input v-model:value="search" :placeholder="searchPlaceholder" class="script-search" @search="handleSearch" allow-clear>
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
      </div>
      <!-- 地图追踪的树状结构 -->
      <div v-if="selectedMenu[0] === '1'" class="script-list">
        <MapTreeList ref="mapTreeRef" :search-key="search" @select="handleMapSelect" />
      </div>
      <!-- Javascript脚本列表 -->
      <div v-else-if="selectedMenu[0] === '2'" class="script-list">
        <ScriptList :search-key="search" ref="scriptListRef" @select="handleScriptSelect" />
      </div>
      <!-- 战斗策略列表 -->
      <div v-else-if="selectedMenu[0] === '3'" class="script-list">
        <CombatStrategyList :search-key="search" ref="combatStrategyRef" @select="handleScriptSelect" />
      </div>
      <!-- 七圣召唤策略列表 -->
      <div v-else-if="selectedMenu[0] === '4'" class="script-list">
        <CardStrategyList :search-key="search" ref="cardStrategyRef" @select="handleScriptSelect" />
      </div>
    </a-layout-sider>

    <!-- 右侧内容区域 -->
    <a-layout class="main-right">
      <ScriptDetail :script="selectedScript" />
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { FolderOutlined, FileOutlined, CalculatorOutlined, BulbOutlined, SearchOutlined } from '@ant-design/icons-vue';
import MapTreeList from './lists/MapTreeList.vue';
import ScriptList from './lists/ScriptList.vue';
import CombatStrategyList from './lists/CombatStrategyList.vue';
import CardStrategyList from './lists/CardStrategyList.vue';
import ScriptDetail from './ScriptDetail.vue';

const selectedMenu = ref(['1']);
const search = ref('');

const menuList = [
  { key: '1', label: '地图追踪', icon: FolderOutlined, count: 128 },
  { key: '2', label: 'Javascript 脚本', icon: FileOutlined, count: 9 },
  { key: '3', label: '战斗策略', icon: CalculatorOutlined, count: 4 },
  { key: '4', label: '七圣召唤策略', icon: BulbOutlined, count: 23 },
];

const options = ref([
  { value: 1, label: '本地仓库' },
  { value: 2, label: '中央仓库' },
  { value: 3, label: '镜像仓库' },
]);

const selectedValue = ref(1);

// 计算当前菜单标题
const currentMenuTitle = computed(() => {
  const current = menuList.find(item => item.key === selectedMenu.value[0]);
  return current ? current.label : '';
});

// 计算搜索框占位符
const searchPlaceholder = computed(() => {
  switch (selectedMenu.value[0]) {
    case '1':
      return '搜索地图位置';
    case '2':
      return '搜索脚本';
    case '3':
      return '搜索战斗策略';
    case '4':
      return '搜索七圣召唤策略';
    default:
      return '输入关键词查询';
  }
});

const handleChange = (value) => {
  console.log('选择仓库变化: ', value);
};

const handleSearch = (value) => {
  search.value = value;
};

const handleMenuSelect = ({ key }) => {
  selectedMenu.value = [key];
  search.value = '';
};

const openExternalLink = () => {
  window.open('https://bettergi.com/', '_blank', 'fullscreen=yes,width=1920,height=1080');
};

const selectedScript = ref(null);
const selectedLocation = ref(null);

const handleScriptSelect = (script) => {
  selectedScript.value = script;
};

const handleMapSelect = (location) => {
  selectedLocation.value = location;
  selectedScript.value = location; // 使用同一个详情组件
};
</script>

<style scoped>
.main-layout {
  height: calc(100vh - 20px);
  width: calc(100% - 20px);
  margin: 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  background: #fff;
  display: flex;
}

.custom-sider {
  width: 320px !important;
  min-width: 320px !important;
  max-width: 320px !important;
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

.sider-title {
  letter-spacing: 1px;
}

.sider-menu-wrap {
  padding: 8px;
  height: 100%;
  width: 100%;
  overflow-y: auto;
}

.repo-select {
  width: 100%;
  margin-left: 10px;
}

.repo-select :deep(.ant-select-selector) {
  height: 36px !important;
  padding: 4px 12px !important;
  font-size: 15px !important;
}

.repo-select :deep(.ant-select-selection-item) {
  line-height: 28px !important;
}

.custom-menu {
  background: transparent !important;
  border: none;
  width: 100%;
}

.custom-menu-item {
  height: 44px !important;
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #222;
  border-radius: 8px;
  margin: 0 8px;
  padding: 0 16px !important;
  transition: background 0.2s;
}

.ant-menu-item-selected {
  background: #181822 !important;
  color: #000 !important;
}

.menu-icon {
  margin-right: 10px;
  font-size: 18px;
}

.menu-label {
  flex: 1;
}

.menu-count {
  color: #b0b0b0;
  font-size: 13px;
  margin-left: 8px;
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
  margin-bottom: 8px;
  cursor: pointer;
}

.script-sider {
  width: 320px !important;
  min-width: 320px !important;
  max-width: 320px !important;
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
}

.script-btn-all {
  border: none !important;
}

.search-section {
  height: 60px;
  padding: 12px 16px;
  border-bottom: 1px solid #ececec;
}

.script-search {
  width: 100%;
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
  padding: 8px;
  background: #f7f8fa;
}

.main-right {
  flex: 1;
  background: #f5f6fa;
  padding: 24px;
  overflow-y: auto;
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
</style>
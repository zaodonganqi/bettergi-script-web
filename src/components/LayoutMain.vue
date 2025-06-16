<template>
  <a-layout class="main-layout">
    <!-- 左侧菜单 -->
    <a-layout-sider class="custom-sider">
      <div class="sider-header">
        <div 
          class="sider-logo"
          title="访问 BetterGI 官网"
          @click="openExternalLink"
        ></div>
        <a-select v-model:value="selectedValue" class="repo-select" @change="handleChange">
          <a-select-option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-select-option>
        </a-select>
      </div>
      <div class="sider-menu-wrap">
        <a-menu v-model:selectedKeys="selectedMenu" mode="inline" class="custom-menu">
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

    <!-- 中间脚本列表 -->
    <a-layout-sider class="script-sider">
      <div class="script-header">
        <span class="script-title">脚本列表</span>
        <div class="script-actions">
          <a-button type="primary" class="script-btn script-btn-all">全部</a-button>
          <a-button class="script-btn">已订阅</a-button>
        </div>
      </div>
      <div class="search-section">
        <a-input-search
          v-model:value="search"
          placeholder="输入关键词查询"
          class="script-search"
          @search="handleSearch"
          allow-clear
        />
      </div>
      <div class="script-list">
        <slot name="script-list" :search-key="search" />
      </div>
    </a-layout-sider>

    <!-- 右侧内容区域 -->
    <a-layout class="main-right">
      <slot name="content" />
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref } from 'vue';
import { AppstoreOutlined, FolderOutlined, FileOutlined, CalculatorOutlined, BulbOutlined } from '@ant-design/icons-vue';
import { Select } from 'ant-design-vue';

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
const handleChange = (value) => {
  console.log('选择仓库变化: ', value)
};

const handleSearch = (value) => {
  search.value = value;
};

const openExternalLink = () => {
  window.open('https://bettergi.com/', '_blank', 'fullscreen=yes,width=1920,height=1080');
};
</script>

<style scoped>
.main-layout {
  height: calc(100vh - 20px);
  width: calc(100% - 20px);
  margin: 10px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  background: #fff;
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
}

.sider-logo {
  width: 40px;
  height: 40px;
  background: url('@/assets/logo.png') no-repeat center/contain;
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
  flex: 1;
  padding: 8px;
  width: 100%;
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
}

.sider-link {
  margin-bottom: 8px;
  cursor: pointer;
}

.script-sider {
  width: 320px !important;
  min-width: 320px !important;
  max-width: 320px !important;
  background: #fff !important;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
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
  background: #181822 !important;
  border: none !important;
}

.search-section {
  padding: 12px 16px;
  border-bottom: 1px solid #ececec;
}

.script-search {
  width: 100%;
}

.script-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.main-right {
  background: #f5f6fa;
  padding: 24px;
}
</style>
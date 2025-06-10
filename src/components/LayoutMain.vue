<template>
  <a-layout class="main-layout">
    <!-- 侧边栏 -->
    <a-layout-sider :width="240" class="custom-sider">
      <div class="sider-header">
        <span class="sider-logo"></span>
        <span class="sider-title">中央仓库</span>
      </div>
      <div class="sider-menu-wrap">
        <a-menu v-model:selectedKeys="selectedMenu" mode="inline" class="custom-menu">
          <a-menu-item v-for="item in menuList" :key="item.key" class="custom-menu-item">
            <span class="menu-icon"><component :is="item.icon" /></span>
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
    <!-- 主体部分 -->
    <a-layout>
      <!-- 顶部栏 -->
      <a-layout-header class="custom-header">
        <span class="header-title">脚本列表</span>
        <a-input-search v-model:value="search" placeholder="输入关键词查询" class="header-search" />
        <a-button type="primary" class="header-btn header-btn-all">全部</a-button>
        <a-button class="header-btn">已订阅</a-button>
      </a-layout-header>
      <a-layout-content class="main-content">
        <slot />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref } from 'vue';
import { AppstoreOutlined, FolderOutlined, FileOutlined, CalculatorOutlined, BulbOutlined } from '@ant-design/icons-vue';
const selectedMenu = ref(['1']);
const search = ref('');
const menuList = [
  { key: '1', label: '地图图案', icon: FolderOutlined, count: 128 },
  { key: '2', label: 'Javascript 脚本', icon: FileOutlined, count: 9 },
  { key: '3', label: '数学题解', icon: CalculatorOutlined, count: 4 },
  { key: '4', label: '七圣召唤策略', icon: BulbOutlined, count: 23 },
];
</script>

<style scoped>
.main-layout {
  height: 100vh;
}
.custom-sider {
  background: #f7f8fa !important;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  padding: 0;
}
.sider-header {
  height: 56px;
  display: flex;
  align-items: center;
  padding-left: 24px;
  font-weight: 600;
  font-size: 18px;
  color: #222;
  border-bottom: 1px solid #ececec;
}
.sider-logo {
  width: 20px;
  height: 20px;
  background: url('@/assets/logo.svg') no-repeat center/contain;
  margin-right: 10px;
}
.sider-title {
  letter-spacing: 1px;
}
.sider-menu-wrap {
  flex: 1;
  padding-top: 8px;
}
.custom-menu {
  background: transparent !important;
  border: none;
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
.custom-menu-item.ant-menu-item-selected {
  background: #e6f0ff !important;
  color: #1677ff !important;
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
  padding: 24px 0 0 24px;
  color: #999;
  font-size: 14px;
  border-top: 1px solid #ececec;
}
.sider-link {
  margin-bottom: 8px;
  cursor: pointer;
}
.custom-header {
  background: #fff !important;
  border-bottom: 1px solid #e5e7eb;
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 32px 0 24px;
}
.header-title {
  font-size: 22px;
  font-weight: 700;
  color: #222;
  margin-right: 32px;
}
.header-search {
  width: 260px;
  margin-right: auto;
}
.header-btn {
  margin-left: 12px;
  border-radius: 6px;
  font-weight: 500;
  height: 32px;
  padding: 0 18px;
  font-size: 15px;
}
.header-btn-all {
  background: #1677ff !important;
  border: none !important;
}
.main-content {
  display: flex;
  height: calc(100vh - 56px);
  background: #f5f6fa;
  padding: 0;
}
</style>
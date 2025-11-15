<template>
  <div class="announcement-content">
    <div class="announcement-list">
      <div v-for="item in tabs"
           :key="item.key"
           class="announcement-item"
           :class="{ active: activeTab === item.key }"
           @click="activeTab = item.key"
      >
        {{ item.title }}
      </div>
    </div>
    <div class="announcement-readme">
      <div v-for="item in tabs"
           :key="item.key"
           class="readme-wrapper"
      >
        <transition name="fade-readme" mode="out-in">
          <ReadmeViewer v-show="activeTab === item.key"
                        :markdown-content="item.content">
          </ReadmeViewer>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import ReadmeViewer from "@/components/items/ReadmeViewer.vue";
import srepoMd from '@/assets/readme/srepo.md?raw'
import updateMd from '@/assets/readme/update.md?raw'
import {useI18n} from 'vue-i18n';
import {ref} from "vue";

const {t: $t} = useI18n();

const tabs = [
  {key: "changelog", title: $t('announcement.changelog'), content: updateMd},
  {key: "guide", title: $t('announcement.guide'), content: srepoMd}
];

const activeTab = ref("changelog");
</script>

<style scoped>
.announcement-content {
  display: flex;
  height: 70vh;
  margin: 20px 0;
  position: relative;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  width: 180px;
  margin-right: 20px;
  gap: 10px;
}

.announcement-item {
  padding: 15px;
  margin-bottom: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all .2s ease;
  user-select: none;
  font-weight: 500;
  font-size: 16px;
  color: var(--text-base);
  background: var(--bg-container);
  box-shadow: 0 2px 8px 0 var(--color-shadow);
  border: 1.5px solid var(--border-base);
  white-space: normal;
}

.announcement-item:hover {
  box-shadow: 0 4px 16px 0 var(--color-shadow);
  background: var(--bg-desc);
  border-color: var(--color-primary);
}

.announcement-item.active {
  border: 1px solid var(--color-primary);
  box-shadow: 0 4px 16px 0 var(--color-shadow);
  background: var(--bg-desc);
  font-weight: 600;
}

.announcement-readme {
  flex: 1;
  border-radius: 8px;
  border: 1px solid var(--border-base);
  overflow: auto;
  position: relative;
}

.readme-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 15px;
}

/* 动画 */
.fade-readme-enter-active,
.fade-readme-leave-active {
  transition: opacity .18s ease;
}

.fade-readme-enter-from,
.fade-readme-leave-to {
  opacity: 0;
}
</style>

<template>
  <div class="update-notice-content">
    <CarryOutOutlined class="update-notice-icon"/>
    <div class="update-notice-text" v-html="$t('update.notice.text', {day: mainStore.daysDiff})"></div>
  </div>
</template>

<script setup>
import { useMainStore } from "@/stores/mainStore.js";
import { CarryOutOutlined } from '@ant-design/icons-vue';
import {useI18n} from 'vue-i18n';

const {t: $t} = useI18n();
const mainStore = useMainStore();
</script>

<style scoped>
.update-notice-content {
  display: flex;
  align-items: flex-start;
  margin-top: 20px;
  margin-right: 10px;
  gap: 12px;
}

.update-notice-icon {
  font-size: 30px;
  line-height: 1;
  color: var(--text-base);
  margin-top: 2px;
}

.update-notice-text {
  color: var(--text-base);
  font-size: 15px;
  margin-left: 10px;
  margin-bottom: 8px;
  white-space: pre-wrap;
}
</style>
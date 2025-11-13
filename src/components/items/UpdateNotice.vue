<template>
  <div class="update-notice-content">
    <CarryOutOutlined class="update-notice-icon"/>
    <div class="text-content">
      <span class="update-notice-text" v-html="$t('update.notice.text', {day: mainStore.daysDiff})"></span>
      <span class="update-notice-tip">{{$t('update.notice.tip')}}</span>
    </div>
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
  margin-right: 20px;
  gap: 12px;
}

.update-notice-icon {
  font-size: 30px;
  line-height: 1;
  color: var(--text-base);
  margin-top: 2px;
}

.text-content {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  gap: 10px;
}

.update-notice-text {
  color: var(--text-base);
  font-size: 15px;
  white-space: pre-wrap;
}

.update-notice-tip {
  color: var(--text-base3);
  font-size: 13px;
  white-space: pre-wrap;
}
</style>
<template>
  <div class="plan-modal-content">
    <div class="plan-title">{{ $t('plan.desc') }}</div>
    <div class="repo-link">{{ $t('plan.link') }}</div>
    <div class="author-title">{{ $t('plan.author') }}</div>
    <div v-for="(item, idx) in tm('plan.planList')" :key="idx" class="plan-item">
      <div class="plan-desc"><span class="plan-index">{{ idx + 1 }}.</span> {{ item.desc }}</div>
      <div class="plan-content">{{ item.content }}</div>
      <div v-if="idx < tm('plan.planList').length - 1" class="plan-divider"></div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t: $t, tm } = useI18n();
</script>

<style scoped>
.plan-modal-content {
  padding: 10px 16px;
  max-height: 60vh;
  overflow-y: auto;
}
.plan-title {
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 24px;
  letter-spacing: 2px;
}
.repo-link {
  font-size: 15px;
  margin-bottom: 20px;
  color: var(--text-base2);

}
.author-title {
  font-size: 15px;
  margin-bottom: 20px;
  color: var(--text-base2);
}
.plan-item {
  margin-bottom: 28px;
}
.plan-desc {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}
.plan-index {
  font-size: 18px;
  font-weight: bold;
  margin-right: 6px;
}
.plan-content {
  font-size: 15px;
  line-height: 1.7;
  padding-left: 8px;
  color: var(--text-base2);
}
.plan-divider {
  border-bottom: 1px solid var(--border-base);
  margin: 18px 0 0 0;
}
</style> 
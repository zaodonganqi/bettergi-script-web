<template>
  <div class="script-detail">
    <template v-if="script">
      <div class="detail-header">
        <div class="detail-title">{{ script.title }}</div>
        <div class="detail-meta">
          <span class="detail-author">作者：{{ script.author }}</span>
        </div>
        <div class="detail-time">{{ script.time }}</div>
      </div>
      <div class="detail-desc">{{ script.desc }}</div>
      <!-- 输入区 -->
      <div class="detail-input-wrap">
        <a-input v-model:value="input" placeholder="评论..." class="detail-input" />
        <a-button type="primary" class="detail-send">Send</a-button>
      </div>
    </template>
    <template v-else>
      <div class="detail-empty">请选择左侧脚本查看详情</div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  script: {
    type: Object,
    default: null
  }
});

const input = ref('');
</script>

<style scoped>
.script-detail {
  height: 100%;
  background: #fff;
  padding: 32px 36px 80px 36px;
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.detail-header {
  margin-bottom: 8px;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin-bottom: 4px;
}

.detail-meta {
  color: #888;
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.detail-author {
  margin-right: 12px;
}

.detail-time {
  color: #aaa;
  font-size: 13px;
  margin-bottom: 10px;
}

.detail-desc {
  border-top: 1px solid #eee;
  padding-top: 16px;
  color: #555;
  font-size: 15px;
  white-space: pre-line;
}

.detail-empty {
  color: #bbb;
  text-align: center;
  margin-top: 80px;
}

.detail-input-wrap {
  position: absolute;
  bottom: 24px;
  left: 36px;
  right: 36px;
  display: flex;
  align-items: center;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 10px 16px;
  box-shadow: 0 2px 8px #f2f3f5;
}

.detail-input {
  flex: 1;
  margin-right: 10px;
  border-radius: 6px;
  height: 36px;
  font-size: 15px;
}

.detail-send {
  height: 36px;
  border-radius: 6px;
  font-size: 15px;
  background: #1677ff !important;
  border: none !important;
}
</style> 
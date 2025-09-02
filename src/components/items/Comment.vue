<script setup>
import Giscus from "@giscus/vue";
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {Modal as AModal} from "ant-design-vue";

const {t: $t} = useI18n();

const props = defineProps({
  selectedScript: {
    type: Object,
    default: null
  },
  commentModalOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:commentModalOpen']);

const mode = import.meta.env.VITE_MODE;

// 处理双向绑定
const isModalOpen = computed({
  get: () => props.commentModalOpen,
  set: (value) => emit('update:commentModalOpen', value)
});

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
  if (!props.selectedScript) return 'default';
  return props.selectedScript.path || props.selectedScript.title || 'default';
});

// 监听 giscusTerm 变化，强制重新渲染 Giscus 组件
watch(giscusTerm, (newTerm, oldTerm) => {
  if (newTerm !== oldTerm) {
    giscusKey.value++;
  }
});

// 打开外部链接
const openExternalLink = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
</script>

<template>
  <!-- 评论弹窗 -->
  <a-modal v-model:open="isModalOpen" :title="$t('comment.title')" :footer="null" centered width="90%"
           :style="{ maxWidth: '1200px' }" class="comment-modal">
    <div class="comment-modal-content">
      <div class="comment-header">
        <div class="script-title-simple">
          <span class="script-title">{{ selectedScript?.title || $t('script.unknownScript') }}</span>
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
          <span v-else-if="selectedScript?.author" class="script-author">{{ $t('script.author') }}{{ selectedScript.author }}</span>
          <span v-else class="script-author">{{ $t('script.noAuthor') }}</span>
        </div>
      </div>

      <div class="comments-container">
        <!-- 本地模式显示提示信息 -->
        <div v-if="mode === 'single'" class="local-mode-notice">
          <div class="notice-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#e3f2fd"/>
              <path d="M24 12v16" stroke="#2196f3" stroke-width="3" stroke-linecap="round"/>
              <circle cx="24" cy="36" r="2.5" fill="#2196f3"/>
            </svg>
          </div>
          <div class="notice-title">{{ $t('comment.localModeNoticeTitle') }}</div>
          <div class="notice-desc">{{ $t('comment.localModeNoticeDesc') }}</div>
          <button class="notice-btn" @click="openExternalLink('https://bgi.sh')">
            {{ $t('comment.onlineRepo') }}
          </button>
        </div>

        <!-- Web模式显示giscus评论 -->
        <Giscus v-else :key="giscusKey" :repo="giscusConfig.repo" :repoId="giscusConfig.repoId"
                :category="giscusConfig.category" :categoryId="giscusConfig.categoryId"
                :mapping="giscusConfig.mapping"
                :term="giscusTerm" :strict="giscusConfig.strict" :reactionsEnabled="giscusConfig.reactionsEnabled"
                :emitMetadata="giscusConfig.emitMetadata" :inputPosition="giscusConfig.inputPosition"
                :theme="giscusConfig.theme" :lang="giscusConfig.lang" loading="lazy"/>
      </div>
    </div>
  </a-modal>
</template>

<style scoped>
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

.comments-container {
  flex: 1;
  max-height: calc(90vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;
  margin-top: 16px;
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

.comment-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.script-title-simple {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.script-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
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
</style>
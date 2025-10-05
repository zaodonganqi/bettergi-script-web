<template>
  <!-- 评论弹窗 -->
  <a-modal v-model:open="mainStore.showCommentModal"
           :title="$t('comment.title')"
           :footer="null"
           centered width="90%"
           :style="{ maxWidth: '1200px' }"
           class="comment-modal"
           :destroyOnClose="true"
           @cancel="mainStore.showCommentModal = false">
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
                    <a :href="author.link" class="author-link" target="_blank" rel="noopener noreferrer">
                      {{ author.name }}
                    </a>
                  </template>
                  <template v-else>
                    <span>{{ author.name }}</span>
                  </template>
                  <span v-if="idx < selectedScript.authors.length - 1">，</span>
                </template>
              </span>
          </template>
          <span v-else class="script-author">{{ $t('script.noAuthor') }}</span>
        </div>
      </div>

      <div class="comments-container">
        <!-- 本地模式显示提示信息 -->
        <div v-if="mainStore.isModeSingle" class="local-mode-notice">
          <div class="notice-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#e3f2fd"/>
              <path d="M24 12v16" stroke="#2196f3" stroke-width="3" stroke-linecap="round"/>
              <circle cx="24" cy="36" r="2.5" fill="#2196f3"/>
            </svg>
          </div>
          <div class="notice-title">{{ $t('comment.localModeNoticeTitle') }}</div>
          <div class="notice-desc">{{ $t('comment.localModeNoticeDesc') }}</div>
          <a-button type="primary" class="notice-btn" @click="mainStore.openExternalLink('https://bgi.sh')">
            {{ $t('comment.onlineRepo') }}
          </a-button>
        </div>

        <!-- Web模式显示giscus评论 -->
        <Giscus v-else :key="giscusKey" :repo="giscusConfig.repo" :repoId="giscusConfig.repoId"
                :category="giscusConfig.category" :categoryId="giscusConfig.categoryId"
                :mapping="giscusConfig.mapping"
                :term="giscusTerm"
                :strict="giscusConfig.strict"
                :reactionsEnabled="giscusConfig.reactionsEnabled"
                :emitMetadata="giscusConfig.emitMetadata"
                :inputPosition="giscusConfig.inputPosition"
                :theme="themePath"
                :lang="currentLang"
                :loading="giscusConfig.loading"
                ref="giscusRef"/>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n } from "vue-i18n";
import { Modal as AModal } from "ant-design-vue";
import { useMainStore } from "@/stores/mainStore.js";
import { useSettingsStore } from "@/stores/settingsStore.js";
import Giscus from '@giscus/vue';

const { t: $t } = useI18n();

const mainStore = useMainStore();
const settings = useSettingsStore();
const { locale } = useI18n();

// 获取selectedScript
const selectedScript = computed(() => mainStore.selectedScript);

// Giscus组件引用
const giscusRef = ref(null);

// 强制 Giscus 组件重新渲染的 key
const giscusKey = ref(0);

// 语言映射
const localeToUse = {
  'zh-CN': 'zh-CN',
  'en-US': 'en',
  'fr-FR': 'fr',
  'ja-JP': 'ja',
  'zh-TW': 'zh-TW',
}

// 主题配置
const theme = computed(() => settings.selectedThemeName);
const themePath = computed(() => `https://giscus.app/themes/${theme.value}.css`);

// 当前语言
const currentLang = computed(() => localeToUse[locale.value] || 'zh-CN');

// Giscus配置
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
  theme: themePath.value,
  lang: currentLang.value
};

// 计算 giscus term，用于区分不同脚本的评论
const giscusTerm = computed(() => {
  if (!selectedScript.value) return 'default';
  return selectedScript.value.path || selectedScript.value.title || 'default';
});

// 动态更新 giscus 配置的函数
const updateGiscusConfig = async (config) => {
  if (!giscusRef.value) return;
  
  try {
    // 等待下一个 tick 确保 giscus 组件已加载
    await nextTick();
    
    // 使用 sendMessage 动态更新配置
    if (giscusRef.value.sendMessage) {
      giscusRef.value.sendMessage({
        setConfig: config
      });
    }
  } catch (error) {
    console.warn('Failed to update giscus config:', error);
  }
};

// 监听主题变化
watch(themePath, (newTheme) => {
  if (mainStore.showCommentModal && !mainStore.isModeSingle) {
    updateGiscusConfig({
      theme: newTheme
    });
  }
});

// 监听语言变化
watch(currentLang, (newLang) => {
  if (mainStore.showCommentModal && !mainStore.isModeSingle) {
    updateGiscusConfig({
      lang: newLang
    });
  }
});
</script>

<style scoped>
.comment-modal {
  border-radius: 12px;
  overflow: hidden;
}

.comment-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px;
}

.comment-modal :deep(.ant-modal-header) {
  border-bottom: 1px solid;
  padding: 20px 24px;
}

.comment-modal :deep(.ant-modal-title) {
  font-size: 18px;
  font-weight: 600;
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
  border-bottom: 1px solid var(--border-base);
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
  line-height: 1.4;
}

.script-author {
  font-size: 14px;
  font-weight: 400;
  opacity: 0.8;
}

.author-link {
  text-decoration: none;
  color: var(--color-primary);
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
  margin-bottom: 12px;
}

.notice-desc {
  font-size: 16px;
  margin-bottom: 32px;
  line-height: 1.5;
}

.notice-btn {
  height: 50px;
  width: 200px;
  border: none;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notice-btn:hover {
  transform: translateY(-1px);
}

.notice-btn:active {
  transform: translateY(0);
}
</style>
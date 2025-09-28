<template>
  <div class="script-detail">
    <template v-if="script">
      <div class="detail-header">
        <div class="header-left">
          <div class="detail-title">{{ script.title }}</div>
          <div class="detail-meta">
            <template v-if="script.authors && Array.isArray(script.authors) && script.authors.length">
              <span class="detail-author">
                {{ $t('detail.author') }}
                <template v-for="(author, idx) in script.authors" :key="author.name">
                  <template v-if="author.link">
                    <a :href="author.link" class="author-link" target="_blank" rel="noopener noreferrer">
                      {{ author.name }}</a>
                  </template>
                  <template v-else>
                    <span>{{ author.name }}</span>
                  </template>
                  <span v-if="idx < script.authors.length - 1">{{ $t('common.comma') }}</span>
                </template>
              </span>
            </template>
            <span v-else class="detail-author">{{ $t('detail.noAuthor') }}</span>
          </div>
          <div class="detail-version" v-if="script.version">
            {{ $t('detail.version') }}：{{ script.version }}
          </div>
          <div class="detail-time">{{ script.lastUpdated }}</div>
        </div>
        <div class="header-right">
          <a-button type="primary" @click="jumpToGitHub(script)">
            {{ $t('action.jumpToGitHub') }}
          </a-button>
          <a-button type="primary" @click="commentModalOpen = true">
            {{ $t('action.comment') }}
          </a-button>
          <a-button type="primary" v-if="!script.isSubscribed" @click="handleSubscribe(script)">
            {{ $t('detail.subscribe') }}
          </a-button>
          <a-button type="primary" v-if="script.isSubscribed" @click="handleSubscribe(script)">
            {{ $t('detail.subscribeAgain') }}
          </a-button>
        </div>
      </div>
      <div class="detail-readme">
        <div v-if="script && script.desc && script.desc.trim()" class="desc-block">
          <div class="desc-title">{{ $t('detail.desc') }}</div>
          <div class="desc-content">{{ script.desc }}</div>
        </div>
        <transition name="fade-slide-up">
          <div v-if="isLoadingReadme" class="readme-loading-indicator">
            <a-spin size="small"/>
            <span>{{ $t('detail.loadingReadme') }}</span>
          </div>
        </transition>
        <transition name="fade-slide-up">
          <div v-if="loadError" class="readme-loading-indicator">
            <a-button type="text" size="small" @click="retryLoadReadme">
              <template #icon>
                <ReloadOutlined/>
              </template>
            </a-button>
            <span>{{ $t('detail.readmeFailed') }}</span>
          </div>
        </transition>
        <ReadmeViewer :key="readmeKey" :path="script.path" :desc="null" :showDescTitle="false"
                      :showNoDesc="!script.desc"
                      @loaded="handleReadmeLoaded" @error="handleReadmeError"/>
        <!-- 评论弹窗-->
        <Comment v-model="commentModalOpen" :selected-script="script" />
      </div>
    </template>
    <template v-else>
      <div class="detail-empty">{{ $t('detail.empty') }}</div>
    </template>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue';
import {useClipboard} from '@vueuse/core';
import {message as Message, Spin as ASpin} from 'ant-design-vue';
import ReadmeViewer from '../items/ReadmeViewer.vue';
import {ReloadOutlined} from '@ant-design/icons-vue';
import { subscribePaths } from '@/utils/subscription';
import {useI18n} from 'vue-i18n';
import Comment from "@/components/items/Comment.vue";
import {jumpToGitHub} from "@/utils/actions.js";

const {t: $t} = useI18n();

const props = defineProps({
  script: {
    type: Object,
    default: null
  },
  startPollingUserConfig: Function
});
const {copy} = useClipboard();

// readme加载状态
const isLoadingReadme = ref(false);
const loadError = ref(false);
const readmeKey = ref(0);
const commentModalOpen = ref(false);

const isReadme404 = (path) => !!localStorage.getItem('readme404:' + path);
const setReadme404 = (path) => {
  if (path) localStorage.setItem('readme404:' + path, '1');
};

const handleReadmeLoaded = (payload) => {
  isLoadingReadme.value = false;
  loadError.value = false;
  if (payload && payload.status === '404' && props.script && props.script.path) {
    setReadme404(props.script.path);
    // 404时不显示弹窗，ReadmeViewer内部会优先显示desc
  } else if (payload && payload.status === 'error') {
    loadError.value = true;
  }
};

const handleReadmeError = () => {
  isLoadingReadme.value = false;
  loadError.value = true;
};

const retryLoadReadme = () => {
  isLoadingReadme.value = true;
  loadError.value = false;
  readmeKey.value++;
};

const handleSubscribe = async (item) => {
  if (!item.path) return;
  try {
    const result = await subscribePaths([item.path]);
    if (result.needsCopy) {
      await copy(result.url);
      Message.success($t('detail.subscribeSuccess', {name: item.name}));
    } else if (typeof props.startPollingUserConfig === 'function') {
      props.startPollingUserConfig();
    }
  } catch (error) {
    console.error('Subscribe failed:', error);
    Message.error($t('detail.subscribeFailedWithMsg', {msg: error.message}));
  }
};

// 监听脚本变化，设置加载状态
watch(() => props.script, (newScript) => {
  if (newScript && newScript.path) {
    if (isReadme404(newScript.path)) {
      // 已知404，不再加载
      isLoadingReadme.value = false;
      loadError.value = false;
      readmeKey.value++;
      return;
    }
    isLoadingReadme.value = true;
    loadError.value = false;
    readmeKey.value++;
  }
}, {immediate: true});
</script>

<style scoped>
.script-detail {
  height: 100%;
  background: var(--bg-container);
  position: relative;
  padding: 16px 10px 16px 10px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.detail-header {
  margin-bottom: 8px;
  padding: 0 26px 2px 26px;
  border-bottom: 1px solid var(--border-base);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-left {
  flex: 1;
  min-width: 0;
  padding-right: 30px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.detail-meta {
  color: var(--text-base3);
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.detail-author {
  margin-right: 12px;
  color: var(--text-base2);
}

.detail-version {
  font-size: 14px;
  margin-bottom: 10px;
  color: var(--text-base3);
}

.detail-time {
  color: var(--text-base3);
  font-size: 13px;
  margin-bottom: 10px;
  word-break: break-word;
}

.detail-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-base4);
  height: 100%;
  text-align: center;
}

.detail-readme {
  flex-grow: 1;
  overflow-y: auto;
  min-height: 100px;
  padding: 0px 16px 0px 10px;
  position: relative;
}

.readme-loading-indicator {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  background: var(--bg-menu);
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 4px 8px;
  border-color: var(--bg-desc);
  border-radius: 4px;
  box-shadow: 0 1px 4px var(--bg-shadow-light);
  z-index: 10;
}

.author-link {
  text-decoration: underline;
  cursor: pointer;
  color: var(--color-primary);
}

.desc-block {
  margin-bottom: 20px;
  border: 1px solid var(--color-shadow);
  background: var(--bg-desc);
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px var(--bg-shadow-light);
  position: relative;
}


.desc-title {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 16px;
  color: var(--color-primary);
  display: flex;
  align-items: center;
}

.desc-title::before {
  content: '📝';
  margin-right: 8px;
  font-size: 14px;
}

.desc-content {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-base2);
  margin: 0;
  white-space: pre-line;
  word-break: break-word;
}
</style>
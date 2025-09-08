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
          <div class="detail-time">{{ script.time }}</div>
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
          <div v-if="isLoadingTxt" class="readme-loading-indicator">
            <a-spin size="small"/>
            <span>{{ $t('detail.loadingStrategy') }}</span>
          </div>
        </transition>
        <transition name="fade-slide-up">
          <div v-if="loadTxtError" class="readme-loading-indicator">
            <a-button type="text" size="small" @click="retryLoadTxt">
              <template #icon>
                <ReloadOutlined/>
              </template>
            </a-button>
            <span>{{ $t('detail.strategyFailed') }}</span>
          </div>
        </transition>
        <div v-if="txtContent" class="txt-content-plain">{{ txtContent }}</div>
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
import {ReloadOutlined} from '@ant-design/icons-vue';
import {getRepoPath} from '@/utils/basePaths';
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
const isLoadingTxt = ref(false);
const loadTxtError = ref(false);
const txtContent = ref('');
const commentModalOpen = ref(false);

const isTxt404 = (path) => !!localStorage.getItem('txt404:' + path);
const setTxt404 = (path) => {
  if (path) localStorage.setItem('txt404:' + path, '1');
};

const getRawTxtUrl = (path) => {
  if (!path) return '';
  // 兼容http/https外链
  if (/^https?:\/\//i.test(path)) return path;
  return getRepoPath() + path.replace(/\\/g, '/');
};

const fetchTxtContent = async (path) => {
  if (!path) {
    txtContent.value = '';
    isLoadingTxt.value = false;
    loadTxtError.value = false;
    return;
  }
  if (isTxt404(path)) {
    txtContent.value = '';
    isLoadingTxt.value = false;
    loadTxtError.value = false;
    return;
  }
  isLoadingTxt.value = true;
  loadTxtError.value = false;
  txtContent.value = '';
  const mode = import.meta.env.VITE_MODE;
  let txt = '';
  let fetchError = null;
  if (mode === 'single') {
    try {
      const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
      txt = await repoWebBridge.GetFile(path.replace(/\\/g, '/'));
      if (txt === "404") {
        setTxt404(path);
        txtContent.value = '';
        isLoadingTxt.value = false;
        loadTxtError.value = false;
        return;
      }
    } catch (e) {
      fetchError = e;
    }
  } else {
    const txtUrl = getRawTxtUrl(path);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(txtUrl, {signal: controller.signal});
      clearTimeout(timeoutId);
      if (response.ok) {
        txt = await response.text();
      } else if (response.status === 404) {
        setTxt404(path);
        txtContent.value = '';
        isLoadingTxt.value = false;
        loadTxtError.value = false;
        return;
      } else {
        fetchError = new Error('Load failed');
      }
    } catch (e) {
      fetchError = e;
    }
  }
  if (fetchError) {
    txtContent.value = '';
    isLoadingTxt.value = false;
    loadTxtError.value = true;
    return;
  }
  txtContent.value = txt;
  isLoadingTxt.value = false;
  loadTxtError.value = false;
};

const retryLoadTxt = () => {
  if (props.script && props.script.path) {
    fetchTxtContent(props.script.path);
  }
};

const handleSubscribe = async (item) => {
  if (!item.path) return;
  try {
    const result = await subscribePaths([item.path]);
    if (result.needsCopy) {
      await copy(result.url);
      Message.success($t('detail.subscribeSuccess', {name: item.name}));
    }
    if (typeof props.startPollingUserConfig === 'function') {
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
    fetchTxtContent(newScript.path);
  } else {
    txtContent.value = '';
    isLoadingTxt.value = false;
    loadTxtError.value = false;
  }
}, {immediate: true});
</script>

<style scoped>
.script-detail {
  height: 100%;
  background: #fff;
  position: relative;
  padding: 16px 10px 16px 10px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.detail-header {
  margin-bottom: 8px;
  padding: 0px 26px 2px 26px;
  border-bottom: 1px solid #ddd;
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
  word-break: break-word;
}

.detail-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #bbb;
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
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.author-link {
  text-decoration: underline;
  color: #1677ff;
  cursor: pointer;
}

.txt-content-plain {
  margin-top: 10px;
  color: #222;
  font-size: 15px;
  white-space: pre-wrap;
  word-break: break-all;
}

.desc-block {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%);
  border: 1px solid #e6f0ff;
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.08);
  position: relative;
}

.desc-title {
  font-weight: 600;
  color: #1677ff;
  margin-bottom: 8px;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.desc-title::before {
  content: '📝';
  margin-right: 8px;
  font-size: 14px;
}

.desc-content {
  color: #2c3e50;
  font-size: 15px;
  line-height: 1.8;
  margin: 0;
  white-space: pre-line;
  word-break: break-word;
}
</style>
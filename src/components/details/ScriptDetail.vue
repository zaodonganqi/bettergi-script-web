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
                    <a :href="author.link" class="author-link" target="_blank" rel="noopener noreferrer">{{ author.name
                      }}</a>
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
          <div class="detail-time">{{ script.time }}</div>
        </div>
        <div class="header-right" style="display: flex; align-items: center; gap: 8px;">
            <a-button type="primary" v-if="!script.isSubscribed" @click="handleSubscribe(script)">{{ $t('detail.subscribe') }}</a-button>
            <a-button type="primary" v-if="script.isSubscribed" :disabled="script.isSubscribed"
              class="subscribed-btn">{{ $t('detail.subscribed') }}</a-button>
            <a-button type="primary" v-if="script.isSubscribed" @click="handleSubscribe(script)">{{ $t('detail.subscribeAgain') }}</a-button>
          </div>
      </div>
      <div class="detail-readme">
                            <div v-if="script && script.desc && script.desc.trim()" class="desc-block">
          <div class="desc-title">{{ $t('detail.desc') }}</div>
          <div class="desc-content">{{ script.desc }}</div>
        </div>
        <transition name="fade-slide-up">
          <div v-if="isLoadingReadme" class="readme-loading-indicator">
            <a-spin size="small" />
            <span>{{ $t('detail.loadingReadme') }}</span>
          </div>
        </transition>
        <transition name="fade-slide-up">
          <div v-if="loadError" class="readme-loading-indicator">
            <a-button type="text" size="small" @click="retryLoadReadme">
              <template #icon>
                <ReloadOutlined />
              </template>
            </a-button>
            <span>{{ $t('detail.readmeFailed') }}</span>
          </div>
        </transition>
                 <ReadmeViewer :key="readmeKey" :path="script.path" :desc="null" :showDescTitle="false" :showNoDesc="!script.desc"
          @loaded="handleReadmeLoaded" @error="handleReadmeError" />
      </div>
    </template>
    <template v-else>
      <div class="detail-empty">{{ $t('detail.empty') }}</div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useClipboard } from '@vueuse/core';
import { message as Message, Spin as ASpin } from 'ant-design-vue';
import ReadmeViewer from '../ReadmeViewer.vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import { subscribePath } from '@/utils/subscription';
import { useI18n } from 'vue-i18n';
const { t: $t } = useI18n();

const props = defineProps({
  script: {
    type: Object,
    default: null
  },
  startPollingUserConfig: Function
});

const emit = defineEmits([]);

const mode = import.meta.env.VITE_MODE;
const { copy } = useClipboard();

// readme加载状态
const isLoadingReadme = ref(false);
const loadError = ref(false);
const readmeKey = ref(0);

const isReadme404 = (path) => !!localStorage.getItem('readme404:' + path);
const setReadme404 = (path) => { if (path) localStorage.setItem('readme404:' + path, '1'); };

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
    const result = await subscribePath(item.path);
    if (result.needsCopy) {
      await copy(result.url);
      Message.success($t('detail.subscribeSuccess', { name: item.name }));
    }
    if (typeof props.startPollingUserConfig === 'function') {
      props.startPollingUserConfig();
    }
  } catch (error) {
    console.error('Subscribe failed:', error);
    Message.error($t('detail.subscribeFailedWithMsg', { msg: error.message }));
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
}, { immediate: true });
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
  margin-right: 5px;
}

.header-right {
  display: flex;
  gap: 8px;
}

.subscribed-btn {
  background: #fff;
  color: #1677ff;
  border-color: #1677ff;
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

.detail-version {
  color: #888;
  font-size: 14px;
  margin-bottom: 10px;
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
  margin-top: 80px;
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

.readme-error {
  color: #bbb;
  text-align: center;
  margin-top: 40px;
  font-size: 16px;
}

.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
  transition: all 0.3s cubic-bezier(.55, 0, .1, 1);
}

.fade-slide-up-enter-from,
.fade-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.author-link {
  text-decoration: underline;
  color: #1677ff;
  cursor: pointer;
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

.subscribe-btn {
  color: #1677ff;
  background: none;
  border: none;
  width: 72px;
  text-align: center;
}

.subscribe-btn.subscribed {
  color: #1677ff !important;
  background: #fff !important;
  border: 1px solid #1677ff !important;
}

.subscribe-btn:hover {
  color: #1677ff;
  border: 1px solid #1677ff;
  background: #fff;
}
</style>
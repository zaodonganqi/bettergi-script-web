<template>
  <div class="script-detail">
    <template v-if="script">
      <div class="detail-header">
        <div class="header-left">
          <div class="detail-title">{{ script.title }}</div>
          <div class="detail-meta">
            <span v-if="script.author" class="detail-author">作者：{{ script.author }}</span>
            <span v-else class="detail-author">暂无作者信息</span>
          </div>
          <div class="detail-time">{{ script.time }}</div>
        </div>
        <div class="header-right">
          <a-button type="primary" @click="handleSubscribe">订阅</a-button>
        </div>
      </div>
      <div class="detail-readme">
        <div v-if="isLoading" class="readme-loading-indicator">
          <a-spin size="small" />
          <span>正在加载readme文件</span>
        </div>
        <div v-else-if="loadError" class="readme-loading-indicator">
          <a-button type="text" size="small" @click="retryLoadReadme">
            <template #icon>
              <ReloadOutlined />
            </template>
          </a-button>
          <span>readme文件加载失败，请重试</span>
        </div>
        <ReadmeViewer
          :path="script.path"
          :desc="script.desc"
          :showDescTitle="true"
          @loaded="isLoading = false"
          @error="handleReadmeError"
        />
      </div>
    </template>
    <template v-else>
      <div class="detail-empty">请选择左侧脚本查看详情</div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import 'highlight.js/styles/github.css';
import { useClipboard } from '@vueuse/core';
import { message as Message } from 'ant-design-vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import ReadmeViewer from '../ReadmeViewer.vue';

const props = defineProps({
  script: {
    type: Object,
    default: null
  }
});

const mode = import.meta.env.VITE_MODE;

const { copy } = useClipboard();

const isLoading = ref(false);
const loadError = ref(null);

function handleReadmeError(msg) {
  isLoading.value = false;
  loadError.value = msg || '加载失败';
}

function retryLoadReadme() {
  loadError.value = null;
  isLoading.value = true;
  // 重新设置 path 触发 ReadmeViewer 重新加载
  // 这里可以通过 key 强制刷新，如果需要
}

const handleSubscribe = () => {
  if (props.script) {
    downloadScript({ name: props.script.title, path: props.script.path });
  }
};

const downloadScript = async (script) => {
  // 创建一个包含脚本路径的数组
  const subscriptionData = [script.path];

  // 将数组转换为 JSON 字串
  const jsonString = JSON.stringify(subscriptionData);
  const base64String = btoa(encodeURIComponent(jsonString));

  // 创建完整的 URL
  const fullUrl = `bettergi://script?import=${base64String}`;

  if (mode === 'single') {
    try {
      await subscribeToLocal(fullUrl);
    } catch (error) {
      console.error('订阅失败:', error);
      Message.error(`订阅失败: ${error.message}`);
    }
  } else {
    // 将完整的 URL 复制到剪贴板
    copy(fullUrl).then(() => {
      Message.success(`已将 ${script.name} 的订阅链接复制到剪贴板`);
    }).catch((error) => {
      console.error('复制到剪贴板失败:', error);
      Message.error(`复制 ${script.name} 的订阅链接失败`);
    });
  }
};

const subscribeToLocal = async (url) => {
  const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
  await repoWebBridge.ImportUri(url);
};

watch(
  () => props.script,
  (newScript) => {
    if (newScript && newScript.path) {
      isLoading.value = true;
      loadError.value = null;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.script-detail {
  height: 100%;
  background: #fff;
  padding: 16px 36px 16px 36px;
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.detail-header {
  margin-bottom: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.header-right {
  flex-shrink: 0;
  margin-left: 16px;
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
  color: #888;
  font-size: 13px;
  margin-bottom: 10px;
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
  padding-top: 16px;
  padding-right: 16px;
  position: relative;
}

.readme-loading-indicator {
  position: absolute;
  top: 5px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
  z-index: 10;
}

.readme-error {
  color: #bbb;
  text-align: center;
  margin-top: 40px;
  font-size: 16px;
}
</style> 
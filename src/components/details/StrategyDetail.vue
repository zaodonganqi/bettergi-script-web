<template>
  <div class="script-detail">
    <template v-if="script">
      <div class="detail-header">
        <div class="header-left">
          <div class="detail-title">{{ script.title }}</div>
          <div class="detail-meta">
            <template v-if="script.authors && Array.isArray(script.authors) && script.authors.length">
              <span class="detail-author">
                作者：
                <template v-for="(author, idx) in script.authors" :key="author.name">
                  <template v-if="author.link">
                    <a :href="author.link" class="author-link" target="_blank" rel="noopener noreferrer">{{ author.name
                      }}</a>
                  </template>
                  <template v-else>
                    <span>{{ author.name }}</span>
                  </template>
                  <span v-if="idx < script.authors.length - 1">，</span>
                </template>
              </span>
            </template>
            <span v-else class="detail-author">暂无作者信息</span>
          </div>
          <div class="detail-time">{{ script.time }}</div>
        </div>
        <div class="header-right" style="display: flex; align-items: center; gap: 8px;">
            <a-button type="primary" v-if="!script.isSubscribed" @click="handleSubscribe(script)">订阅</a-button>
            <a-button type="primary" v-if="script.isSubscribed" :disabled="script.isSubscribed"
              class="subscribed-btn">已订阅</a-button>
            <a-button type="primary" v-if="script.isSubscribed" @click="handleSubscribe(script)">再次订阅</a-button>
          </div>
      </div>
      <div class="detail-readme">
        <div v-if="script && script.desc" class="desc-block">
          <div class="desc-title">简介：</div>
          <div class="desc-content">{{ script.desc }}</div>
        </div>
        <transition name="fade-slide-up">
          <div v-if="isLoadingTxt" class="readme-loading-indicator">
            <a-spin size="small" />
            <span>正在加载策略文件内容</span>
          </div>
        </transition>
        <transition name="fade-slide-up">
          <div v-if="loadTxtError" class="readme-loading-indicator">
            <a-button type="text" size="small" @click="retryLoadTxt">
              <template #icon>
                <ReloadOutlined />
              </template>
            </a-button>
            <span>策略文件加载失败，请重试</span>
          </div>
        </transition>
        <div v-if="txtContent" class="txt-content-plain">{{ txtContent }}</div>
      </div>
    </template>
    <template v-else>
      <div class="detail-empty">请选择左侧脚本查看详情</div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useClipboard } from '@vueuse/core';
import { message as Message, Spin as ASpin } from 'ant-design-vue';
import { ReloadOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  script: {
    type: Object,
    default: null
  }
});

const emit = defineEmits([]);

const mode = import.meta.env.VITE_MODE;
const { copy } = useClipboard();

const isLoadingTxt = ref(false);
const loadTxtError = ref(false);
const txtContent = ref('');
const headerHover = ref(false);

const isTxt404 = (path) => !!localStorage.getItem('txt404:' + path);
const setTxt404 = (path) => { if (path) localStorage.setItem('txt404:' + path, '1'); };

const getRawTxtUrl = (path) => {
  if (!path) return '';
  // 兼容http/https外链
  if (/^https?:\/\//i.test(path)) return path;
  return `https://raw.githubusercontent.com/babalae/bettergi-scripts-list/refs/heads/main/repo/${encodeURI(path.replace(/\\/g, '/'))}`;
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
  const txtUrl = getRawTxtUrl(path);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(txtUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      txtContent.value = await response.text();
      isLoadingTxt.value = false;
      loadTxtError.value = false;
    } else if (response.status === 404) {
      setTxt404(path);
      txtContent.value = '';
      isLoadingTxt.value = false;
      loadTxtError.value = false;
    } else {
      txtContent.value = '';
      isLoadingTxt.value = false;
      loadTxtError.value = true;
    }
  } catch (e) {
    txtContent.value = '';
    isLoadingTxt.value = false;
    loadTxtError.value = true;
  }
};

const retryLoadTxt = () => {
  if (props.script && props.script.path) {
    fetchTxtContent(props.script.path);
  }
};

const handleSubscribe = (item) => {
  if (item.path) {
    downloadScript(item);
  }
};

const downloadScript = async (script) => {
  // 创建一个包含脚本路径的数组
  const subscriptionData = [script.path];

  // 将数组转换为 JSON 字串
  const jsonString = JSON.stringify(subscriptionData);
  const base64String = btoa(encodeURIComponent(jsonString));

  const fullUrl = `bettergi://script?import=${base64String}`;

  if (mode === 'single') {
    try {
      await subscribeToLocal(fullUrl);
    } catch (error) {
      console.error('订阅失败:', error);
      Message.error(`订阅失败: ${error.message}`);
    }
  } else {
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

// 监听脚本变化，设置加载状态
watch(() => props.script, (newScript) => {
  if (newScript && newScript.path) {
    fetchTxtContent(newScript.path);
  } else {
    txtContent.value = '';
    isLoadingTxt.value = false;
    loadTxtError.value = false;
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

.txt-content-plain {
  margin-top: 10px;
  color: #222;
  font-size: 15px;
  white-space: pre-wrap;
  word-break: break-all;
}

.desc-block {
  margin-bottom: 16px;
  background: #f4f8ff;
  border-radius: 6px;
  padding: 12px 16px;
}

.desc-title {
  font-weight: bold;
  color: #1677ff;
  margin-bottom: 4px;
}

.desc-content {
  color: #333;
  font-size: 15px;
  line-height: 1.7;
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
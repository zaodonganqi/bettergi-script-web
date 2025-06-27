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
        <div v-if="isLoading" class="readme-loading">
          <a-spin />
        </div>
        <div v-else-if="readmeContent" v-html="readmeContent" class="readme-content"></div>
        <div v-else-if="script.desc" class="detail-desc">{{ '简介：\n' + script.desc }}</div>
        <div v-else class="readme-empty">暂无描述</div>
      </div>
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
import { ref, watch } from 'vue';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { useClipboard } from '@vueuse/core';
import { message as Message } from 'ant-design-vue';

const props = defineProps({
  script: {
    type: Object,
    default: null
  }
});

const mode = import.meta.env.VITE_MODE;
const selectedRepo = ref({ value: 'local' });

const input = ref('');
const readmeContent = ref('');
const isLoading = ref(false);
const error = ref(null);
const { copy } = useClipboard();

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
}).use(markdownItAnchor, {
  level: [1, 2, 3, 4, 5, 6]
});

// 添加 target="_blank" 属性到所有链接，以外链形式打开
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const aIndex = tokens[idx].attrIndex('target');
 
  if (aIndex !== -1) {
    return self.renderToken(tokens, idx, options);
  }
 
  // 添加 target="_blank" 属性
  tokens[idx].attrPush(['target', '_blank']);
  tokens[idx].attrPush(['rel', 'noopener noreferrer']);
 
  return self.renderToken(tokens, idx, options);
};

// 获取readme文件内容
const getReadmeContent = (tag) => {
  const baseReadmeUrl = "https://raw.githubusercontent.com/babalae/bettergi-scripts-list/refs/heads/main/repo/";
  const encodedTag = tag
  return `${baseReadmeUrl}${encodedTag}/README.md`;
};

const fetchAndRenderReadme = async (path) => {
  if (!path) {
    readmeContent.value = '';
    return;
  }
  isLoading.value = true;
  error.value = null;
  readmeContent.value = '';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const readmeUrl = getReadmeContent(path);
    const response = await fetch(readmeUrl, { signal: controller.signal });
    if (response.ok) {
      const markdown = await response.text();
      readmeContent.value = md.render(markdown);
    } else {
      readmeContent.value = '';
    }
  } catch (e) {
    readmeContent.value = '';
    console.error('Failed to fetch README:', e);
  } finally {
    clearTimeout(timeoutId);
    isLoading.value = false;
  }
};

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

  if (mode.value === 'single') {
    if (selectedRepo.value === 'local') {
      try {
        await subscribeToLocal(fullUrl);
      } catch (error) {
        console.error('订阅失败:', error);
        Message.error(`订阅失败: ${error.message}`);
      }
    } else {
      copy(fullUrl).then(() => {
        Message.success(`订阅链接已复制，回到地图追踪页面以继续导入`);
      }).catch((error) => {
        console.error('复制到剪贴板失败:', error);
        Message.error(`复制 ${script.name} 的订阅链接失败`);
      });
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
      fetchAndRenderReadme(newScript.path);
    } else {
      readmeContent.value = '';
      isLoading.value = false;
      error.value = null;
    }
  },
  { immediate: true }
);
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

.detail-desc {
  padding-top: 16px;
  color: #000;
  font-size: 15px;
  white-space: pre-line;
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

.detail-readme {
  flex-grow: 1;
  overflow-y: auto;
  min-height: 100px;
  padding-top: 16px;
}

.readme-content {
  color: #000;
  font-size: 15px;
  line-height: 1.8;
}

.readme-content :deep(h1),
.readme-content :deep(h2),
.readme-content :deep(h3),
.readme-content :deep(h4),
.readme-content :deep(h5),
.readme-content :deep(h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
}

.readme-content :deep(h1) { font-size: 2em; }
.readme-content :deep(h2) { font-size: 1.5em; }
.readme-content :deep(h3) { font-size: 1.25em; }
.readme-content :deep(h4) { font-size: 1em; }
.readme-content :deep(h5) { font-size: 0.875em; }
.readme-content :deep(h6) { font-size: 0.85em; }

.readme-content :deep(p) {
  margin-bottom: 16px;
}

.readme-content :deep(ul),
.readme-content :deep(ol) {
  padding-left: 20px;
}

.readme-content :deep(pre) {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
}

.readme-content :deep(code) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}

.readme-content :deep(blockquote) {
  border-left: 0.25em solid #dfe2e5;
  color: #6a737d;
  padding: 0 1em;
  margin-left: 0;
}

.readme-content :deep(table) {
  border-collapse: collapse;
  margin: 1rem 0;
  display: block;
  overflow-x: auto;
}

.readme-content :deep(tr) {
  border-top: 1px solid #c6cbd1;
}

.readme-content :deep(tr:nth-child(2n)) {
  background-color: #f6f8fa;
}

.readme-content :deep(th),
.readme-content :deep(td) {
  border: 1px solid #dfe2e5;
  padding: 0.6em 1em;
}

.readme-loading {
  text-align: center;
  margin-top: 40px;
}

.readme-empty,
.readme-error {
  color: #bbb;
  text-align: center;
  margin-top: 40px;
  font-size: 16px;
}
</style> 
```vue
<template>
  <div class="readme-viewer">
    <div v-if="readmeContent" v-html="readmeContent" class="readme-content"></div>
    <div v-else-if="desc" class="detail-desc">{{ showDescTitle ? '简介：\n' + desc : desc }}</div>
    <div v-else class="readme-empty">暂无描述</div>
  </div>
</template>

<script setup>
import { ref, watch, defineEmits } from 'vue';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { message } from 'ant-design-vue';

const props = defineProps({
  path: String,
  desc: String,
  showDescTitle: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['loaded', 'error', 'hasContent']);
const readmeContent = ref('');
const isLoading = ref(false);
const loadError = ref(null);

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

// 处理链接渲染逻辑
const originalLinkRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const hrefIndex = token.attrIndex('href');
  if (hrefIndex >= 0) {
    const href = token.attrs[hrefIndex][1];
    const isValidHttpLink = /^https?:\/\/[\S]+$/i.test(href);
    const isPotentialLink = /^[a-z0-9-]+\.[a-z]{2,}\b/i.test(href);
    if (isValidHttpLink) {
      token.attrPush(['target', '_blank']);
      token.attrPush(['rel', 'noopener noreferrer']);
    } else if (isPotentialLink) {
      token.attrPush(['class', 'invalid-link']);
      token.attrPush(['onclick', 'return false;']);
      token.attrPush(['style', 'cursor: default;']);
      const textToken = tokens[idx + 1];
      if (textToken && textToken.type === 'text') {
        textToken.content += '（这个作者很笨，把链接写错了，去提醒ta修改吧）';
      }
    }
  }
  return originalLinkRender(tokens, idx, options, env, self);
};

// 获取readme文件URL
function getReadmeContent(path) {
  return `https://raw.githubusercontent.com/babalae/bettergi-scripts-list/refs/heads/main/repo/${path.replace(/\\/g, '/')}/README.md`;
}

// 获取并渲染readme内容
const fetchAndRenderReadme = async (path) => {
  if (!path) {
    readmeContent.value = '';
    emit('loaded');
    emit('hasContent', false);
    return;
  }
  isLoading.value = true;
  loadError.value = null;
  readmeContent.value = '';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const readmeUrl = getReadmeContent(path);
    const response = await fetch(readmeUrl, { signal: controller.signal });
    if (response.ok) {
      let markdown = await response.text();
      // 处理图片路径，将相对路径转换为绝对路径
      markdown = markdown.replace(/!\[([^\]]*)\]\((?!https?:\/\/|data:)((assets[\/\\][^)]+))\)/gi, (match, alt, imgPath) => {
        let cleanPath = imgPath.trim().replace(/\\/g, '/');
        return `![${alt}](${readmeUrl.replace('README.md', '')}${cleanPath})`;
      });
      markdown = markdown.replace(/<img\s+[^>]*src=["']((assets[\/\\][^"'>]+))["'][^>]*>/gi, (match, imgPath) => {
        let cleanPath = imgPath.trim().replace(/\\/g, '/');
        return match.replace(imgPath, readmeUrl.replace('README.md', '') + cleanPath);
      });
      markdown = markdown.replace(/`((assets[\/\\][^`\n]+\.(?:png|jpg|jpeg|gif|webp|svg)))`/gi, (match, imgPath) => {
        let cleanPath = imgPath.trim().replace(/\\/g, '/');
        return `![](${readmeUrl.replace('README.md', '')}${cleanPath})`;
      });
      markdown = markdown.replace(/```\s*((assets[\/\\][^`\n]+\.(?:png|jpg|jpeg|gif|webp|svg)))\s*```/gi, (match, imgPath) => {
        let cleanPath = imgPath.trim().replace(/\\/g, '/');
        return `![](${readmeUrl.replace('README.md', '')}${cleanPath})`;
      });
      readmeContent.value = md.render(markdown);
      emit('loaded');
      emit('hasContent', true);
    } else if (response.status === 404) {
      readmeContent.value = '';
      emit('loaded');
      emit('hasContent', false);
    } else {
      readmeContent.value = '';
      loadError.value = '加载失败';
      emit('error', '加载失败');
      emit('hasContent', false);
    }
  } catch (e) {
    readmeContent.value = '';
    if (e.name === 'AbortError') {
      loadError.value = '加载超时';
      emit('error', '加载超时');
    } else {
      loadError.value = '加载失败';
      emit('error', '加载失败');
    }
    emit('hasContent', false);
  } finally {
    clearTimeout(timeoutId);
    isLoading.value = false;
  }
};

// 监听路径变化
watch(
  () => props.path,
  (newPath) => {
    fetchAndRenderReadme(newPath);
  },
  { immediate: true }
);
</script>

<style scoped>
.readme-viewer {
  width: 100%;
}

.readme-content {
  color: #000;
  font-size: 15px;
  line-height: 1.8;
  word-break: break-word;
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

.readme-content :deep(.invalid-link) {
  color: #ff4d4f;
  text-decoration: line-through;
  pointer-events: none;
  cursor: default;
}

.readme-content :deep(.link-hint) {
  color: #ff4d4f !important;
  font-size: 0.85em;
  font-style: italic;
  margin-left: 4px;
  display: inline-block;
}

.readme-content :deep(.link-hint *) {
  color: #ff4d4f !important;
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
  margin-bottom: 1.5em;
}

.readme-content :deep(pre code) {
  display: block;
  background: none;
  margin: 0;
  padding: 0;
  font-size: 1em;
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

.readme-empty {
  color: #bbb;
  text-align: center;
  margin-top: 40px;
  font-size: 16px;
}

.detail-desc {
  padding-top: 16px;
  color: #000;
  font-size: 15px;
  white-space: pre-line;
  word-break: break-word;
}
</style>
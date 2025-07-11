```vue
<template>
  <div class="readme-viewer">
    <div v-if="readmeContent" v-html="readmeContent" class="readme-content"></div>
    <div v-else-if="desc" class="detail-desc">{{ showDescTitle ? '简介：\n' + desc : desc }}</div>
    <div v-else class="readme-empty">暂无描述</div>
  </div>
</template>

<script setup>
import { ref, watch, defineEmits, nextTick } from 'vue';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { message } from 'ant-design-vue';
import { CopyOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  path: String,
  desc: String,
  showDescTitle: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['loaded', 'error']);
const readmeContent = ref('');
const isLoading = ref(false);
const loadError = ref(null);

function addCopyButtons() {
  nextTick(() => {
    const blocks = document.querySelectorAll('.readme-content pre code');
    blocks.forEach(block => {
      const pre = block.parentElement;
      if (pre && !pre.classList.contains('has-copy-btn')) {
        pre.classList.add('has-copy-btn');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'copy-btn github-copy-btn';
        btn.setAttribute('aria-label', '复制');
        btn.setAttribute('tabindex', '0');
        btn.innerHTML = `
          <span class="icon-copy show">
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>
          </span>
          <span class="icon-check">
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg>
          </span>
          <span class="copy-tooltip">复制</span>
        `;
        let timer = null;
        btn.onclick = () => {
          navigator.clipboard.writeText(block.innerText).then(() => {
            btn.querySelector('.icon-copy').classList.remove('show');
            btn.querySelector('.icon-check').classList.add('show');
            btn.querySelector('.copy-tooltip').textContent = '已复制';
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
              btn.querySelector('.icon-copy').classList.add('show');
              btn.querySelector('.icon-check').classList.remove('show');
              btn.querySelector('.copy-tooltip').textContent = '复制';
            }, 2000);
          });
        };
        btn.onmouseenter = () => {
          btn.querySelector('.copy-tooltip').style.opacity = 1;
        };
        btn.onmouseleave = () => {
          btn.querySelector('.copy-tooltip').style.opacity = 0;
        };
        pre.insertBefore(btn, pre.firstChild);
      }
    });
  });
}

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

// 恢复对链接的正则判断和渲染逻辑
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

function getReadmeContent(path) {
  return `https://raw.githubusercontent.com/babalae/bettergi-scripts-list/refs/heads/main/repo/${path.replace(/\\/g, '/')}/README.md`;
}

const fetchAndRenderReadme = async (path) => {
  if (!path) {
    readmeContent.value = '';
    emit('loaded');
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
      // 只处理以 assets/ 或 assets\ 开头的图片路径
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
      addCopyButtons();
      emit('loaded');
    } else if (response.status === 404) {
      readmeContent.value = '';
      emit('loaded');
    } else {
      readmeContent.value = '';
      loadError.value = '加载失败';
      emit('error', '加载失败');
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
  } finally {
    clearTimeout(timeoutId);
    isLoading.value = false;
  }
};

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
  padding: 16px 16px 16px 16px;
  overflow: auto;
  margin-bottom: 1.5em;
}
.readme-content pre code {
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
.readme-content pre {
  position: relative;
  background: #f6f8fa;
  border-radius: 6px;
  padding: 16px 16px 16px 16px;
  overflow: auto;
  margin-bottom: 1.5em;
}
.readme-content pre code {
  display: block;
  background: none;
  margin: 0;
  padding: 0;
  font-size: 1em;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}
.copy-btn.github-copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6f8fa;
  border: none;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(27,31,35,.04),0 1.5px 6px rgba(27,31,35,.08);
  cursor: pointer;
  z-index: 10;
  padding: 0;
  transition: background 0.2s, box-shadow 0.2s;
}
.copy-btn.github-copy-btn:active {
  background: #eaeef2;
}
.copy-btn.github-copy-btn:hover, .copy-btn.github-copy-btn:focus {
  background: #eaeef2;
  box-shadow: 0 4px 16px rgba(24, 119, 255, 0.12);
}
.copy-btn.github-copy-btn .icon-copy,
.copy-btn.github-copy-btn .icon-check {
  display: none;
  color: #57606a;
  transition: color 0.2s;
}
.copy-btn.github-copy-btn .icon-copy.show {
  display: block;
}
.copy-btn.github-copy-btn .icon-check.show {
  display: block;
  color: #1a7f37;
}
.copy-btn.github-copy-btn .copy-tooltip {
  position: absolute;
  top: -32px;
  right: 0;
  background: #24292f;
  color: #fff;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  opacity: 0;
  pointer-events: none;
  white-space: nowrap;
  transition: opacity 0.2s;
  z-index: 99;
}
.copy-btn.github-copy-btn:hover .copy-tooltip,
.copy-btn.github-copy-btn:focus .copy-tooltip {
  opacity: 1;
}
</style>
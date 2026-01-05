<template>
  <div class="readme-viewer">
    <div v-if="readmeContent" v-html="readmeContent" class="readme-content"></div>
    <div v-else-if="desc" class="detail-desc">{{
        showDescTitle ? $t('readmeViewer.descTitle') + '\n' + desc : desc
      }}
    </div>
    <div v-else-if="!isHttpUrl && showNoDesc" class="readme-empty">{{ $t('readmeViewer.noDesc') }}</div>
  </div>
</template>

<script setup>
import {ref, watch, computed} from 'vue';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import {getWebPath, getRepoPath, getMirrorPath, getMirror} from '@/utils/basePaths.js';
import {useI18n} from 'vue-i18n';
import {onMounted, onUnmounted, nextTick} from 'vue';
import mermaid from 'mermaid';

const {t} = useI18n();

const props = defineProps({
  path: {
    type: String,
    default: ''
  },
  desc: {
    type: String,
  },
  showDescTitle: {
    type: Boolean,
    default: false
  },
  showNoDesc: {
    type: Boolean,
    default: false
  },
  forceWeb: {
    type: Boolean,
    default: false
  },
  markdownContent: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['loaded', 'error', 'hasContent']);
const readmeContent = ref('');
const isLoading = ref(false);
const loadError = ref(null);
const useMirror = ref(false);

// 判断是否为 HTTP URL
const isHttpUrl = computed(() => {
  return props.path && /^https?:\/\//i.test(props.path);
});

const md = new MarkdownIt({
  html: true,
  linkify: false,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && lang.toLowerCase() === 'mermaid') {
      return `<div class="mermaid">${md.utils.escapeHtml(str.trim())}</div>`;
    }
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
            hljs.highlight(str, {language: lang, ignoreIllegals: true}).value +
            '</code></pre>';
      } catch (__) {
      }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
}).use(markdownItAnchor, {
  level: [1, 2, 3, 4, 5, 6]
});

const mermaidObserver = ref(null);
const initMermaid = async () => {
  // 初始化 mermaid 配置
  mermaid.initialize({
    startOnLoad: false,
    theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
    // securityLevel: 'loose',
    securityLevel: 'strict',
    flowchart: {useMaxWidth: true},
    sequence: {useMaxWidth: true},
  });

  if (mermaidObserver.value) {
    mermaidObserver.value.disconnect();
  }
  await nextTick();

  const container = document.querySelector('.readme-viewer');
  if (!container) return;

  // 创建 observer 监听整个 viewer（因为 .readme-content 是 v-if，可能反复创建销毁）
  mermaidObserver.value = new MutationObserver(async () => {
    const mermaidEls = container.querySelectorAll('.mermaid:not([data-processed])');
    if (mermaidEls.length > 0) {
      try {
        await mermaid.run({
          nodes: mermaidEls,
        });
        // 标记已处理，避免重复渲染
        mermaidEls.forEach(el => el.setAttribute('data-processed', 'true'));
      } catch (err) {
        console.warn('Mermaid render error:', err);
      }
    }
  });

  mermaidObserver.value.observe(container, {
    childList: true,
    subtree: true,
  });

  // 立即尝试渲染一次（处理初始加载）
  const initialEls = container.querySelectorAll('.mermaid:not([data-processed])');
  if (initialEls.length > 0) {
    try {
      await mermaid.run({nodes: initialEls});
      initialEls.forEach(el => el.setAttribute('data-processed', 'true'));
    } catch (err) {
      console.warn('Mermaid initial render error:', err);
    }
  }
};

// 组件挂载时初始化
onMounted(() => {
  nextTick(() => {
    initMermaid();
  });
});

// 监听内容变化 → 重新初始化（因为 v-html 会完全替换内容）
watch(readmeContent, () => {
  nextTick(() => {
    initMermaid();
  });
});

// 组件销毁时清理 observer
onUnmounted(() => {
  if (mermaidObserver.value) {
    mermaidObserver.value.disconnect();
    mermaidObserver.value = null;
  }
});

// 脚注处理
function processFootnotes(rawMarkdown) {
  if (!rawMarkdown) return rawMarkdown;

  const lines = rawMarkdown.split(/\r?\n/);
  const footnoteIdToText = {};
  const keptLines = [];

  // 提取脚注定义
  for (let i = 0; i < lines.length;) {
    const defMatch = lines[i].match(/^\[\^([^\]]+)\]:\s*(.*)$/);
    if (defMatch) {
      const id = defMatch[1];
      let text = defMatch[2] || '';
      i++;
      while (i < lines.length && /^( {2,}|\t)/.test(lines[i])) {
        text += '\n' + lines[i].replace(/^( {2,}|\t)/, '');
        i++;
      }
      footnoteIdToText[id] = (text || '').trim();
      continue;
    }
    keptLines.push(lines[i]);
    i++;
  }

  let content = keptLines.join('\n');

  // 替换脚注引用为页面内上标锚点
  const idToRefCount = {};
  content = content.replace(/\[\^([^\]]+)\]/g, (m, id) => {
    const count = (idToRefCount[id] || 0) + 1;
    idToRefCount[id] = count;
    const refId = count === 1 ? `fnref:${id}` : `fnref:${id}-${count}`;
    return `<sup id="${refId}" class="footnote-ref"><a href="#fn:${id}">[${id}]</a></sup>`;
  });

  const footnoteIds = Object.keys(footnoteIdToText);
  if (footnoteIds.length === 0) return content;

  // 生成文末脚注 HTML
  let footnotesHtml = '\n\n<div class="footnotes">\n<hr/>\n<ol>\n';
  for (const id of footnoteIds) {
    const htmlText = md.renderInline(footnoteIdToText[id] || '');
    footnotesHtml += `<li id="fn:${id}"><p>${htmlText} <a href="#fnref:${id}" class="footnote-backref" aria-label="back to content">↩</a></p></li>\n`;
  }
  footnotesHtml += '</ol>\n</div>\n';

  return content + footnotesHtml;
}

// 处理链接渲染逻辑
const originalLinkRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const hrefIndex = token.attrIndex('href');
  if (hrefIndex >= 0) {
    const href = token.attrs[hrefIndex][1];
    const isValidHttpLink = /^https?:\/\/[\S]+$/i.test(href);
    const isRelativePath = /^\.\.?\//.test(href) || /^[^\/]*\/[^\/]+(?:\/[^\/]+)*$/i.test(href);
    const isPotentialLink = /^[a-z0-9-]+\.[a-z]{2,}\b/i.test(href);

    // 检查是否为带后缀的文件路径
    const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(href);
    const isImageFile = /\.(png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff)$/i.test(href);
    const isNonImageFile = hasFileExtension && !isImageFile;

    // 如果是非图片文件路径且不是完整的HTTP链接，禁用链接功能
    if (isNonImageFile && !isValidHttpLink) {
      token.attrPush(['class', 'text-only-link']);
      token.attrPush(['onclick', 'return false;']);
      token.attrPush(['style', 'cursor: default; text-decoration: none; color: inherit;']);
      token.attrPush(['title', '仅显示文本，不作为链接']);
      return originalLinkRender(tokens, idx, options, env, self);
    }

    // 更精确的相对路径判断：排除明显不是路径的情况
    const isActuallyRelativePath = isRelativePath &&
        !href.includes('://') &&
        !href.includes('mailto:') &&
        !href.includes('tel:') &&
        !href.includes('javascript:') &&
        !isValidHttpLink && // 使用已经验证的HTTP链接检查
        !/\.(png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff)$/i.test(href); // 排除图片文件路径

    if (isValidHttpLink) {
      token.attrPush(['target', '_blank']);
      token.attrPush(['rel', 'noopener noreferrer']);
    } else if (isActuallyRelativePath) {
      // 处理相对路径链接，转换为GitHub web界面链接
      const baseUrl = getWebPath();
      const currentPath = props.path || '';

      // 解析相对路径
      let targetPath = href;

      // 处理相对路径
      if (href.startsWith('../') || href.startsWith('./')) {
        // 标准化当前路径（移除末尾的斜杠）
        const normalizedCurrentPath = currentPath.replace(/\/$/, '');

        // 分割路径部分
        const currentParts = normalizedCurrentPath.split('/').filter(Boolean);
        const relativeParts = href.split('/').filter(part => part !== '.' && part !== '');

        // 计算需要回退的层级
        let backLevels = 0;
        for (const part of relativeParts) {
          if (part === '..') backLevels++;
          else break;
        }

        // 构建目标路径
        if (backLevels <= currentParts.length) {
          targetPath = [
            ...currentParts.slice(0, -backLevels),
            ...relativeParts.slice(backLevels)
          ].join('/');
        } else {
          // 如果回退层级超过当前路径深度，从仓库根目录开始
          targetPath = relativeParts.slice(backLevels).join('/');
        }
      } else {
        // 非标准相对路径（如直接写路径的情况）
        targetPath = currentPath ? `${currentPath}/${href}` : href;
      }
      // 移除路径中的多余斜杠和点
      targetPath = targetPath
          .replace(/\/+/g, '/')
          .replace(/^\/|\/$/g, '')
          .replace(/\/\.(?=\/|$)/g, '');

      // 判断是否为文件（有扩展名）还是目录
      const isFile = /\.[a-zA-Z0-9]+$/.test(targetPath);
      const githubUrl = baseUrl + targetPath;

      token.attrs[hrefIndex][1] = githubUrl;
      token.attrPush(['target', '_blank']);
      token.attrPush(['rel', 'noopener noreferrer']);
      token.attrPush(['class', 'internal-link']);
      token.attrPush(['title', isFile ? t('readmeViewer.clickToViewFile') : t('readmeViewer.clickToViewDir')]);
    } else if (isPotentialLink) {
      token.attrPush(['class', 'invalid-link']);
      token.attrPush(['onclick', 'return false;']);
      token.attrPush(['style', 'cursor: default;']);
      const textToken = tokens[idx + 1];
      if (textToken && textToken.type === 'text') {
        textToken.content += t('readmeViewer.invalidLinkHint');
      }
    }
  }
  return originalLinkRender(tokens, idx, options, env, self);
};

// 获取readme文件URL
function getReadmeUrl(path) {

  // 检查是否已经是外链（以 http:// 或 https:// 开头）
  if (/^https?:\/\//i.test(path)) {
    // 外链是否需要加速
    if (useMirror.value) {
      return getMirror() + path;
    }
    return path;
  }
  // 检查是否需要加速
  if (useMirror.value) {
    return getMirrorPath() + path.replace(/\\/g, '/') + '/README.md';
  }
  return getRepoPath() + path.replace(/\\/g, '/') + '/README.md';
}

function isReadme404(path) {
  return !!localStorage.getItem('readme404:' + path);
}

// 获取并渲染readme内容
const fetchAndRenderReadme = async (path, markdownContent = '') => {
  if (!markdownContent) {
    if (!path) {
      readmeContent.value = '';
      emit('loaded');
      emit('hasContent', false);
      return;
    }
    if (isReadme404(path)) {
      readmeContent.value = '';
      emit('loaded', {status: '404'});
      emit('hasContent', false);
      return;
    }
  }
  isLoading.value = true;
  loadError.value = null;
  readmeContent.value = '';

  let mode = import.meta.env.VITE_MODE;
  let markdown = '';
  let fetchError = null;
  if (props.forceWeb) {
    mode = 'web';
  }
  if (props.markdownContent) {
    markdown = props.markdownContent;
  } else {
    if (mode === 'single') {
      try {
        const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
        markdown = await repoWebBridge.GetFile(path.replace(/\\/g, '/') + '/README.md');
      } catch (e) {
        fetchError = e;
      }
      if (fetchError) {
        readmeContent.value = '';
        if (fetchError.name === 'AbortError') {
          loadError.value = t('readmeViewer.loadTimeout');
          emit('loaded', {status: 'error', message: t('readmeViewer.loadTimeout')});
          emit('error', t('readmeViewer.loadTimeout'));
        } else {
          loadError.value = t('readmeViewer.loadFailed');
          emit('loaded', {status: 'error', message: t('readmeViewer.loadFailed')});
          emit('error', t('readmeViewer.loadFailed'));
        }
        emit('hasContent', false);
        isLoading.value = false;
        return;
      }
      if (markdown === '404') {
        readmeContent.value = '';
        emit('loaded', {status: '404'});
        emit('hasContent', false);
        isLoading.value = false;
        return;
      }
      // 先渲染 Markdown 为 HTML
      markdown = processFootnotes(markdown);
      let html = md.render(markdown);

      // 统一收集资源
      const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
      const basePath = path ? path.replace(/\\/g, '/') + '/' : '';

      // key: 原始 src
      // value: { base64, mime, replacements: [] }
      const resourceMap = new Map();

      // HTML img
      const imgRegex = /<img\s+([^>]*\s)?src=["']([^"']+)["']([^>]*)>/gi;

      let match;
      while ((match = imgRegex.exec(html)) !== null) {
        const fullImgTag = match[0];
        const beforeSrc = match[1] || '';
        const srcValue = match[2];
        const afterSrc = match[3] || '';

        // 跳过 http / data
        if (/^https?:\/\//i.test(srcValue) || srcValue.startsWith('data:')) {
          continue;
        }

        const cleanSrc = srcValue.trim().replace(/\\/g, '/');

        // 构建完整路径
        const fullPath = cleanSrc.startsWith('/')
            ? cleanSrc.substring(1)
            : basePath + cleanSrc;

        if (!resourceMap.has(fullPath)) {
          // 推断 mime
          const ext = cleanSrc.split('.').pop()?.toLowerCase();
          let mime = 'image/png';
          if (ext === 'jpg' || ext === 'jpeg') mime = 'image/jpeg';
          else if (ext === 'gif') mime = 'image/gif';
          else if (ext === 'webp') mime = 'image/webp';
          else if (ext === 'svg') mime = 'image/svg+xml';

          resourceMap.set(fullPath, {
            base64: null,
            mime,
            replacements: []
          });
        }

        resourceMap.get(fullPath).replacements.push({
          original: fullImgTag,
          replacement: (base64, mime) =>
              `<img ${beforeSrc}src="data:${mime};base64,${base64}"${afterSrc}>`
        });
      }

      // 统一 GetFile
      for (const [fullPath, data] of resourceMap.entries()) {
        try {
          const base64 = await repoWebBridge.GetFile(fullPath);
          if (base64 && base64 !== '404') {
            data.base64 = base64;
          }
        } catch (e) {
          console.error('Image load fail', fullPath, e);
        }
      }

      // 统一注入 HTML
      for (const [, data] of resourceMap.entries()) {
        if (!data.base64) continue;

        for (const {original, replacement} of data.replacements) {
          html = html.replace(
              original,
              replacement(data.base64, data.mime)
          );
        }
      }

      readmeContent.value = html;
      emit('loaded', {status: 'ok'});
      emit('hasContent', true);
      isLoading.value = false;
      return;
    } else {
      // 拼接完整URL
      const readmeUrl = getReadmeUrl(path);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      try {
        const response = await fetch(readmeUrl, {signal: controller.signal});
        if (response.ok) {
          markdown = await response.text();
        } else if (response.status === 404) {
          readmeContent.value = '';
          emit('loaded', {status: '404'});
          emit('hasContent', false);
          clearTimeout(timeoutId);
          isLoading.value = false;
          return;
        } else {
          useMirror.value = true;
          fetchError = new Error('Load failed');
        }
      } catch (e) {
        fetchError = e;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    // 处理图片路径，将相对路径转换为绝对路径
    let baseImageUrl;
    if (props.forceWeb) {
      baseImageUrl = path.replace(/README\.md$/i, "");
      if (!baseImageUrl.endsWith('/')) {
        baseImageUrl += '/';
      }
    } else {
      baseImageUrl = getRepoPath() + path.replace(/\\/g, '/') + '/';
    }

    // 处理markdown图片语法 ![alt](path)
    markdown = markdown.replace(/!\[[^\]]*\]\(([^)]+)\)/g, (match, imgPath) => {
      let cleanPath = imgPath.trim().replace(/\\/g, '/');
      // 检查是否为完整的HTTP/HTTPS链接
      const isHttpUrl = /^https?:\/\/[\S]+$/i.test(cleanPath);
      return match.replace(imgPath, isHttpUrl ? cleanPath : baseImageUrl + cleanPath);
    });

    // 处理HTML img标签
    markdown = markdown.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi, (match, imgPath) => {
      let cleanPath = imgPath.trim().replace(/\\/g, '/');
      // 检查是否为完整的HTTP/HTTPS链接或data URL
      const isHttpUrl = /^https?:\/\/[\S]+$/i.test(cleanPath);
      const isDataUrl = cleanPath.startsWith('data:');
      return match.replace(imgPath, (isHttpUrl || isDataUrl) ? cleanPath : baseImageUrl + cleanPath);
    });

    // 处理代码块中的图片路径
    markdown = markdown.replace(/`([^`\n]+\.(?:png|jpg|jpeg|gif|webp|svg))`/gi, (imgPath) => {
      let cleanPath = imgPath.trim().replace(/\\/g, '/');
      // 检查是否为完整的HTTP/HTTPS链接
      const isHttpUrl = /^https?:\/\/[\S]+$/i.test(cleanPath);
      return `![](${isHttpUrl ? cleanPath : baseImageUrl + cleanPath})`;
    });

    // 处理代码块中的图片路径
    markdown = markdown.replace(/```\s*([^`\n]+\.(?:png|jpg|jpeg|gif|webp|svg))\s*```/gi, (imgPath) => {
      let cleanPath = imgPath.trim().replace(/\\/g, '/');
      // 检查是否为完整的HTTP/HTTPS链接
      const isHttpUrl = /^https?:\/\/[\S]+$/i.test(cleanPath);
      return `![](${isHttpUrl ? cleanPath : baseImageUrl + cleanPath})`;
    });
  }

  if (fetchError) {
    readmeContent.value = '';
    if (fetchError.name === 'AbortError') {
      loadError.value = t('readmeViewer.loadTimeout');
      emit('loaded', {status: 'error', message: t('readmeViewer.loadTimeout')});
      emit('error', t('readmeViewer.loadTimeout'));
    } else {
      loadError.value = t('readmeViewer.loadFailed');
      emit('loaded', {status: 'error', message: t('readmeViewer.loadFailed')});
      emit('error', t('readmeViewer.loadFailed'));
    }
    emit('hasContent', false);
    isLoading.value = false;
    return;
  }

  // 处理HTML iframe标签 - 因跨域问题，在线模式仅提醒
  const iframeNoticeText = t('readmeViewer.iframeNotice') || '由于安全限制，无法直接显示此内容，请使用本地仓库查看';
  markdown = markdown.replace(/<iframe\s+[^>]*src=["']([^"']+)["'][^>]*>/gi, (match, iframePath) => {
    return `<div class="iframe-notice">
      <p>⚠️ ${iframeNoticeText}</p>
    </div>`;
  });
  markdown = processFootnotes(markdown);
  readmeContent.value = md.render(markdown);
  emit('loaded', {status: 'ok'});
  emit('hasContent', true);
  isLoading.value = false;
};

// 监听路径变化
watch(
    () => [props.path, props.markdownContent],
    ([newPath, newContent]) => {
      fetchAndRenderReadme(newPath, newContent);
    },
    {immediate: true}
);
</script>

<style scoped>
.readme-viewer {
  width: 100%;
  margin-top: 10px;
  padding-left: 10px;
}

.readme-content {
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

.readme-content :deep(h1) {
  font-size: 2em;
}

.readme-content :deep(h2) {
  font-size: 1.5em;
}

.readme-content :deep(h3) {
  font-size: 1.25em;
}

.readme-content :deep(h4) {
  font-size: 1em;
}

.readme-content :deep(h5) {
  font-size: 0.875em;
}

.readme-content :deep(h6) {
  font-size: 0.85em;
}

.readme-content :deep(p) {
  margin-bottom: 16px;
}

.readme-content :deep(a) {
  color: var(--color-primary);
}

.readme-content :deep(.invalid-link) {
  color: #ff4d4f;
  text-decoration: line-through;
  pointer-events: none;
  cursor: default;
}

.readme-content :deep(.text-only-link) {
  color: var(--color-primary);
  text-decoration: none !important;
  pointer-events: none;
  cursor: default;
}

.readme-content :deep(.internal-link) {
  text-decoration: none;
  border-bottom: 1px dashed;
  transition: all 0.3s ease;
}

.readme-content :deep(.internal-link:hover) {
  text-decoration: none;
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
  background: var(--bg-desc);
  border-radius: 10px;
  padding: 16px 20px;
  margin-right: 10px;
  overflow: auto;
  margin-bottom: 1.5em;
  font-size: 90%;
  line-height: 1.5;
}

.readme-content :deep(pre code) {
  display: inline;
  background: none;
  margin: 0;
  padding: 0;
  line-height: inherit;
  word-wrap: normal;
}

.readme-content :deep(.hljs) {
  color: var(--text-base);
}

.readme-content :deep(blockquote) {
  border-left: 0.25em solid var(--text-base3);
  color: var(--text-base2);
  padding: 0 1em;
  margin-left: 0;
}

:deep(.hljs-punctuation) {
  color: var(--text-base);
}

:deep(.hljs-string) {
  color: var(--text-base2);
}

:deep(.hljs-attr) {
  color: var(--color-primary);
}

.readme-content :deep(table) {
  border-collapse: collapse;
  margin: 1rem 0;
  display: block;
  overflow-x: auto;
}

.readme-content :deep(hr) {
  height: 1px;
  background-color: var(--border-base);
  border-color: var(--border-base);
}

.readme-content :deep(tr) {
  border: 1px solid var(--border-base);
}

.readme-content :deep(tr:nth-child(2n)) {
  background-color: var(--bg-menu);
}

.readme-content :deep(tbody) {
  border-color: var(--border-base);
}

.readme-content :deep(th),
.readme-content :deep(td) {
  border: 1px solid var(--border-base);
  padding: 0.6em 1em;
}

.readme-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em auto;
}

.readme-empty {
  color: var(--text-base4);
  text-align: center;
  margin-top: 40px;
  font-size: 16px;
}

.detail-desc {
  padding-top: 16px;
  font-size: 15px;
  white-space: pre-line;
  word-break: break-word;
}

.readme-content :deep(.iframe-notice) {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 16px;
  margin: 16px 0;
  text-align: center;
  color: #856404;
}

.readme-content :deep(.iframe-notice p) {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.readme-content :deep(.mermaid svg) {
  background: transparent !important;
}


.readme-content :deep(.mermaid text),
.readme-content :deep(.mermaid tspan) {
  fill: #ffffff !important;
  font-weight: 600 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif !important;
}

.readme-content :deep(.mermaid text),
.readme-content :deep(.mermaid tspan) {
  paint-order: stroke fill;
  stroke: #000000 !important;
  stroke-width: 2px !important;
  stroke-linejoin: round !important;
}

.readme-content :deep(.mermaid .messageText) {
  font-weight: 700 !important;
  stroke-width: 3px !important;
}

.readme-content :deep(.mermaid .loopText tspan),
.readme-content :deep(.mermaid .altText tspan),
.readme-content :deep(.mermaid .noteText) {
  fill: #ffd700 !important;
  font-weight: bold !important;
  stroke: #000000 !important;
  stroke-width: 3px !important;
}

.readme-content :deep(.mermaid .actor text) {
  font-weight: 700 !important;
  stroke-width: 3px !important;
}

.readme-content :deep(.mermaid .actor) {
  stroke: #ffffff !important;
  stroke-width: 2px !important;
}
</style>

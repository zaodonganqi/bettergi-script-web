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
      <div v-if="script.desc" class="detail-desc">{{ script.desc }}</div>
      <div v-else class="detail-desc">暂无描述</div>
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
import { ref } from 'vue';
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
const { copy } = useClipboard();

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
  border-top: 1px solid #eee;
  padding-top: 16px;
  color: #000;
  font-size: 15px;
  white-space: pre-line;
}

.detail-empty {
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
</style> 
<template>
  <div class="script-panel">
    <!-- 脚本列表 -->
    <div class="script-list">
      <div
        v-for="item in scripts"
        :key="item.id"
        :class="['script-item', { active: item.id === selectedId }]"
        @click="selectScript(item.id)"
      >
        <div class="item-header">
          <span class="item-title">{{ item.title }}</span>
          <span v-if="item.unread" class="item-dot"></span>
        </div>
        <div class="item-author">{{ item.author }}</div>
        <div class="item-desc">{{ item.desc }}</div>
        <div class="item-tags">
          <a-tag v-for="tag in item.tags" :key="tag" color="#e6f0ff" class="item-tag">{{ tag }}</a-tag>
        </div>
        <div class="item-time">{{ item.time }}</div>
      </div>
    </div>
    <!-- 详情区 -->
    <div class="script-detail">
      <template v-if="current">
        <div class="detail-header">
          <div class="detail-title">{{ current.title }}</div>
          <div class="detail-meta">
            <span class="detail-author">{{ current.author }}</span>
            <span class="detail-desc">{{ current.desc }}</span>
          </div>
          <div class="detail-time">{{ current.time }}</div>
        </div>
        <div class="detail-content">{{ current.detail }}</div>
        <div class="detail-readme">这里是READMD.md</div>
      </template>
      <template v-else>
        <div class="detail-empty">请选择左侧脚本查看详情</div>
      </template>
      <!-- 输入区 -->
      <div class="detail-input-wrap">
        <a-input v-model:value="input" placeholder="评论..." class="detail-input" />
        <a-button type="primary" class="detail-send">Send</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
const scripts = ref([
  {
    id: 1,
    title: '自动的鱼指南',
    author: 'xxx',
    desc: 'Hi, let\'s have a meeting tomorrow to discuss the project...',
    detail: 'Hi, let\'s have a meeting tomorrow to discuss the project details and have some ideas I\'d like to share. It\'s crucial that we...',
    tags: ['钓鱼', '里约', 'JS'],
    time: '1年前',
    unread: true,
  },
  {
    id: 2,
    title: 'Alice Smith',
    author: 'Alice Smith',
    desc: 'Thank you for the project update. It looks great!...',
    detail: 'Thank you for the project update. I\'ve gone through the report, and the progress is impressive. The team has done a fantastic job...',
    tags: ['work', 'important'],
    time: 'over 1 year ago',
    unread: false,
  },
  {
    id: 3,
    title: 'Bob Johnson',
    author: 'Bob Johnson',
    desc: 'Any plans for the weekend? I was thinking of going hiking...',
    detail: 'Any plans for the weekend? I was thinking of going hiking in the nearby mountains. It\'s been a while since we had some outdoor fun...',
    tags: ['personal'],
    time: 'about 2 years ago',
    unread: false,
  },
  {
    id: 4,
    title: 'Emily Davis',
    author: 'Emily Davis',
    desc: 'I have a question about the budget for the upcoming project...',
    detail: 'I have a question about the budget for the upcoming project. It seems like there\'s a discrepancy in the allocation of resources...',
    tags: ['work', 'budget'],
    time: 'about 2 years ago',
    unread: true,
  },
  {
    id: 5,
    title: 'Michael Wilson',
    author: 'Michael Wilson',
    desc: 'I have an important announcement to make during our team meeting...',
    detail: 'I have an important announcement to make during our team meeting. It pertains to a strategic shift in our approach to the upcoming product launch...',
    tags: [],
    time: 'about 2 years ago',
    unread: false,
  },
]);
const selectedId = ref(1);
const input = ref('');
const selectScript = (id) => {
  selectedId.value = id;
};
const current = computed(() => scripts.value.find(i => i.id === selectedId.value));
</script>

<style scoped>
.script-panel {
  display: flex;
  width: 100%;
  height: 100%;
}
.script-list {
  width: 380px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  padding-top: 8px;
}
.script-item {
  background: #fff;
  border-radius: 10px;
  margin: 10px 12px;
  padding: 16px 18px 12px 18px;
  box-shadow: 0 2px 8px 0 #f2f3f5;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: box-shadow 0.2s, border 0.2s, background 0.2s;
  position: relative;
}
.script-item.active {
  border: 1.5px solid #1677ff;
  background: #f5faff;
  box-shadow: 0 4px 16px 0 #e6f0ff;
}
.script-item:hover {
  background: #f0f6ff;
  box-shadow: 0 4px 16px 0 #e6f0ff;
}
.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}
.item-title {
  font-size: 16px;
  font-weight: 700;
  color: #222;
}
.item-dot {
  width: 8px;
  height: 8px;
  background: #1677ff;
  border-radius: 50%;
  margin-left: 8px;
  display: inline-block;
}
.item-author {
  color: #888;
  font-size: 13px;
  margin-bottom: 2px;
}
.item-desc {
  color: #555;
  font-size: 13px;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-tags {
  margin-bottom: 4px;
}
.item-tag {
  background: #e6f0ff !important;
  color: #1677ff !important;
  border-radius: 6px !important;
  font-size: 12px;
  margin-right: 4px;
  padding: 0 8px;
  border: none !important;
}
.item-time {
  color: #aaa;
  font-size: 12px;
  margin-top: 2px;
}

.script-detail {
  flex: 1;
  background: #fff;
  padding: 32px 36px 80px 36px;
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.detail-header {
  margin-bottom: 8px;
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
  margin-bottom: 4px;
}
.detail-author {
  margin-right: 12px;
}
.detail-desc {
  color: #888;
}
.detail-time {
  color: #aaa;
  font-size: 13px;
  margin-bottom: 12px;
}
.detail-content {
  color: #555;
  font-size: 15px;
  margin-bottom: 18px;
}
.detail-readme {
  border-top: 1px solid #eee;
  padding-top: 16px;
  color: #888;
  font-size: 14px;
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
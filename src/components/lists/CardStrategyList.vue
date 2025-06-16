<template>
  <div class="list-container">
    <div
      v-for="item in filteredStrategies"
      :key="item.id"
      :class="['script-item', { active: item.id === selectedId }]"
      @click="selectStrategy(item.id)"
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
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  searchKey: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['select']);

const strategies = ref([
  {
    id: 1,
    title: '七圣召唤入门指南',
    author: '卡牌大师',
    desc: '七圣召唤的基础规则和玩法介绍...',
    detail: '本指南将详细介绍七圣召唤的基础规则、卡牌类型、对战机制等入门知识...',
    tags: ['入门', '规则', '指南'],
    time: '2天前',
    unread: true,
  },
  {
    id: 2,
    title: '强力卡组推荐',
    author: '构筑专家',
    desc: '当前版本最强卡组构筑和打法详解...',
    detail: '本攻略将详细介绍当前版本最强卡组的构筑思路、核心卡牌、打法技巧等...',
    tags: ['卡组', '构筑', '推荐'],
    time: '5天前',
    unread: false,
  },
  {
    id: 3,
    title: '元素共鸣详解',
    author: '元素专家',
    desc: '元素共鸣机制和实战应用...',
    detail: '本攻略将深入解析元素共鸣机制，包括触发条件、效果叠加、实战应用等...',
    tags: ['元素共鸣', '机制'],
    time: '1周前',
    unread: false,
  },
  {
    id: 4,
    title: '卡牌收集指南',
    author: '收集专家',
    desc: '卡牌收集的优先级和获取方式...',
    detail: '本指南将详细介绍卡牌收集的优先级和获取方式，帮助玩家快速组建强力卡组...',
    tags: ['收集', '获取'],
    time: '2周前',
    unread: true,
  },
]);

const selectedId = ref(1);

const selectStrategy = (id) => {
  selectedId.value = id;
  const strategy = strategies.value.find(strategy => strategy.id === id);
  emit('select', strategy);
};

const filteredStrategies = computed(() => {
  if (!props.searchKey) return strategies.value;
  
  const searchLower = props.searchKey.toLowerCase();
  return strategies.value.filter(strategy => {
    return (
      strategy.title.toLowerCase().includes(searchLower) ||
      strategy.author.toLowerCase().includes(searchLower) ||
      strategy.desc.toLowerCase().includes(searchLower) ||
      strategy.detail.toLowerCase().includes(searchLower) ||
      strategy.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });
});
</script>

<style scoped>
.list-container {
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
}

.script-item {
  background: #fff;
  border-radius: 10px;
  margin: 10px 12px;
  padding: 16px 18px 12px 18px;
  box-shadow: 0 2px 8px 0 #f2f3f5;
  border: 1.5px solid #e5e7eb;
  cursor: pointer;
  transition: box-shadow 0.2s, border 0.2s;
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
  border-color: #1677ff;
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
</style> 
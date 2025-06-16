<template>
  <div class="map-detail">
    <template v-if="location">
      <div class="detail-header">
        <div class="detail-title">{{ location.title }}</div>
        <div class="detail-path">
          <a-breadcrumb>
            <a-breadcrumb-item v-for="(item, index) in location.path" :key="index">
              {{ item }}
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>
      </div>
      <div class="detail-content">
        <a-descriptions :data="detailData" layout="vertical" bordered />
      </div>
      <div class="detail-actions">
        <a-space>
          <a-button type="primary" @click="handleSubscribe">
            订阅此位置
          </a-button>
          <a-button @click="handleShare">
            分享位置
          </a-button>
        </a-space>
      </div>
    </template>
    <template v-else>
      <div class="detail-empty">
        <a-empty description="请选择左侧地图位置查看详情" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  location: {
    type: Object,
    default: null
  }
});

const detailData = computed(() => {
  if (!props.location) return [];
  
  return [
    {
      label: '位置名称',
      value: props.location.title
    },
    {
      label: '位置类型',
      value: '地图标记点'
    },
    {
      label: '所属区域',
      value: props.location.path[0]
    },
    {
      label: '详细位置',
      value: props.location.path.join(' > ')
    }
  ];
});

const handleSubscribe = () => {
  console.log('订阅位置:', props.location);
  // TODO: 实现订阅功能
};

const handleShare = () => {
  console.log('分享位置:', props.location);
  // TODO: 实现分享功能
};
</script>

<style scoped>
.map-detail {
  height: 100%;
  background: #fff;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.detail-header {
  margin-bottom: 24px;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin-bottom: 8px;
}

.detail-path {
  color: #888;
  font-size: 14px;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 24px;
}

.detail-actions {
  border-top: 1px solid #eee;
  padding-top: 24px;
}

.detail-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 
<template>
  <div ref="fireworks">
    <a-modal
        :getContainer="() => $refs.fireworks"
        v-model:open="mainStore.showFireworksModal"
        title="春节快乐！"
        :footer="null"
        centered
        width="80%"
        :maskClosable="false"
        @cancel="mainStore.onFireworksClose"
    >
      <div class="fireworks-content">
        <svg
            ref="svgRef"
            class="fireworks-svg"
            viewBox="0 0 1000 550"
            preserveAspectRatio="xMidYMid slice"
        >
          <!-- 星空层 -->
          <g ref="starsLayerRef"></g>
          <!-- 烟花层 -->
          <g ref="fireworksLayerRef"></g>
        </svg>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { onUnmounted, ref, watch, nextTick } from 'vue';
import gsap from 'gsap';
import {useMainStore} from "@/stores/mainStore.js";

let inited = false

const mainStore = useMainStore();

// 全局配置
const CONFIG = {
  maxConcurrentFireworks: 15, // 同时存在的烟花数量
  launchIntervalRange: [0, 200], // 发射间隔 ms
  explodeHeightRange: [80, 250], // 爆炸高度范围

  baseParticleCount: 80, // 基础粒子数
  particleVariance: 30, // 粒子浮动

  secondaryParticleRange: [6, 10], // 二次爆炸粒子数量
  secondaryTriggerChance: 0.003, // 二次爆炸触发概率

  primarySpread: [120, 200], // 一次爆炸扩散范围
  secondarySpread: [50, 90], // 二次爆炸扩散范围

  fireworkTypes: [
    'radial',        // 放射形
    'ring',          // 环形
    'heart',         // 心形
    'burstLine',     // 线形爆发
    'spiral',        // 螺旋形
    'star',          // 星形
    'doubleRing',    // 双环
    'chrysanthemum', // 菊花形
    'willow',        // 柳树形
    'palm'           // 棕榈形
  ],
  particleTypes: [
    'dot',
    'spark',
    'glow',
    'star',
    'trail'
  ],
  // 更艳丽的颜色 - 高饱和度、高亮度
  colors: [
    '#FF0040',    // 亮红
    '#FF3D00',    // 橙红
    '#FF8C00',    // 深橙
    '#FFD700',    // 金色
    '#FFFF00',    // 纯黄
    '#7FFF00',    // 查特酒绿
    '#00FF7F',    // 春绿
    '#00FFFF',    // 青色
    '#00BFFF',    // 深天蓝
    '#0080FF',    // 亮蓝
    '#4169E1',    // 皇家蓝
    '#8A2BE2',    // 蓝紫
    '#9400D3',    // 深紫罗兰
    '#FF00FF',    // 洋红
    '#FF1493',    // 深粉
    '#FF69B4',    // 亮粉
    '#FFFFFF'     // 白色（银色烟花）
  ]
}

// 星空配置
const STAR_CONFIG = {
  count: 160, // 星星数量
  minRadius: 0.6, // 最小半径
  maxRadius: 1.8, // 最大半径
  minOpacity: 0.3, // 最小透明度
  maxOpacity: 0.9, // 最大透明度
  twinkleDuration: [2, 6], // 闪烁周期范围（秒）
  driftRange: 20 // 漂移范围
}

const svgRef = ref(null);
const starsLayerRef = ref(null);
const fireworksLayerRef = ref(null);

let launchTimer = null;
let destroyed = false;
let activeFireworks = 0;
let fireworkCount = 0;

function scheduleNextLaunch() {
  if (destroyed) return;

  const delay = rand(...CONFIG.launchIntervalRange);

  launchTimer = setTimeout(() => {
    const canLaunch = CONFIG.maxConcurrentFireworks - activeFireworks;
    if (canLaunch > 0) {
      const batch = Math.min(
          canLaunch,
          Math.floor(rand(1, 3))
      );

      for (let i = 0; i < batch; i++) {
        launchFirework();
      }
    }

    scheduleNextLaunch();
  }, delay);
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function createSVG(tag) {
  return document.createElementNS(SVG_NS, tag);
}

// 星空
function createStar() {
  const star = createSVG('circle');

  star.setAttribute('cx', rand(0, 1000));
  star.setAttribute('cy', rand(0, 600));
  star.setAttribute('r', rand(STAR_CONFIG.minRadius, STAR_CONFIG.maxRadius));
  star.setAttribute('fill', '#fff');
  star.setAttribute(
      'opacity',
      rand(STAR_CONFIG.minOpacity, STAR_CONFIG.maxOpacity)
  );

  starsLayerRef.value.appendChild(star);

  // 闪烁
  gsap.to(star, {
    opacity: rand(0.2, 1),
    duration: rand(...STAR_CONFIG.twinkleDuration),
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });

  // 漂移
  gsap.to(star, {
    x: rand(-STAR_CONFIG.driftRange, STAR_CONFIG.driftRange),
    y: rand(-STAR_CONFIG.driftRange, STAR_CONFIG.driftRange),
    duration: rand(20, 40),
    repeat: -1,
    yoyo: true,
    ease: 'none'
  });
}

function initStars() {
  for (let i = 0; i < STAR_CONFIG.count; i++) {
    createStar();
  }
}

// 粒子
function createParticle(type, x, y, color) {
  let el;

  switch (type) {
    case 'spark': {
      el = createSVG('line');
      el.setAttribute('x1', x);
      el.setAttribute('y1', y);
      el.setAttribute('x2', x + rand(-8, 8));
      el.setAttribute('y2', y + rand(-8, 8));
      el.setAttribute('stroke', color);
      el.setAttribute('stroke-width', rand(2, 3));
      el.setAttribute('stroke-linecap', 'round');
      break;
    }

    case 'glow': {
      el = createSVG('circle');
      el.setAttribute('cx', x);
      el.setAttribute('cy', y);
      el.setAttribute('r', rand(4, 7));
      el.setAttribute('fill', color);
      el.setAttribute('opacity', rand(0.7, 0.9));
      break;
    }

    case 'star': {
      el = createSVG('polygon');
      const size = rand(3, 6);
      const points = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? size : size / 2;
        points.push(`${x + Math.cos(angle) * r},${y + Math.sin(angle) * r}`);
      }
      el.setAttribute('points', points.join(' '));
      el.setAttribute('fill', color);
      break;
    }

    case 'trail': {
      el = createSVG('line');
      el.setAttribute('x1', x);
      el.setAttribute('y1', y);
      el.setAttribute('x2', x);
      el.setAttribute('y2', y);
      el.setAttribute('stroke', color);
      el.setAttribute('stroke-width', rand(2, 4));
      el.setAttribute('stroke-linecap', 'round');
      el.setAttribute('opacity', rand(0.6, 0.8));
      break;
    }

    default: {
      el = createSVG('circle');
      el.setAttribute('cx', x);
      el.setAttribute('cy', y);
      el.setAttribute('r', rand(1.5, 3.5));
      el.setAttribute('fill', color);
    }
  }

  fireworksLayerRef.value.appendChild(el);
  return el;
}

// 烟花形态
const FireworkPatterns = {
  radial(i, count) {
    const a = (Math.PI * 2 * i) / count;
    const r = rand(0.8, 1.2);
    return {x: Math.cos(a) * r, y: Math.sin(a) * r};
  },

  ring(i, count) {
    const a = (Math.PI * 2 * i) / count;
    const r = rand(0.95, 1.05);
    return {x: Math.cos(a) * r, y: Math.sin(a) * r};
  },

  heart(i, count) {
    const t = (Math.PI * 2 * i) / count;
    return {
      x: (16 * Math.pow(Math.sin(t), 3)) / 18,
      y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t)) / 18
    };
  },

  burstLine() {
    const a = rand(0, Math.PI * 2);
    return {x: Math.cos(a), y: Math.sin(a)};
  },

  spiral(i, count) {
    const a = (Math.PI * 6 * i) / count; // 3圈螺旋
    const r = (i / count) * rand(0.8, 1.2);
    return {x: Math.cos(a) * r, y: Math.sin(a) * r};
  },

  star(i, count) {
    const a = (Math.PI * 2 * i) / count;
    const r = (i % 2 === 0) ? 1 : 0.5; // 星形效果
    return {x: Math.cos(a) * r, y: Math.sin(a) * r};
  },

  doubleRing(i, count) {
    const ring = i % 2; // 交替内外环
    const a = (Math.PI * 2 * Math.floor(i / 2)) / (count / 2);
    const r = ring === 0 ? rand(0.6, 0.7) : rand(1.3, 1.4);
    return {x: Math.cos(a) * r, y: Math.sin(a) * r};
  },

  chrysanthemum(i, count) {
    const a = (Math.PI * 12 * i) / count; // 多花瓣
    const r = rand(0.7, 1.3);
    return {x: Math.cos(a) * r, y: Math.sin(a) * r};
  },

  willow(i, count) {
    const a = (Math.PI * 2 * i) / count;
    const r = rand(0.5, 1.5);
    return {x: Math.cos(a) * r, y: Math.sin(a) * r * 1.5}; // 拉长的柳树形
  },

  palm(i, count) {
    const a = (Math.PI * 2 * i) / count;
    const r = rand(0.8, 1.2) * (1 + Math.sin(a * 5) * 0.3); // 棕榈叶波浪
    return {x: Math.cos(a) * r, y: Math.sin(a) * r};
  }
}

// 烟花爆炸
function explode(x, y, isSecondary = false) {
  const count = isSecondary
      ? Math.floor(rand(...CONFIG.secondaryParticleRange))
      : CONFIG.baseParticleCount +
      Math.floor(rand(-CONFIG.particleVariance, CONFIG.particleVariance));

  const pattern = pick(CONFIG.fireworkTypes);
  const particleType = pick(CONFIG.particleTypes);

  let secondaryTriggered = false;

  for (let i = 0; i < count; i++) {
    const color = pick(CONFIG.colors);
    const p = createParticle(particleType, x, y, color);
    const vec = FireworkPatterns[pattern](i, count);

    const duration = isSecondary ? rand(0.6, 0.9) : rand(1.2, 1.6);
    const spread = isSecondary ? CONFIG.secondarySpread : CONFIG.primarySpread;

    gsap.to(p, {
      duration,
      x: vec.x * rand(...spread),
      y: vec.y * rand(...spread),
      opacity: 0,
      ease: isSecondary ? 'power1.out' : 'power2.out',

      onUpdate() {
        if (
            !isSecondary &&
            !secondaryTriggered &&
            Math.random() < CONFIG.secondaryTriggerChance
        ) {
          secondaryTriggered = true;
          explode(x + vec.x * 40, y + vec.y * 40, true);
        }
      },
      onComplete: () => p.remove()
    });
  }
}

// 发射
function launchFirework() {
  if (!svgRef.value) return;
  if (activeFireworks >= CONFIG.maxConcurrentFireworks) return;

  function getRealY(el) {
    const gsapData = gsap.getProperty(el, 'y');
    const baseY = parseFloat(el.getAttribute('cy'));
    return baseY + gsapData;
  }

  activeFireworks++;

  const x = rand(100, 900);
  const startY = 620;
  let lastY = startY;
  const explodeY = rand(...CONFIG.explodeHeightRange);

  let rocket;

  // 第一发烟花使用 favicon 图标
  if (fireworkCount < 26) {
    fireworkCount++;

    rocket = createSVG('image');
    rocket.setAttribute('href', '/favicon.ico');
    rocket.setAttribute('x', x - 16);
    rocket.setAttribute('y', startY);
    rocket.setAttribute('width', 32);
    rocket.setAttribute('height', 32);
  } else {
    rocket = createSVG('circle');
    rocket.setAttribute('cx', x);
    rocket.setAttribute('cy', startY);
    rocket.setAttribute('r', 2);
    rocket.setAttribute('fill', pick(CONFIG.colors));
  }

  fireworksLayerRef.value.appendChild(rocket);

  let exploded = false;

  gsap.to(rocket, {
    duration: 1.4,
    y: -startY,
    ease: 'power2.out',

    onUpdate() {
      const cy = getRealY(rocket);

      if (!exploded && lastY > explodeY && cy <= explodeY) {
        exploded = true;
        rocket.remove();
        explode(x, cy);
        activeFireworks--;
      }

      lastY = cy;
    },

    onComplete() {
      if (!exploded) {
        rocket.remove();
        activeFireworks--;
      }
    }
  });
}

watch(
    () => mainStore.showFireworksModal,
    async (open) => {
      if (!open) return;
      if (inited) return;

      await nextTick();

      if (!starsLayerRef.value || !fireworksLayerRef.value) return;

      initStars();
      scheduleNextLaunch();

      inited = true;
    }
);

onUnmounted(() => {
  destroyed = true;
  if (launchTimer) clearTimeout(launchTimer);
});
</script>

<style scoped>
:deep(.ant-modal-content) {
  height: 80vh;
  padding: 20px 0 0 0;
  background: radial-gradient(circle at bottom, #0a0a14, #000);
  border-radius: 12px;
}

:deep(.ant-modal-close) {
  color: #ffffff;
}

:deep(.ant-modal-header) {
  padding-left: 20px;
  background-color: transparent;
}

:deep(.ant-modal-body) {
  height: 100%;
  overflow: hidden;
  padding: 0;
}

.fireworks-content {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at bottom, #0a0a14, #000);
  overflow: hidden;
}

.fireworks-svg {
  width: 100%;
  height: 100%;
}

circle,
line,
polygon {
  filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 16px currentColor);
}
</style>
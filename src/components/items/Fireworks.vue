<template>
  <div class="fireworks-content">
    <svg
        ref="svgRef"
        class="fireworks-svg"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
    >
      <!-- 星空层 -->
      <g ref="starsLayerRef"></g>
      <!-- 烟花层 -->
      <g ref="fireworksLayerRef"></g>
    </svg>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import gsap from 'gsap';

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
    'radial',
    'ring',
    'heart',
    'burstLine'
  ],
  particleTypes: [
    'dot',
    'spark',
    'glow'
  ],
  colors: [
    '#ff5f5f',
    '#ffd93d',
    '#5fdfff',
    '#c77dff',
    '#7CFFCB'
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
      el.setAttribute('x2', x + rand(-6, 6));
      el.setAttribute('y2', y + rand(-6, 6));
      el.setAttribute('stroke', color);
      el.setAttribute('stroke-width', '2');
      break;
    }

    case 'glow': {
      el = createSVG('circle');
      el.setAttribute('cx', x);
      el.setAttribute('cy', y);
      el.setAttribute('r', rand(3, 5));
      el.setAttribute('fill', color);
      el.setAttribute('opacity', '0.8');
      break;
    }

    default: {
      el = createSVG('circle');
      el.setAttribute('cx', x);
      el.setAttribute('cy', y);
      el.setAttribute('r', rand(1, 2.5));
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
    return {x: Math.cos(a), y: Math.sin(a)};
  },

  ring(i, count) {
    const a = (Math.PI * 2 * i) / count;
    return {x: Math.cos(a), y: Math.sin(a)};
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

  const rocket = createSVG('circle');
  rocket.setAttribute('cx', x);
  rocket.setAttribute('cy', startY);
  rocket.setAttribute('r', 2);
  rocket.setAttribute('fill', pick(CONFIG.colors));

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

onMounted(() => {
  initStars();
  scheduleNextLaunch();
});

onUnmounted(() => {
  destroyed = true;
  if (launchTimer) clearTimeout(launchTimer);
});
</script>

<style scoped>
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
line {
  filter: drop-shadow(0 0 6px currentColor);
}
</style>
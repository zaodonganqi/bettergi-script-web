<template>
  <!-- 粒子背景容器，用于承载 Three.js 渲染器 -->
  <div ref="container" class="particle-bg"></div>
</template>

<script setup>
import {onMounted, onBeforeUnmount, ref} from 'vue';
import * as THREE from 'three';

/* -------------------------------------------------------
 * ref 绑定模板中的容器元素，用来挂载 WebGL 渲染器
 * ----------------------------------------------------- */
const container = ref(null);

/* -------------------------------------------------------
 * Three.js 核心对象
 * scene     - 场景
 * camera    - 相机
 * renderer  - 渲染器
 * points    - 粒子系统对象
 * ----------------------------------------------------- */
let scene;
let camera;
let renderer;
let points;

/* -------------------------------------------------------
 * 粒子相关数据：
 * - particlesData 保存每个粒子的初始位置与随机相位
 * ----------------------------------------------------- */
let particlesData = [];

/* -------------------------------------------------------
 * 交互计算相关：
 * - mouse 用于存储鼠标在 NDC 坐标（-1~1）
 * - raycaster 将鼠标转换成 3D 空间射线
 * - plane 为 Z=0 的平面，用于计算鼠标在 3D 中的投影点
 * ----------------------------------------------------- */
let mouse = new THREE.Vector2(-1000, -1000); // 初始设置很远避免加载时触发散开
let raycaster = new THREE.Raycaster();
let plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

// 动画帧 ID，用于销毁动画
let animationId;

/* -------------------------------------------------------
 * 粒子参数配置（可调节）
 * ----------------------------------------------------- */
const PARTICLE_COUNT = 8000;      // 粒子数量
const INTERACTION_RADIUS = 1.0;   // 鼠标影响半径
const RETURN_SPEED = 0.08;        // 粒子回到原位速度
const EXPLOSION_FORCE = 1.2;      // 鼓励散开的力度
const WORLD_SIZE = 8.0;      // 空间系大小

/* -------------------------------------------------------
 * 生命周期：组件加载时初始化场景与事件监听
 * ----------------------------------------------------- */
onMounted(() => {
  initScene();
  animate();

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onResize);
});

/* -------------------------------------------------------
 * 生命周期：组件卸载时清理事件和释放 ThreeJS 资源
 * ----------------------------------------------------- */
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('resize', onResize);

  cancelAnimationFrame(animationId);

  if (renderer) {
    renderer.dispose();
  }

  if (scene) {
    scene.clear();
  }
});

/* -------------------------------------------------------
 * 创建一个发光圆形粒子的纹理（用 Canvas 绘制）
 * 比默认的矩形纹理好看很多
 * ----------------------------------------------------- */
function getTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;

  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/* -------------------------------------------------------
 * 初始化 Three.js 场景、相机、渲染器与粒子系统
 * ----------------------------------------------------- */
function initScene() {
  // 创建场景
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.05);

  const width = container.value.clientWidth;
  const height = container.value.clientHeight;

  // 创建透视相机
  camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 100);
  camera.position.z = 3;

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.value.appendChild(renderer.domElement);

  // 创建粒子数据缓冲
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);

  const colorPalette = [
    new THREE.Color('#00ffff'),
    new THREE.Color('#fa5efa'),
    new THREE.Color('#ffffff'),
    new THREE.Color('#4488ff'),
    new THREE.Color('#8df66f'),
    new THREE.Color('#f6eb6f'),
    new THREE.Color('#fa4b4b'),
  ];

  // 初始化粒子数据
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = (Math.random() - 0.5) * WORLD_SIZE;
    const y = (Math.random() - 0.5) * WORLD_SIZE;
    const z = (Math.random() - 0.5) * WORLD_SIZE;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    particlesData.push({
      originalX: x,
      originalY: y,
      originalZ: z,
      randomOffset: Math.random() * Math.PI * 2,
    });

    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = Math.random() * 1.5;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    map: getTexture(),
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    transparent: true,
    sizeAttenuation: true,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
}

/* -------------------------------------------------------
 * 鼠标移动事件，将鼠标位置转为标准设备坐标（NDC）
 * ----------------------------------------------------- */
function onMouseMove(e) {
  if (!container.value) return;

  const rect = container.value.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  mouse.x = (x / rect.width) * 2 - 1;
  mouse.y = -(y / rect.height) * 2 + 1;
}

/* -------------------------------------------------------
 * 动画循环：粒子漂浮 + 鼠标爆散 + 回位
 * ----------------------------------------------------- */
function animate() {
  animationId = requestAnimationFrame(animate);

  const time = Date.now() * 0.001;

  points.rotation.y += 0.0001;
  points.rotation.x += 0.0005;

  raycaster.setFromCamera(mouse, camera);

  const intersection = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, intersection);

  const localMouse = intersection
      .clone()
      .applyMatrix4(points.matrixWorld.clone().invert());

  const positions = points.geometry.attributes.position.array;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const data = particlesData[i];

    const px = positions[i3];
    const py = positions[i3 + 1];
    const pz = positions[i3 + 2];

    const dx = px - localMouse.x;
    const dy = py - localMouse.y;
    const dz = pz - localMouse.z;

    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const driftX = Math.sin(time * 0.5 + data.randomOffset) * 0.1;
    const driftY = Math.cos(time * 0.3 + data.randomOffset) * 0.1;
    const driftZ = Math.sin(time * 0.4 + data.randomOffset) * 0.1;

    let targetX = data.originalX + driftX;
    let targetY = data.originalY + driftY;
    let targetZ = data.originalZ + driftZ;

    if (dist < INTERACTION_RADIUS) {
      const force = (INTERACTION_RADIUS - dist) / INTERACTION_RADIUS;
      const repulsion = force * EXPLOSION_FORCE;

      targetX += (dx / dist) * repulsion;
      targetY += (dy / dist) * repulsion;
      targetZ += (dz / dist) * repulsion;
    }

    positions[i3] += (targetX - px) * RETURN_SPEED;
    positions[i3 + 1] += (targetY - py) * RETURN_SPEED;
    positions[i3 + 2] += (targetZ - pz) * RETURN_SPEED;
  }

  points.geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}

/* -------------------------------------------------------
 * 自适应窗口大小，保持渲染器与相机比例正确
 * ----------------------------------------------------- */
function onResize() {
  if (!container.value) return;

  const width = container.value.clientWidth;
  const height = container.value.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}
</script>

<style scoped>
.particle-bg {
  width: 100%;
  height: 80vh;
  overflow: hidden;

  /* 深色渐变背景，让粒子更显亮 */
  background: radial-gradient(circle at center, #1a1a2e 0%, #000000 100%);
  z-index: -1;
}
</style>
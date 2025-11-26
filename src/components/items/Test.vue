<template>
  <div class="matrix-container">
    <canvas ref="canvas" class="matrix-canvas"></canvas>
    <pre class="matrix-text">
      <span v-for="(row, y) in binaryArray" :key="y">
        <span v-for="(cell, x) in row" :key="x">{{ cell === 1 ? '█' : ' ' }}</span>
      </span>
    </pre>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  src: { type: String, required: true }, // 图片路径
  threshold: { type: Number, default: 128 }, // 二值化阈值
  step: { type: Number, default: 5 } // 采样间隔
})

const canvas = ref(null)
const binaryArray = ref([])

function imageToBinaryArray(img, threshold = 128, step = 1) {
  const canvasEl = document.createElement('canvas')
  const ctx = canvasEl.getContext('2d')
  canvasEl.width = img.width
  canvasEl.height = img.height
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, img.width, img.height)
  const data = imageData.data
  const result = []

  for (let y = 0; y < img.height; y += step) {
    const row = []
    for (let x = 0; x < img.width; x += step) {
      const idx = (y * img.width + x) * 4
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
      row.push(gray >= threshold ? 1 : 0)
    }
    result.push(row)
  }
  return result
}

onMounted(() => {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = props.src
  img.onload = () => {
    binaryArray.value = imageToBinaryArray(img, props.threshold, props.step)
  }
})
</script>

<style scoped>
.matrix-container {
  width: 100%;
  background-color: black;
  color: #00ff00;
  font-family: monospace;
  white-space: pre;
  overflow-x: auto;
}

.matrix-text {
  margin: 0;
  padding: 0.5em;
  line-height: 1em;
}

.matrix-text span {
  display: block;
}
</style>
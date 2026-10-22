<script setup>
import { computed } from 'vue'

// 固定种子的伪随机数生成器（每次加载星图一致）
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 生成的均为本组件自绘 SVG（无外部输入），v-html 安全
const svg = computed(() => {
  const rnd = mulberry32(20261021)
  const W = 1600, H = 900
  let dots = '', lines = ''
  for (let i = 0; i < 110; i++) {
    const x = (rnd() * W).toFixed(1), y = (rnd() * H).toFixed(1)
    const r = (0.4 + rnd() * 1.1).toFixed(2)
    const o = (0.1 + rnd() * 0.45).toFixed(2)
    dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="${rnd() > 0.78 ? '#d8b878' : '#e8e6df'}" opacity="${o}"/>`
  }
  for (let k = 0; k < 4; k++) {
    const bx = rnd() * W, by = rnd() * H, pts = []
    const n = 3 + Math.floor(rnd() * 3)
    for (let j = 0; j < n; j++) pts.push((bx + rnd() * 170 - 85).toFixed(1) + ',' + (by + rnd() * 130 - 65).toFixed(1))
    lines += `<polyline points="${pts.join(' ')}" fill="none" stroke="#d8b878" stroke-width="0.5" opacity="0.12"/>`
  }
  return `<svg width="100%" height="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${lines}${dots}</svg>`
})
</script>

<template>
  <div id="stars" aria-hidden="true" v-html="svg"></div>
</template>

<style scoped>
#stars{position:fixed;inset:0;pointer-events:none;z-index:0}
</style>

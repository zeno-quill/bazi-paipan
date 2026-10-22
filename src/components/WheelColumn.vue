<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

/**
 * 单列滚轮选择器（iOS 风格）
 * - 原生滚动 + scroll-snap 吸附，触屏/鼠标滚轮/触控板均可用
 * - 点击某行直接选中
 */
const props = defineProps({
  items: { type: Array, required: true },  // [{ label, value }]
  modelValue: { required: true }
})
const emit = defineEmits(['update:modelValue'])

const ITEM_H = 36
const listRef = ref(null)
let scrollTimer = null
let syncTimer = null
let syncing = false // 程序化滚动期间不回传，避免循环

function idxOf(value) {
  const i = props.items.findIndex((it) => it.value === value)
  return i < 0 ? 0 : i
}

function scrollToIdx(i, smooth) {
  const el = listRef.value
  if (!el) return
  syncing = true
  el.scrollTo({ top: i * ITEM_H, behavior: smooth ? 'smooth' : 'auto' })
  // 程序化滚动期间不回传，结束后解除标记（留足 smooth 滚动时间）
  clearTimeout(syncTimer)
  syncTimer = setTimeout(() => { syncing = false }, 320)
}

function onScroll() {
  if (syncing) return
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    const el = listRef.value
    if (!el) return
    const i = Math.max(0, Math.min(props.items.length - 1, Math.round(el.scrollTop / ITEM_H)))
    // scroll-snap 已吸附，这里仅同步值
    const v = props.items[i].value
    if (v !== props.modelValue) emit('update:modelValue', v)
  }, 80)
}

function pick(it) {
  if (it.value !== props.modelValue) emit('update:modelValue', it.value)
}

// 确认前强制同步当前滚动位置（防抖未触发时也取到用户所见值）
// syncing 期间（程序化滚动）不回传：此时 modelValue 本身即是目标值
function flush() {
  const el = listRef.value
  if (!el || syncing) return
  clearTimeout(scrollTimer)
  const i = Math.max(0, Math.min(props.items.length - 1, Math.round(el.scrollTop / ITEM_H)))
  const v = props.items[i].value
  if (v !== props.modelValue) emit('update:modelValue', v)
}
defineExpose({ flush })

// 外部值变化（联动钳制等）→ 滚到对应位置；用户滚动导致的更新位置已在位，跳过
watch(() => props.modelValue, (v) => {
  nextTick(() => {
    const el = listRef.value
    if (!el) return
    const i = idxOf(v)
    if (Math.round(el.scrollTop / ITEM_H) !== i) scrollToIdx(i, true)
  })
})

// 列表变化（如月份切换导致天数变化）→ 钳制并重新定位
watch(() => props.items, () => {
  nextTick(() => {
    const i = idxOf(props.modelValue)
    const v = props.items[i].value
    if (v !== props.modelValue) emit('update:modelValue', v)
    scrollToIdx(i, false)
  })
})

onMounted(() => {
  // 初始定位：直接跳转，不动画
  const el = listRef.value
  if (el) el.scrollTop = idxOf(props.modelValue) * ITEM_H
})

onBeforeUnmount(() => { clearTimeout(scrollTimer); clearTimeout(syncTimer) })
</script>

<template>
  <div class="wheel-col">
    <div ref="listRef" class="wheel-list" @scroll.passive="onScroll">
      <div class="wheel-pad" aria-hidden="true"></div>
      <div
        v-for="it in items"
        :key="String(it.value)"
        class="wheel-item"
        :class="{ 'is-cur': it.value === modelValue, 'is-accent': it.accent }"
        @click="pick(it)"
      >{{ it.label }}</div>
      <div class="wheel-pad" aria-hidden="true"></div>
    </div>
  </div>
</template>

<style scoped>
.wheel-col{position:relative;flex:1;min-width:0;height:180px;overflow:hidden}
.wheel-list{
  height:100%;overflow-y:auto;scroll-snap-type:y mandatory;
  scrollbar-width:none;-webkit-overflow-scrolling:touch;
  mask-image:linear-gradient(180deg,transparent,#000 28%,#000 72%,transparent);
  -webkit-mask-image:linear-gradient(180deg,transparent,#000 28%,#000 72%,transparent);
}
.wheel-list::-webkit-scrollbar{display:none}
.wheel-pad{height:72px}
.wheel-item{
  height:36px;display:flex;align-items:center;justify-content:center;
  scroll-snap-align:center;cursor:pointer;user-select:none;-webkit-user-select:none;
  font-size:15px;color:var(--muted);letter-spacing:.08em;transition:color .15s;
  white-space:nowrap;
}
.wheel-item.is-cur{color:var(--gold-strong);font-size:16px;font-weight:600}
.wheel-item.is-accent{color:var(--gold)}
</style>

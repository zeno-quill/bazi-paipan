<script setup>
import { useTheme } from '../composables/useTheme'

const { mode, setMode } = useTheme()

const OPTIONS = [
  { value: 'auto', label: '跟随系统' },
  { value: 'light', label: '亮色' },
  { value: 'dark', label: '暗色' }
]
</script>

<template>
  <div class="theme-switch" role="radiogroup" aria-label="主题模式">
    <button
      v-for="o in OPTIONS"
      :key="o.value"
      type="button"
      class="ts-item"
      :class="{ 'is-on': mode === o.value }"
      role="radio"
      :aria-checked="mode === o.value"
      :aria-label="o.label"
      :title="o.label"
      @click="setMode(o.value)"
    >
      <!-- 跟随系统：半明半暗圆 -->
      <svg v-if="o.value === 'auto'" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.6"/>
        <path d="M12 3.4a8.6 8.6 0 0 1 0 17.2z" fill="currentColor"/>
      </svg>
      <!-- 亮色：太阳 -->
      <svg v-else-if="o.value === 'light'" width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4.1"/>
        <path d="M12 2.2v2.3M12 19.5v2.3M2.2 12h2.3M19.5 12h2.3M5 5l1.6 1.6M17.4 17.4L19 19M19 5l-1.6 1.6M6.6 17.4L5 19"/>
      </svg>
      <!-- 暗色：月牙 -->
      <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">
        <path d="M20.4 14.3A8.6 8.6 0 0 1 9.7 3.6 8.6 8.6 0 1 0 20.4 14.3z"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.theme-switch{
  position:absolute;top:14px;right:16px;z-index:2;
  display:flex;gap:2px;padding:3px;
  border:1px solid var(--line);border-radius:20px;background:var(--surface-2);
  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);
}
.ts-item{
  width:31px;height:26px;display:grid;place-items:center;
  border:none;background:none;border-radius:16px;cursor:pointer;
  color:var(--faint);transition:background .2s,color .2s;
}
.ts-item:hover{color:var(--gold)}
.ts-item.is-on{background:var(--gold-soft);color:var(--gold-strong)}
@media (max-width:460px){
  .theme-switch{top:10px;right:10px;padding:2px}
  .ts-item{width:28px;height:24px}
}
</style>

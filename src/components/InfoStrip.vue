<script setup>
import { computed } from 'vue'

const props = defineProps({
  chart: { type: Object, required: true }
})

const items = computed(() => {
  const c = props.chart
  return [
    ['公历', c.solarStr],
    ['农历', c.lunarStr],
    ['时辰', c.shiChen],
    ['生肖', c.shengxiao + '（以立春为界）'],
    ['星座', c.xingzuo],
    ['上一节气', c.jieQiPrev.name + ' · ' + c.jieQiPrev.date],
    ['下一节气', c.jieQiNext.name + ' · ' + c.jieQiNext.date],
    ['命宫', c.mingGong],
    ['胎元', c.taiYuan],
    ['身宫', c.shenGong]
  ]
})
</script>

<template>
  <div class="info-strip">
    <div v-for="it in items" :key="it[0]" class="info-item">
      <span class="info-label">{{ it[0] }}</span>
      <span class="info-value">{{ it[1] }}</span>
    </div>
  </div>
</template>

<style scoped>
.info-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(158px,1fr));gap:12px}
.info-item{border:1px solid var(--line);border-radius:10px;padding:10px 13px;background:var(--surface-2)}
.info-label{display:block;font-size:10.5px;color:var(--faint);letter-spacing:.3em;margin-bottom:4px}
.info-value{font-size:13.5px;letter-spacing:.02em}

@media (max-width:820px){
  .info-strip{grid-template-columns:1fr 1fr}
}
@media (max-width:460px){
  .info-strip{grid-template-columns:1fr}
}
</style>

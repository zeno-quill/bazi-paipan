<script setup>
import { ref, computed, watch } from 'vue'
import { wxClsOfChar, ssTitle } from '../utils/display'

const props = defineProps({
  chart: { type: Object, required: true }
})

const nowYear = new Date().getFullYear()
const selected = ref(1)

// 默认选中当前所处大运；未到起运选第一步，已出末运选最后一步
function defaultSelection(c) {
  const list = c.yun.daYun
  let sel = 1
  list.forEach((d) => {
    if (d.index > 0 && nowYear >= d.startYear && nowYear <= d.endYear) sel = d.index
  })
  if (nowYear < list[1].startYear) sel = 1
  if (nowYear > list[list.length - 1].endYear) sel = list[list.length - 1].index
  return sel
}

// 重新排盘后重置选中项
watch(() => props.chart, (c) => { if (c) selected.value = defaultSelection(c) }, { immediate: true })

const current = computed(() => props.chart.yun.daYun[selected.value] || props.chart.yun.daYun[1])

function isNow(d) {
  return nowYear >= d.startYear && nowYear <= d.endYear
}
</script>

<template>
  <div class="dayun-info">
    <span class="yun-tag">{{ chart.genderLabel }}</span>
    <span class="yun-tag">{{ chart.forwardLabel }}</span>
    <span class="yun-start">
      出生后 <b>{{ chart.yun.startYears }}</b> 年 <b>{{ chart.yun.startMonths }}</b> 个月 <b>{{ chart.yun.startDays }}</b> 天起运 · <b>{{ chart.yun.startSolar }}</b> 交运{{ chart.unknownHour ? '（时辰未知,为约值）' : '' }} · 年岁为虚岁
    </span>
  </div>

  <div class="dayun-row" role="listbox" aria-label="大运列表，点击查看对应流年">
    <template v-for="d in chart.yun.daYun" :key="d.index">
      <!-- 起运前占位卡 -->
      <div v-if="d.index === 0" :key="'ghost'" class="dycard ghost" aria-hidden="true">
        <div class="dy-years">{{ d.startYear }}–{{ d.endYear }}</div>
        <div class="dy-gz dy-ghost">起运前</div>
        <div class="dy-age">{{ d.startAge }}–{{ d.endAge }}岁</div>
      </div>
      <button
        v-else
        type="button"
        class="dycard"
        :class="{ 'is-active': selected === d.index }"
        :aria-pressed="selected === d.index ? 'true' : 'false'"
        @click="selected = d.index"
      >
        <div class="dy-years">{{ d.startYear }}–{{ d.endYear }}</div>
        <div class="dy-gz">
          <span class="gz" :class="wxClsOfChar(d.ganZhi.charAt(0))">{{ d.ganZhi.charAt(0) }}</span>
          <span class="gz" :class="wxClsOfChar(d.ganZhi.charAt(1))">{{ d.ganZhi.charAt(1) }}</span>
        </div>
        <div class="dy-age">{{ d.startAge }}–{{ d.endAge }}岁</div>
        <span v-if="isNow(d)" class="now-badge">当前</span>
      </button>
    </template>
  </div>

  <div class="liunian-block">
    <div class="ln-title">
      <b>{{ current.ganZhi }}</b> 大运 · {{ current.startYear }}—{{ current.endYear }} 年 · 流年十神以日主为参照
    </div>
    <div class="ln-row">
      <div v-for="x in current.liuNian" :key="x.year" class="ln" :class="{ 'is-now': x.year === nowYear }">
        <span class="ln-gz">
          <span class="gz" :class="wxClsOfChar(x.ganZhi.charAt(0))">{{ x.ganZhi.charAt(0) }}</span>
          <span class="gz" :class="wxClsOfChar(x.ganZhi.charAt(1))">{{ x.ganZhi.charAt(1) }}</span>
        </span>
        <span class="ln-ss" :title="ssTitle(x.shiShen)">{{ x.shiShen }}</span>
        <span class="ln-year">{{ x.year }} · {{ x.age }}岁</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dayun-info{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-bottom:16px;font-size:12.5px;color:var(--muted)}
.yun-tag{border:1px solid var(--line-strong);border-radius:20px;padding:2px 12px;color:var(--gold);letter-spacing:.15em;font-size:11.5px}
.yun-start b{color:var(--ink);font-weight:500}
.dayun-row{
  display:flex;gap:10px;overflow-x:auto;padding:8px 2px 14px;
  scroll-snap-type:x proximity;scrollbar-width:thin;
}
.dayun-row::-webkit-scrollbar{height:8px}
.dayun-row::-webkit-scrollbar-thumb{background:var(--scroll-thumb);border-radius:4px}
.dycard{
  position:relative;flex:0 0 auto;width:88px;scroll-snap-align:start;text-align:center;
  background:var(--card-bg);
  border:1px solid var(--line);border-radius:12px;padding:12px 6px 12px;
  font:inherit;color:inherit;cursor:pointer;transition:transform .15s,border-color .15s,background .15s;
}
.dycard:hover{transform:translateY(-2px);border-color:var(--line-strong)}
.dycard.is-active{
  border-color:var(--active-line);
  background:var(--active-bg);
  box-shadow:0 10px 26px var(--active-shadow);
}
.dycard.ghost{opacity:.45;cursor:default}
.dy-years{font-size:10.5px;color:var(--faint)}
.dy-gz{display:flex;justify-content:center;gap:7px;margin:9px 0 7px;font-size:24px}
.dy-gz .gz{text-shadow:none}
.dy-ghost{color:var(--faint);font-size:15px;letter-spacing:.28em;text-indent:.28em;justify-content:center;display:flex;align-items:center;min-height:33px}
.dy-age{font-size:11px;color:var(--muted)}
.gz{display:inline-block}
.now-badge{position:absolute;top:-9px;right:8px;font-size:10px;background:var(--cinnabar);color:var(--on-cinnabar);border-radius:20px;padding:1px 9px;letter-spacing:.15em}
.liunian-block{margin-top:6px;border-top:1px dashed var(--line);padding-top:16px}
.ln-title{font-size:13px;color:var(--gold);letter-spacing:.12em;margin-bottom:12px}
.ln-title b{font-size:15px;letter-spacing:.2em}
.ln-row{display:flex;flex-wrap:wrap;gap:8px}
.ln{
  display:flex;flex-direction:column;align-items:center;gap:3px;
  border:1px solid var(--line);border-radius:10px;padding:8px 10px;min-width:76px;
  background:var(--surface-2);
}
.ln-gz{display:flex;gap:5px;font-size:17px}
.ln-gz .gz{text-shadow:none}
.ln-ss{font-size:10px;color:var(--muted);cursor:help}
.ln-year{font-size:10.5px;color:var(--faint)}
.ln.is-now{border-color:var(--active-line);background:var(--active-soft)}
.ln.is-now .ln-year{color:var(--active-ink)}
</style>

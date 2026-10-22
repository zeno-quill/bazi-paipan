<script setup>
import { computed } from 'vue'
import { WUXING_LIST } from '../core/bazi'
import { wxCls } from '../utils/display'

const props = defineProps({
  chart: { type: Object, required: true }
})

const max = computed(() => {
  let m = 0
  WUXING_LIST.forEach((w) => { if (props.chart.wuxing.total[w] > m) m = props.chart.wuxing.total[w] })
  return m || 1
})

const rows = computed(() => {
  const c = props.chart
  const dm = c.dayMaster
  return WUXING_LIST.map((w) => {
    const t = c.wuxing.total[w], mn = c.wuxing.main[w], hd = c.wuxing.hide[w]
    return {
      name: w,
      total: t, main: mn, hide: hd,
      pct: t > 0 ? Math.max((t / max.value) * 100, 4) : 2,
      mainPct: t > 0 ? (mn / t) * 100 : 0,
      isDm: dm.wx === w,
      isMiss: t === 0,
      isMax: t > 0 && t === max.value && max.value >= 3
    }
  })
})
</script>

<template>
  <div id="wuxing">
    <div class="dm-card">
      <span class="dm-label">日主</span>
      <span class="dm-char" :class="wxCls(chart.dayMaster.wx)">{{ chart.dayMaster.gan }}</span>
      <span class="dm-sub">
        {{ chart.dayMaster.yy }}{{ chart.dayMaster.wx }} · 生于{{ chart.pillars[1].zhi }}月（{{ chart.pillars[1].zhiWx }}）
      </span>
      <span v-if="chart.unknownHour" class="dm-note">时辰未知,命盘以年、月、日三柱计</span>
    </div>

    <div class="wx-bars">
      <div v-for="r in rows" :key="r.name" class="wxrow" :class="{ 'is-dm': r.isDm }">
        <div class="wx-name"><i class="dot" :class="wxCls(r.name)"></i>{{ r.name }}</div>
        <div class="wx-track">
          <div class="wx-bar" :style="{ width: r.pct.toFixed(1) + '%' }">
            <div class="wx-main" :class="wxCls(r.name)" :style="{ width: r.mainPct.toFixed(1) + '%' }"></div>
            <div class="wx-hide" :class="wxCls(r.name)" :style="{ width: (100 - r.mainPct).toFixed(1) + '%' }"></div>
          </div>
        </div>
        <div class="wx-num">
          <b>{{ r.main }}</b>
          <i v-if="r.hide"> +{{ r.hide }} 藏</i>
          <span v-if="r.isDm" class="wx-badge badge-dm">日主</span>
          <span v-if="r.isMiss" class="wx-badge badge-miss">缺</span>
          <span v-else-if="r.isMax" class="wx-badge badge-max">旺</span>
        </div>
      </div>
      <p class="wx-legend">数值为「天干 + 地支本气」计数,「+ n 藏」为地支藏干计数;条形中浅色段为藏干占比。</p>
    </div>
  </div>
</template>

<style scoped>
#wuxing{display:grid;grid-template-columns:225px 1fr;gap:24px;align-items:center}
.dm-card{
  border:1px solid var(--line);border-radius:14px;padding:20px 14px;text-align:center;
  background:var(--dm-card-bg);
}
.dm-label{font-size:11px;color:var(--gold);letter-spacing:.5em;text-indent:.5em}
.dm-char{display:block;font-size:66px;margin:10px 0 8px}
.dm-sub{font-size:12.5px;color:var(--muted);letter-spacing:.05em}
.dm-note{display:block;margin-top:10px;font-size:11px;color:var(--faint)}
.wxrow{display:grid;grid-template-columns:56px 1fr 112px;align-items:center;gap:12px;padding:7px 0}
.wxrow+.wxrow{border-top:1px dashed var(--line-faint)}
.wxrow.is-dm .wx-name{color:var(--gold-strong)}
.wx-name{font-size:14.5px;letter-spacing:.3em;text-indent:.1em;display:flex;align-items:center}
.dot{width:9px;height:9px;border-radius:50%;display:inline-block;margin-right:9px;background:currentColor;text-shadow:none;flex:0 0 auto}
.wx-track{height:12px;border-radius:7px;background:var(--track-bg);border:1px solid var(--track-line);overflow:hidden}
.wx-bar{display:flex;height:100%;border-radius:6px;overflow:hidden;transition:width .6s cubic-bezier(.2,.7,.3,1)}
.wx-main{height:100%;opacity:.92}
.wx-hide{height:100%;opacity:.26}
.wx-jin.wx-main,.wx-jin.wx-hide{background:var(--wx-jin)}
.wx-mu.wx-main,.wx-mu.wx-hide{background:var(--wx-mu)}
.wx-shui.wx-main,.wx-shui.wx-hide{background:var(--wx-shui)}
.wx-huo.wx-main,.wx-huo.wx-hide{background:var(--wx-huo)}
.wx-tu.wx-main,.wx-tu.wx-hide{background:var(--wx-tu)}
.wx-num{font-size:13px;color:var(--muted);text-align:right;white-space:nowrap}
.wx-num b{color:var(--ink);font-size:15px}
.wx-num i{font-style:normal;font-size:11px;color:var(--faint)}
.wx-badge{font-size:9.5px;border:1px solid var(--line-strong);color:var(--gold);border-radius:20px;padding:0 6px;margin-left:6px;letter-spacing:.1em;vertical-align:1.5px}
.badge-dm{border-color:var(--active-line);color:var(--active-ink)}
.badge-miss{color:var(--miss-ink)}
.badge-max{color:var(--gold-strong)}
.wx-legend{margin-top:12px;font-size:11px;color:var(--faint);letter-spacing:.03em}

@media (max-width:820px){
  #wuxing{grid-template-columns:1fr}
  .dm-card{max-width:320px;margin:0 auto 8px}
}
@media (max-width:460px){
  .wxrow{grid-template-columns:44px 1fr 96px}
}
</style>

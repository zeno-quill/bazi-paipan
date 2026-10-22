<script setup>
import { wxCls, ssTitle } from '../utils/display'

defineProps({
  chart: { type: Object, required: true }
})
</script>

<template>
  <div class="pillars">
    <div
      v-for="(p, idx) in chart.pillars"
      :key="p.key"
      class="pillar"
      :class="{ 'is-day': p.key === 'day' }"
      :style="{ animationDelay: (idx * 0.07).toFixed(2) + 's' }"
    >
      <div class="pillar-top">
        <span class="pillar-name">{{ p.label }}</span>
        <span v-if="p.key === 'day'" class="pillar-tag tag-day">日主</span>
      </div>

      <!-- 时辰未知：时柱降级展示 -->
      <div v-if="p.unknown" class="pillar-ganzhi">
        <div class="pillar-unknown" style="grid-column:1 / -1"><span>时辰</span><span>未知</span></div>
      </div>
      <div v-else class="pillar-ganzhi">
        <div class="cell">
          <span class="cell-ss" :title="ssTitle(p.shiShenGan)">{{ p.shiShenGan }}</span>
          <span class="cell-char" :class="wxCls(p.ganWx)">{{ p.gan }}</span>
          <span class="cell-sub">{{ p.ganYY }}{{ p.ganWx }}</span>
        </div>
        <div class="cell cell-zhi">
          <span class="cell-ss" :title="ssTitle(p.zhiShiShen)">{{ p.zhiShiShen }}</span>
          <span class="cell-char" :class="wxCls(p.zhiWx)">{{ p.zhi }}</span>
          <span class="cell-sub">{{ p.zhiYY }}{{ p.zhiWx }}</span>
        </div>
      </div>

      <div v-if="!p.unknown" class="pillar-hide">
        <span class="hide-label">藏干</span>
        <span v-for="hg in p.hide" :key="hg.gan" class="hide-chip">
          <b :class="wxCls(hg.wx)">{{ hg.gan }}</b><i :title="ssTitle(hg.shiShen)">{{ hg.shiShen }}</i>
        </span>
      </div>
      <!-- 时辰未知：占位保持三卡同构，四张卡片高度对齐 -->
      <div v-else class="pillar-hide" aria-hidden="true"></div>

      <div v-if="p.unknown" class="pillar-foot pillar-foot-unknown">时辰未知 · 该柱不参与五行统计</div>
      <div v-else class="pillar-foot">
        <div><span>纳音</span><b>{{ p.naYin }}</b></div>
        <div><span>星运</span><b title="以日主为参照的十二长生">{{ p.diShi }}</b></div>
        <div><span>空亡</span><b :title="'所属旬：' + p.xun">{{ p.xunKong }}</b></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pillars{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.pillar{
  position:relative;border:1px solid var(--line);border-radius:14px;padding:14px 12px 12px;
  background:var(--card-bg);
  animation:rise .55s cubic-bezier(.2,.7,.3,1) both;
  display:flex;flex-direction:column;
}
@keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.pillar.is-day{
  border-color:var(--active-line);
  box-shadow:0 0 0 1px var(--active-ring),0 14px 36px var(--active-shadow);
}
.pillar-top{display:flex;align-items:center;justify-content:space-between;padding:0 2px;min-height:20px}
.pillar-name{font-size:11.5px;color:var(--faint);letter-spacing:.35em}
.pillar-tag{font-size:10.5px;color:var(--muted);border:1px solid var(--line);border-radius:20px;padding:1px 9px;letter-spacing:.12em;cursor:help}
.tag-day{color:var(--day-tag-ink);border-color:var(--day-tag-line);background:var(--day-tag-bg)}
.pillar-ganzhi{flex:1;display:grid;grid-template-columns:1fr 1fr;padding:12px 0 4px;align-items:center}
.cell{display:flex;flex-direction:column;align-items:center;gap:6px;padding:6px 4px}
.cell-zhi{border-left:1px solid var(--line)}
.cell-ss{font-size:11px;color:var(--muted);letter-spacing:.2em;min-height:15px;cursor:help}
.cell-char{font-size:54px;line-height:1.1;font-weight:600}
.cell-sub{font-size:10.5px;color:var(--faint);letter-spacing:.3em}
.pillar-unknown{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:148px;color:var(--faint);letter-spacing:.4em;font-size:15px;gap:4px}
.pillar-hide{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;padding:9px 4px 3px;border-top:1px dashed var(--line);margin-top:9px;height:84px;align-content:center;box-sizing:border-box}
.hide-label{font-size:10px;color:var(--faint);letter-spacing:.3em;text-indent:.3em}
.hide-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:8px;padding:2px 8px;background:var(--surface-3)}
.hide-chip b{font-size:15px;font-weight:600}
.hide-chip i{font-style:normal;font-size:10px;color:var(--muted);cursor:help}
.pillar-foot{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;padding:10px 2px 2px;border-top:1px solid var(--line);margin-top:auto;text-align:center;min-height:52px}
.pillar-foot span{display:block;font-size:10px;color:var(--faint);letter-spacing:.25em;text-indent:.25em;margin-bottom:2px}
.pillar-foot b{font-size:12.5px;font-weight:500;cursor:help}
.pillar-foot-unknown{display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--faint);letter-spacing:.15em}

@media (max-width:820px){
  .pillars{grid-template-columns:1fr 1fr}
  .cell-char{font-size:46px}
}
@media (max-width:460px){
  .cell-char{font-size:42px}
}
</style>

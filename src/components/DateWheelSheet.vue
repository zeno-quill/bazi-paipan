<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import WheelColumn from './WheelColumn.vue'
import { getLunarMonths, getSolarDayCount, LUNAR_DAY_NAMES } from '../core/bazi'

/**
 * 出生日期滚轮选择弹层
 * - 公历：年 / 月 / 日 三列
 * - 农历：年 / 月（含闰月）/ 日（初一…三十）三列，闰月直接出现在月份列中
 * 确认后 emit('confirm', { y, m, d, leap })
 */
const props = defineProps({
  show: { type: Boolean, default: false },
  calendar: { type: String, default: 'solar' }, // solar | lunar
  y: { type: Number, required: true },
  m: { type: Number, required: true },
  d: { type: Number, required: true },
  leap: { type: Boolean, default: false }
})
const emit = defineEmits(['confirm', 'cancel'])

const YEAR_MIN = 1850, YEAR_MAX = 2099

// 面板内临时状态（确认才写回父级）；农历月份用带符号值区分闰月（负数为闰）
const ty = ref(props.y)
const tm = ref(1)
const td = ref(props.d)

// 三列滚轮引用（confirm 前 flush，防止防抖未触发拿到旧值）
const yearCol = ref(null)
const monthCol = ref(null)
const dayCol = ref(null)

const yearItems = computed(() => {
  const arr = []
  for (let y = YEAR_MAX; y >= YEAR_MIN; y--) arr.push({ value: y, label: y + ' 年' })
  return arr
})

// 农历年 → 月份对象缓存（含闰月与当月天数）
const lunarMonths = computed(() =>
  props.calendar === 'lunar' ? getLunarMonths(ty.value) : []
)

const monthItems = computed(() => {
  if (props.calendar === 'solar') {
    return Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: (i + 1) + ' 月' }))
  }
  return lunarMonths.value.map((o) => ({ value: o.leap ? -o.month : o.month, label: o.label, accent: o.leap }))
})

// 当前农历年是否含闰月（决定提示文案与强调色）
const hasLeap = computed(() => lunarMonths.value.some((o) => o.leap))

const dayItems = computed(() => {
  if (props.calendar === 'solar') {
    const n = getSolarDayCount(ty.value, tm.value)
    return Array.from({ length: n }, (_, i) => ({ value: i + 1, label: (i + 1) + ' 日' }))
  }
  const hit = lunarMonths.value.find((o) => (o.leap ? -o.month : o.month) === tm.value)
  const n = hit ? hit.dayCount : 30
  return Array.from({ length: n }, (_, i) => ({ value: i + 1, label: LUNAR_DAY_NAMES[i] }))
})

// 年变化：农历月份列表整体变化，校正当前月（优先同月非闰，其次首月）
watch(ty, () => {
  if (props.calendar !== 'lunar') return
  const list = monthItems.value
  if (list.some((it) => it.value === tm.value)) return
  const same = list.find((it) => Math.abs(it.value) === Math.abs(tm.value) && it.value > 0)
  tm.value = (same || list[0]).value
})

// 月变化：钳制日
watch(tm, () => {
  const max = dayItems.value.length
  if (td.value > max) td.value = max
})

// 打开时同步父级当前值，并锁定背景滚动
function onKey(e) { if (e.key === 'Escape') cancel() }
watch(() => props.show, (v) => {
  if (v) {
    ty.value = props.y
    tm.value = props.calendar === 'lunar' && props.leap ? -props.m : props.m
    td.value = props.d
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
  } else {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKey)
  }
})
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})

function confirm() {
  // 先按 年→月→日 顺序强制同步滚动位置（级联依赖：年定月列表，月定日数）
  yearCol.value?.flush()
  monthCol.value?.flush()
  dayCol.value?.flush()
  // 联动 watch 是异步的，快速操作时此处做最终钳制：
  // 农历：当前月（含闰）须存在于该年月份列表，否则取同月非闰或首月
  if (props.calendar === 'lunar') {
    const list = monthItems.value
    if (!list.some((it) => it.value === tm.value)) {
      const same = list.find((it) => Math.abs(it.value) === Math.abs(tm.value) && it.value > 0)
      tm.value = (same || list[0]).value
    }
  }
  // 日 ≤ 当月天数（如 2 月 31 日快速确认的场景）
  const maxDay = dayItems.value.length
  if (td.value > maxDay) td.value = maxDay
  emit('confirm', { y: ty.value, m: Math.abs(tm.value), d: td.value, leap: tm.value < 0 })
}
function cancel() {
  emit('cancel')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="sheet-mask" @click.self="cancel">
      <div class="sheet" role="dialog" aria-modal="true" :aria-label="calendar === 'solar' ? '选择公历出生日期' : '选择农历出生日期'">
        <div class="sheet-head">
          <button type="button" class="sheet-btn" @click="cancel">取消</button>
          <span class="sheet-title">{{ calendar === 'solar' ? '出生日期 · 公历' : '出生日期 · 农历' }}</span>
          <button type="button" class="sheet-btn is-ok" @click="confirm">确定</button>
        </div>
        <div class="sheet-wheels">
          <div class="sheet-band" aria-hidden="true"></div>
          <WheelColumn ref="yearCol" v-model="ty" :items="yearItems" />
          <WheelColumn ref="monthCol" v-model="tm" :items="monthItems" />
          <WheelColumn ref="dayCol" v-model="td" :items="dayItems" />
        </div>
        <p v-if="calendar === 'lunar'" class="sheet-hint" :class="{ 'is-leap': hasLeap }">
          {{ hasLeap ? '该年含闰月 · 月份列中带「闰」的一项即为闰月' : '该年无闰月，正常选择月份即可' }}
        </p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sheet-mask{
  position:fixed;inset:0;z-index:50;
  background:var(--mask-bg);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);
  display:flex;align-items:flex-end;justify-content:center;
  animation:fadeIn .18s ease both;
}
.sheet{
  width:100%;max-width:520px;
  background:var(--sheet-bg);
  border:1px solid var(--line-strong);border-bottom:none;border-radius:16px 16px 0 0;
  padding:14px 16px calc(16px + env(safe-area-inset-bottom));
  animation:sheetUp .24s cubic-bezier(.2,.8,.3,1) both;
}
@media (min-width:640px){
  .sheet-mask{align-items:center;padding:20px}
  .sheet{border-bottom:1px solid var(--line-strong);border-radius:16px}
}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes sheetUp{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}
.sheet-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.sheet-title{font-size:14px;color:var(--gold);letter-spacing:.25em;text-indent:.25em}
.sheet-btn{
  font:inherit;font-size:14px;letter-spacing:.15em;text-indent:.15em;cursor:pointer;
  background:none;border:none;color:var(--muted);padding:6px 10px;
}
.sheet-btn:hover{color:var(--gold-strong)}
.sheet-btn.is-ok{color:var(--gold-strong);font-weight:600}
.sheet-wheels{position:relative;display:flex;gap:4px}
/* 中间高亮选中带 */
.sheet-band{
  position:absolute;left:2px;right:2px;top:50%;height:36px;transform:translateY(-50%);
  border-top:1px solid var(--line-strong);border-bottom:1px solid var(--line-strong);
  border-radius:8px;background:var(--gold-hover-bg);pointer-events:none;
}
.sheet-hint{
  margin-top:10px;display:flex;align-items:center;justify-content:center;gap:6px;
  font-size:11.5px;color:var(--muted);letter-spacing:.06em;
}
.sheet-hint::before{content:'';width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.75;flex:0 0 auto}
.sheet-hint.is-leap{color:var(--gold)}
</style>

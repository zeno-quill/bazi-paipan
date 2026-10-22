<script setup>
import { ref, computed } from 'vue'
import { pad2, LUNAR_MONTH_NAMES, LUNAR_DAY_NAMES } from '../core/bazi'
import DateWheelSheet from './DateWheelSheet.vue'

defineProps({
  error: { type: String, default: '' }
})
const emit = defineEmits(['submit'])

const CHEN_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

const now = new Date()
const curHourIdx = Math.floor(((now.getHours() + 1) % 24) / 2)

const name = ref('')
const gender = ref(1)          // 1 男 · 乾造 / 0 女 · 坤造
const calendar = ref('solar')  // solar | lunar
const sy = ref(now.getFullYear())
const sm = ref(now.getMonth() + 1)
const sd = ref(now.getDate())
const ly = ref(now.getFullYear())
const lm = ref(1)
const ld = ref(1)
const leap = ref(false)
const hour = ref(String(curHourIdx)) // '' = 未知时辰
const time = ref('')                 // 精确时刻（选填）
const showSheet = ref(false)         // 滚轮日期选择弹层

// 日期展示文案：公历 1993年12月26日 / 农历 1893年闰冬月初三
const dateText = computed(() => {
  if (calendar.value === 'solar') return `${sy.value} 年 ${sm.value} 月 ${sd.value} 日`
  return `${ly.value} 年 ${leap.value ? '闰' : ''}${LUNAR_MONTH_NAMES[lm.value - 1]}月${LUNAR_DAY_NAMES[ld.value - 1]}`
})

function onDateConfirm({ y, m, d, leap: lp }) {
  if (calendar.value === 'solar') {
    sy.value = y; sm.value = m; sd.value = d
  } else {
    ly.value = y; lm.value = m; ld.value = d; leap.value = lp
  }
  showSheet.value = false
}

// 时辰选项：'' 未知；其余为时辰中点策略所需的索引
const hourOptions = computed(() =>
  CHEN_NAMES.map((n, i) => {
    const s = (i * 2 + 23) % 24, e = (i * 2 + 1) % 24
    return { value: String(i), label: `${n}时 ${pad2(s)}:00–${pad2(e)}:00` }
  })
)

/**
 * 时间策略: 填了精确时刻优先; 否则选中时辰取其中点; 「未知时辰」且无精确时刻按三柱计
 */
function buildPayload() {
  const out = { name: name.value, gender: gender.value, calendar: calendar.value }
  if (calendar.value === 'solar') {
    out.y = sy.value; out.m = sm.value; out.d = sd.value
  } else {
    out.y = ly.value; out.m = lm.value; out.d = ld.value; out.leap = leap.value
  }
  const tv = (time.value || '').split(':')
  const th = Number(tv[0]), tmin = Number(tv[1])
  if (time.value && !isNaN(th) && !isNaN(tmin) && th >= 0 && th <= 23 && tmin >= 0 && tmin <= 59) {
    out.unknownHour = false; out.h = th; out.min = tmin
  } else if (hour.value === '') {
    out.unknownHour = true; out.h = 12; out.min = 0
  } else {
    out.unknownHour = false; out.h = (Number(hour.value) * 2) % 24; out.min = 0
  }
  return out
}

function submit() {
  emit('submit', buildPayload())
}

// 可公开核验的示例命例：1893-12-26 辰时 · 乾造 → 癸巳 甲子 丁酉 甲辰
function loadSample() {
  name.value = '示例命造'
  gender.value = 1
  calendar.value = 'solar'
  sy.value = 1893; sm.value = 12; sd.value = 26
  hour.value = '4'
  time.value = '08:00'
  submit()
}
</script>

<template>
  <section class="panel">
    <h2 class="sec-title">出生信息</h2>
    <form autocomplete="off" novalidate @submit.prevent="submit">
      <div class="form-grid">
        <div class="field">
          <label class="field-label" for="f-name">称呼（选填）</label>
          <input id="f-name" v-model.trim="name" type="text" placeholder="如：某人" maxlength="20">
        </div>
        <div class="field">
          <label class="field-label" id="lb-gender">性别 · 乾造 / 坤造</label>
          <div class="seg" role="radiogroup" aria-labelledby="lb-gender">
            <label class="seg-item"><input type="radio" v-model="gender" :value="1"><span>男 · 乾造</span></label>
            <label class="seg-item"><input type="radio" v-model="gender" :value="0"><span>女 · 坤造</span></label>
          </div>
        </div>
        <div class="field">
          <label class="field-label" id="lb-cal">历法</label>
          <div class="seg" role="radiogroup" aria-labelledby="lb-cal">
            <label class="seg-item"><input type="radio" v-model="calendar" value="solar"><span>公历</span></label>
            <label class="seg-item"><input type="radio" v-model="calendar" value="lunar"><span>农历</span></label>
          </div>
        </div>
      </div>
      <div class="form-grid form-grid-2">
        <div class="field">
          <label class="field-label" id="lb-date">出生日期（{{ calendar === 'solar' ? '公历' : '农历' }}）</label>
          <button type="button" class="date-display" aria-labelledby="lb-date" aria-haspopup="dialog" @click="showSheet = true">
            <span>{{ dateText }}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
          </button>
        </div>
        <div class="field">
          <label class="field-label" for="f-hour">出生时辰</label>
          <div class="time-row">
            <select id="f-hour" v-model="hour" aria-label="出生时辰">
              <option value="">未知时辰</option>
              <option v-for="opt in hourOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <!-- <input id="f-time" v-model="time" type="time" title="精确时刻（选填）：留空按时辰中点计算，填写后用于更精确的起运"> -->
          </div>
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">开始排盘</button>
        <button type="button" class="btn btn-ghost" @click="loadSample">载入示例盘</button>
      </div>
      <p v-show="error" class="form-error" role="alert">{{ error }}</p>
    </form>

    <DateWheelSheet
      :show="showSheet"
      :calendar="calendar"
      :y="calendar === 'solar' ? sy : ly"
      :m="calendar === 'solar' ? sm : lm"
      :d="calendar === 'solar' ? sd : ld"
      :leap="leap"
      @confirm="onDateConfirm"
      @cancel="showSheet = false"
    />
  </section>
</template>

<style scoped>
.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:16px;margin-bottom:16px}
.field-label{display:block;font-size:11.5px;color:var(--muted);letter-spacing:.25em;margin-bottom:8px}
input[type=text],select,input[type=time]{
  width:100%;height:44px;background:var(--input-bg);border:1px solid var(--line-strong);border-radius:10px;
  padding:0 12px;color:var(--ink);font:inherit;font-size:14px;
}
select{padding:0 8px 0 10px;cursor:pointer}
input[type=text]:focus,select:focus,input[type=time]:focus{
  outline:none;border-color:var(--gold-focus);box-shadow:0 0 0 3px var(--gold-glow);
}
input:disabled{opacity:.4}
.seg{display:flex;height:44px;background:var(--input-bg);border:1px solid var(--line-strong);border-radius:10px;overflow:hidden}
.seg-item{flex:1;position:relative;display:flex}
.seg-item input{position:absolute;inset:0;width:100%;height:100%;opacity:0;margin:0;border:0;appearance:none;-webkit-appearance:none;cursor:pointer}
.seg-item span{flex:1;display:flex;align-items:center;justify-content:center;font-size:13.5px;color:var(--muted);cursor:pointer;letter-spacing:.15em;transition:background .2s,color .2s}
.seg-item input:checked+span{background:var(--gold-soft);color:var(--gold-strong)}
.seg-item input:focus-visible+span{outline:2px solid var(--gold);outline-offset:-3px}
.date-display{
  width:100%;height:44px;background:var(--input-bg);border:1px solid var(--line-strong);border-radius:10px;
  padding:0 12px;color:var(--ink);font:inherit;font-size:14px;cursor:pointer;
  display:flex;align-items:center;justify-content:space-between;gap:8px;
  letter-spacing:.06em;text-align:left;transition:border-color .2s,box-shadow .2s;
}
.date-display:hover{border-color:var(--gold-hover-line)}
.date-display:focus-visible{outline:none;border-color:var(--gold-focus);box-shadow:0 0 0 3px var(--gold-glow)}
.date-display svg{color:var(--faint);flex:0 0 auto}
.time-row{display:flex;gap:8px;align-items:center}
.time-row select{flex:1.25;min-width:0}
.time-row input{flex:1;min-width:0}
.form-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:4px}
.btn{
  font:inherit;font-size:14px;letter-spacing:.3em;text-indent:.3em;cursor:pointer;
  border-radius:10px;padding:11px 26px;transition:transform .15s,box-shadow .15s,filter .15s;
}
.btn-primary{background:linear-gradient(135deg,#d24a35,#a63524);color:#fff6ec;border:1px solid rgba(255,255,255,.08)}
.btn-primary:hover{filter:brightness(1.1);box-shadow:0 8px 22px rgba(210,74,53,.3);transform:translateY(-1px)}
.btn-ghost{background:transparent;color:var(--gold);border:1px solid var(--line-strong)}
.btn-ghost:hover{background:var(--gold-hover-bg);transform:translateY(-1px)}
.form-error{margin-top:14px;color:var(--error-ink);font-size:13.5px;letter-spacing:.05em}

@media (max-width:460px){
  .form-actions .btn{flex:1}
  .time-row{flex-wrap:wrap}
}
</style>

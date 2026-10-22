/**
 * 八字排盘 · 纯计算层（BaziCore）
 * 算法内核: lunar-javascript (MIT) — github.com/6tail/lunar-javascript
 * 本模块不依赖任何 DOM / Vue，可在 Node 中直接单测：
 *   node scripts/verify-core.mjs
 */
// lunar-javascript 为 CommonJS 压缩包，命名导出对打包器不稳定，
// 统一走默认导出（CJS 互操作 = module.exports）再解构。
import LunarLib from 'lunar-javascript'

const { Solar, Lunar, LunarUtil: U, LunarMonth, LunarYear } = LunarLib

// LunarUtil.GAN/ZHI 为 1 起始数组(第 0 位空串), 统一归一化为 0 起始字符串
function toStr(src) {
  if (!Array.isArray(src)) return String(src)
  return (src[0] === '' ? src.slice(1) : src).join('')
}

export const GAN = toStr(U ? U.GAN : '甲乙丙丁戊己庚辛壬癸')
export const ZHI = toStr(U ? U.ZHI : '子丑寅卯辰巳午未申酉戌亥')

export const WX_GAN = U ? U.WU_XING_GAN : { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' }
export const WX_ZHI = U ? U.WU_XING_ZHI : { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' }

export const SHENG_XIAO = { 子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔', 辰: '龙', 巳: '蛇', 午: '马', 未: '羊', 申: '猴', 酉: '鸡', 戌: '狗', 亥: '猪' }
export const WUXING_LIST = ['木', '火', '土', '金', '水']

export function pad2(n) { return (n < 10 ? '0' : '') + n }

// 十神: 以 dayGan 为日主, 推 other 天干之十神(与库内结果一致, 用于流年等扩展计算)
export function shiShen(dayGan, other) {
  const i = GAN.indexOf(dayGan), j = GAN.indexOf(other)
  if (i < 0 || j < 0) return ''
  const w1 = WX_GAN[dayGan], w2 = WX_GAN[other]
  const same = (i % 2) === (j % 2)
  const SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
  const KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }
  if (w1 === w2) return same ? '比肩' : '劫财'
  if (SHENG[w1] === w2) return same ? '食神' : '伤官'
  if (SHENG[w2] === w1) return same ? '偏印' : '正印'
  if (KE[w1] === w2) return same ? '偏财' : '正财'
  if (KE[w2] === w1) return same ? '七杀' : '正官'
  return ''
}

export function shiChenName(h) {
  const idx = Math.floor(((h + 1) % 24) / 2)
  return ZHI.charAt(idx) + '时'
}

/**
 * 计算命盘
 * @param input {name, gender:1男|0女, calendar:'solar'|'lunar', leap:boolean,
 *               y,m,d, h,min, unknownHour:boolean}
 * @returns {ok:true, ...} 或 {ok:false, error}
 */
export function computeChart(input) {
  try {
    const y = Number(input.y), m = Number(input.m), d = Number(input.d)
    if (!y || !m || !d) return { ok: false, error: '请先填写完整的出生日期。' }
    if (y < 1850 || y > 2099) return { ok: false, error: '年份需在 1850 — 2099 之间。' }

    const unknownHour = !!input.unknownHour
    const h = unknownHour ? 12 : Number(input.h)
    const min = unknownHour ? 0 : Number(input.min)
    if (!unknownHour && (isNaN(h) || isNaN(min) || h < 0 || h > 23 || min < 0 || min > 59)) {
      return { ok: false, error: '出生时间不正确,请检查。' }
    }

    let solar, lunar
    if (input.calendar === 'lunar') {
      if (!(m >= 1 && m <= 12 && d >= 1 && d <= 30)) return { ok: false, error: '农历日期不正确。' }
      const lmVal = input.leap ? -m : m
      const lm = LunarMonth.fromYm(y, lmVal)
      if (!lm) return { ok: false, error: y + ' 年不存在' + (input.leap ? '闰' : '') + '该农历月份,请检查。' }
      if (d > lm.getDayCount()) return { ok: false, error: (input.leap ? '闰' : '') + '该农历月只有 ' + lm.getDayCount() + ' 天,请检查日期。' }
      lunar = Lunar.fromYmdHms(y, lmVal, d, h, min, 0)
      solar = lunar.getSolar()
    } else {
      // 公历有效性自检(JS Date 会溢出归一化, 回读不等即非法日期, 如 2 月 30 日)
      const dt = new Date(y, m - 1, d)
      if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
        return { ok: false, error: '该公历日期不存在,请检查输入。' }
      }
      solar = Solar.fromYmdHms(y, m, d, h, min, 0)
      lunar = solar.getLunar()
    }
    // 回读校验(仅公历输入): 防止异常输入被静默归一化
    if (input.calendar !== 'lunar' &&
      (solar.getYear() !== y || solar.getMonth() !== m || solar.getDay() !== d)) {
      return { ok: false, error: '该日期不存在,请检查输入。' }
    }
    if (input.calendar === 'lunar' &&
      (lunar.getYear() !== y || Math.abs(lunar.getMonth()) !== m || lunar.getDay() !== d || (lunar.getMonth() < 0) !== !!input.leap)) {
      return { ok: false, error: '该农历日期不存在,请检查输入。' }
    }

    const ec = lunar.getEightChar()
    const dayGan = ec.getDayGan()

    const defs = [
      ['year', '年柱', ec.getYearGan(), ec.getYearZhi(), ec.getYearHideGan(), ec.getYearShiShenGan(), ec.getYearShiShenZhi(), ec.getYearNaYin(), ec.getYearXun(), ec.getYearXunKong(), ec.getYearDiShi()],
      ['month', '月柱', ec.getMonthGan(), ec.getMonthZhi(), ec.getMonthHideGan(), ec.getMonthShiShenGan(), ec.getMonthShiShenZhi(), ec.getMonthNaYin(), ec.getMonthXun(), ec.getMonthXunKong(), ec.getMonthDiShi()],
      ['day', '日柱', ec.getDayGan(), ec.getDayZhi(), ec.getDayHideGan(), ec.getDayShiShenGan(), ec.getDayShiShenZhi(), ec.getDayNaYin(), ec.getDayXun(), ec.getDayXunKong(), ec.getDayDiShi()],
      ['time', '时柱', ec.getTimeGan(), ec.getTimeZhi(), ec.getTimeHideGan(), ec.getTimeShiShenGan(), ec.getTimeShiShenZhi(), ec.getTimeNaYin(), ec.getTimeXun(), ec.getTimeXunKong(), ec.getTimeDiShi()]
    ]

    const pillars = defs.map(function (p) {
      const hideArr = p[4] || []
      const ssZhi = p[6] || []
      const hide = hideArr.map(function (hg, i) {
        return { gan: hg, wx: WX_GAN[hg], shiShen: ssZhi[i] || shiShen(dayGan, hg) }
      })
      return {
        key: p[0], label: p[1],
        gan: p[2], zhi: p[3],
        ganWx: WX_GAN[p[2]], zhiWx: WX_ZHI[p[3]],
        ganYY: GAN.indexOf(p[2]) % 2 === 0 ? '阳' : '阴',
        zhiYY: ZHI.indexOf(p[3]) % 2 === 0 ? '阳' : '阴',
        shiShenGan: p[0] === 'day' ? '日主' : p[5],
        zhiShiShen: ssZhi[0] || '',
        hide: hide,
        naYin: p[7], xun: p[8], xunKong: p[9], diShi: p[10],
        unknown: false
      }
    })

    const main = {}, hideC = {}, total = {}
    WUXING_LIST.forEach(function (w) { main[w] = 0; hideC[w] = 0; total[w] = 0 })
    pillars.forEach(function (p) {
      if (p.key === 'time' && unknownHour) { p.unknown = true; return }
      main[p.ganWx]++; main[p.zhiWx]++
      p.hide.forEach(function (hg) { hideC[hg.wx]++ })
    })
    WUXING_LIST.forEach(function (w) { total[w] = main[w] + hideC[w] })

    const yun = ec.getYun(input.gender === 0 ? 0 : 1)
    const daYun = yun.getDaYun(11).map(function (dy, i) {
      let liuNian = []
      if (i > 0 && typeof dy.getLiuNian === 'function') {
        liuNian = dy.getLiuNian().map(function (x) {
          const gz = x.getGanZhi() || ''
          return {
            year: x.getYear(), ganZhi: gz, age: x.getAge(),
            shiShen: gz ? shiShen(dayGan, gz.charAt(0)) : ''
          }
        })
      }
      return {
        index: i, ganZhi: dy.getGanZhi(),
        startAge: dy.getStartAge(), endAge: dy.getEndAge(),
        startYear: dy.getStartYear(), endYear: dy.getEndYear(),
        liuNian: liuNian
      }
    })

    const prevJq = lunar.getPrevJieQi(true), nextJq = lunar.getNextJieQi(true)
    const yearGanYang = GAN.indexOf(pillars[0].gan) % 2 === 0
    const forward = (input.gender === 1) === yearGanYang
    const gender = input.gender === 0 ? 0 : 1

    return {
      ok: true,
      name: String(input.name || '').trim(),
      gender: gender,
      genderLabel: gender === 0 ? '坤造 · 女' : '乾造 · 男',
      forward: forward,
      forwardLabel: (yearGanYang ? '阳' : '阴') + (gender === 1 ? '男' : '女') + ' · 大运' + (forward ? '顺排' : '逆排'),
      solarStr: solar.toYmd() + ' ' + (unknownHour ? '时辰未知' : pad2(h) + ':' + pad2(min)) + ' · 星期' + solar.getWeekInChinese(),
      lunarStr: lunar.getYearInChinese() + '年' + lunar.getMonthInChinese() + '月' + lunar.getDayInChinese(),
      shiChen: unknownHour ? '未知' : shiChenName(h),
      shengxiao: SHENG_XIAO[pillars[0].zhi],
      xingzuo: solar.getXingZuo() + '座',
      jieQiPrev: { name: prevJq.getName(), date: prevJq.getSolar().toYmd() },
      jieQiNext: { name: nextJq.getName(), date: nextJq.getSolar().toYmd() },
      mingGong: ec.getMingGong(), taiYuan: ec.getTaiYuan(), shenGong: ec.getShenGong(),
      unknownHour: unknownHour,
      yearPillarYY: yearGanYang ? '阳' : '阴',
      pillars: pillars,
      dayMaster: { gan: dayGan, wx: WX_GAN[dayGan], yy: GAN.indexOf(dayGan) % 2 === 0 ? '阳' : '阴' },
      wuxing: { main: main, hide: hideC, total: total },
      yun: {
        startYears: yun.getStartYear(), startMonths: yun.getStartMonth(), startDays: yun.getStartDay(),
        startSolar: yun.getStartSolar().toYmd(),
        daYun: daYun
      }
    }
  } catch (e) {
    return { ok: false, error: '排盘失败：' + (e && e.message ? e.message : '日期或时间无效,请检查输入。') }
  }
}

/* ============================================================
 * 日期选择辅助（滚轮选择器用）
 * ============================================================ */

export const LUNAR_MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
export const LUNAR_DAY_NAMES = (() => {
  const n = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  const arr = []
  for (let i = 1; i <= 30; i++) {
    if (i <= 10) arr.push('初' + n[i - 1])
    else if (i < 20) arr.push('十' + n[i - 11])
    else if (i === 20) arr.push('二十')
    else if (i < 30) arr.push('廿' + n[i - 21])
    else arr.push('三十')
  }
  return arr
})()

/**
 * 某农历年的月份列表（含闰月）
 * @returns [{ label, month, leap, dayCount }]  month 为 1-12, leap 标记闰月
 */
export function getLunarMonths(y) {
  // 库返回的是跨年序列（上年冬月/腊月 … 本年腊月/下年正月），
  // 按 getYear() 裁剪出属于该农历年的正月…腊月，避免重复月份与重复 key
  const months = LunarYear.fromYear(y).getMonths().filter((lm) => lm.getYear() === y)
  return months.map((lm) => {
    const m = Math.abs(lm.getMonth())
    return {
      label: (lm.isLeap() ? '闰' : '') + LUNAR_MONTH_NAMES[m - 1] + '月',
      month: m,
      leap: lm.isLeap(),
      dayCount: lm.getDayCount()
    }
  })
}

/** 公历某年月天数 */
export function getSolarDayCount(y, m) {
  return new Date(y, m, 0).getDate()
}

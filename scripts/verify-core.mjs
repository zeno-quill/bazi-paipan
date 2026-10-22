/**
 * 核心算法自检：示例命例 1893-12-26 08:00 乾造
 * 预期四柱：癸巳 甲子 丁酉 甲辰
 * 运行：npm run test:core
 */
import { computeChart, shiShen, shiChenName, getLunarMonths, getSolarDayCount, LUNAR_DAY_NAMES } from '../src/core/bazi.js'

let failed = 0
function assert(label, actual, expected) {
  const ok = actual === expected
  if (!ok) failed++
  console.log(`${ok ? '✅' : '❌'} ${label}: ${JSON.stringify(actual)}${ok ? '' : ' (预期 ' + JSON.stringify(expected) + ')'}`)
}

const chart = computeChart({
  name: '示例命造', gender: 1, calendar: 'solar',
  y: 1893, m: 12, d: 26, h: 8, min: 0, unknownHour: false
})

assert('排盘成功', chart.ok, true)
assert('年柱', chart.pillars[0].gan + chart.pillars[0].zhi, '癸巳')
assert('月柱', chart.pillars[1].gan + chart.pillars[1].zhi, '甲子')
assert('日柱', chart.pillars[2].gan + chart.pillars[2].zhi, '丁酉')
assert('时柱', chart.pillars[3].gan + chart.pillars[3].zhi, '甲辰')
assert('日主', chart.dayMaster.gan, '丁')
assert('日主五行', chart.dayMaster.wx, '火')
assert('大运方向（阴男逆排）', chart.forward, false)
assert('生肖', chart.shengxiao, '蛇')
assert('大运条目数', chart.yun.daYun.length, 11)
assert('流年十神（甲→正印）', shiShen('丁', '甲'), '正印')
assert('时辰名（8点→辰时）', shiChenName(8), '辰时')

// 边界：非法公历日期
const bad = computeChart({ gender: 1, calendar: 'solar', y: 2023, m: 2, d: 30, h: 8, min: 0 })
assert('2月30日被拦截', bad.ok, false)

// 边界：时辰未知
const noHour = computeChart({ gender: 0, calendar: 'solar', y: 2000, m: 1, d: 1, unknownHour: true })
assert('时辰未知可排三柱', noHour.ok, true)
assert('时柱标记 unknown', noHour.pillars[3].unknown, true)

// 滚轮选择器辅助函数
const m2023 = getLunarMonths(2023)
assert('2023 农历含闰二月', m2023.some((x) => x.leap && x.month === 2), true)
assert('2023 闰二月标签', m2023.find((x) => x.leap).label, '闰二月')
assert('2025 农历含闰六月', getLunarMonths(2025).some((x) => x.leap && x.month === 6), true)
assert('2024 无闰月', getLunarMonths(2024).some((x) => x.leap), false)
assert('2023 闰二月天数合法', [29, 30].includes(m2023.find((x) => x.leap).dayCount), true)
assert('公历 2024-02 天数', getSolarDayCount(2024, 2), 29)
assert('公历 2023-02 天数', getSolarDayCount(2023, 2), 28)
assert('农历日名 初一', LUNAR_DAY_NAMES[0], '初一')
assert('农历日名 十五', LUNAR_DAY_NAMES[14], '十五')
assert('农历日名 廿三', LUNAR_DAY_NAMES[22], '廿三')
assert('农历日名 三十', LUNAR_DAY_NAMES[29], '三十')

if (failed) {
  console.error(`\n${failed} 项未通过`)
  process.exit(1)
}
console.log('\n全部通过 ✅')

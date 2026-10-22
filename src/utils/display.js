/**
 * 展示层工具:五行着色 class、十神释义 tooltip
 */
import { WX_GAN, WX_ZHI } from '../core/bazi'

export const WX_CLASS = { 金: 'jin', 木: 'mu', 水: 'shui', 火: 'huo', 土: 'tu' }

export function wxCls(w) {
  return 'wx-' + (WX_CLASS[w] || 'tu')
}

/** 干支字符 → 五行着色 class（天干查天干表，地支查地支表） */
export function wxClsOfChar(ch) {
  return wxCls(WX_GAN[ch] || WX_ZHI[ch] || '')
}

export const SHI_SHEN_TIP = {
  比肩: '同我者·同性 — 自立、同辈',
  劫财: '同我者·异性 — 竞争、分担',
  食神: '我生者·同性 — 才华、口福',
  伤官: '我生者·异性 — 聪慧、个性',
  偏财: '我克者·同性 — 活财、机遇',
  正财: '我克者·异性 — 稳财、务实',
  七杀: '克我者·同性 — 魄力、压力',
  正官: '克我者·异性 — 规范、责任',
  偏印: '生我者·同性 — 悟性、思虑',
  正印: '生我者·异性 — 学识、庇护'
}

/** 十神 → title 提示文案（无释义返回 undefined，模板里不渲染 title 属性） */
export function ssTitle(ss) {
  return SHI_SHEN_TIP[ss] ? ss + '：' + SHI_SHEN_TIP[ss] : undefined
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

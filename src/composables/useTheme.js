import { ref, computed, watch } from 'vue'

/**
 * 主题模式：auto（跟随系统） / light / dark
 * - 解析结果写入 <html data-theme>，CSS 变量据此切换
 * - 用户显式选择持久化到 localStorage；auto 时不写存储，始终跟随系统
 * 模块级单例，多个组件可共享同一状态
 */
const STORAGE_KEY = 'bazi-theme'
const MODES = ['auto', 'light', 'dark']

function readSaved() {
  try { return localStorage.getItem(STORAGE_KEY) } catch { return null }
}

function writeSaved(m) {
  try {
    if (m === 'auto') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, m)
  } catch { /* 隐私模式禁用存储时忽略 */ }
}

const media = window.matchMedia('(prefers-color-scheme: dark)')
const systemDark = ref(media.matches)

const saved = readSaved()
const mode = ref(MODES.includes(saved) ? saved : 'auto')

const resolved = computed(() =>
  mode.value === 'auto' ? (systemDark.value ? 'dark' : 'light') : mode.value
)

// 跟随系统时实时响应系统主题变化
media.addEventListener('change', (e) => { systemDark.value = e.matches })

watch(resolved, (t) => {
  const root = document.documentElement
  root.dataset.theme = t
  root.style.colorScheme = t
}, { immediate: true })

watch(mode, writeSaved)

export function useTheme() {
  return {
    mode,
    resolved,
    setMode(m) { if (MODES.includes(m)) mode.value = m }
  }
}

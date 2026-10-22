<script setup>
import { ref, watch, nextTick } from 'vue'
import { computeChart } from './core/bazi'
import { prefersReducedMotion } from './utils/display'
import StarBackground from './components/StarBackground.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import BaziForm from './components/BaziForm.vue'
import InfoStrip from './components/InfoStrip.vue'
import PillarsPanel from './components/PillarsPanel.vue'
import WuxingPanel from './components/WuxingPanel.vue'
import DayunPanel from './components/DayunPanel.vue'

const chart = ref(null)
const error = ref('')
const resultsRef = ref(null)

function onSubmit(input) {
  error.value = ''
  const c = computeChart(input)
  if (!c.ok) {
    error.value = c.error || '排盘失败,请检查输入。'
    return
  }
  chart.value = c
}

// 排盘成功：更新标题（四柱入标题）并平滑滚动到结果区
watch(chart, async (c) => {
  if (!c) return
  document.title = '八字排盘 · ' + c.pillars.map((p) => p.gan + p.zhi).join(' ')
  await nextTick()
  if (!prefersReducedMotion() && resultsRef.value) {
    resultsRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
})
</script>

<template>
  <StarBackground />

  <header class="hero">
    <ThemeToggle />
    <svg class="bagua" viewBox="0 0 300 300" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="1">
        <circle cx="150" cy="150" r="118" stroke-dasharray="3 6"/>
        <circle cx="150" cy="150" r="96" stroke-dasharray="1 5"/>
      </g>
      <g fill="currentColor" font-size="21" text-anchor="middle" dominant-baseline="central">
        <text x="150" y="32">☰</text>
        <text x="233.4" y="66.6">☱</text>
        <text x="268" y="150">☲</text>
        <text x="233.4" y="233.4">☳</text>
        <text x="150" y="268">☷</text>
        <text x="66.6" y="233.4">☶</text>
        <text x="32" y="150">☴</text>
        <text x="66.6" y="66.6">☵</text>
      </g>
    </svg>
    <div class="hero-inner">
      <svg class="seal" viewBox="0 0 44 44" aria-hidden="true">
        <defs>
          <linearGradient id="sealGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#e05a3c"/>
            <stop offset="1" stop-color="#9e3220"/>
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="42" height="42" rx="9" fill="url(#sealGrad)"/>
        <rect x="3.5" y="3.5" width="37" height="37" rx="7" fill="none" stroke="rgba(255,244,230,.45)" stroke-width="1"/>
        <text x="22" y="23.5" text-anchor="middle" dominant-baseline="central" font-size="22" fill="#fdf3e3" font-family="Noto Serif SC,Songti SC,STSong,serif">命</text>
      </svg>
      <h1>八字排盘</h1>
      <p class="hero-sub">公历农历互转 · 四柱十神 · 五行纳音 · 大运流年</p>
    </div>
  </header>

  <main class="wrap">
    <BaziForm :error="error" @submit="onSubmit" />

    <div v-if="!chart" class="empty-state panel">
      <div class="empty-glyph" aria-hidden="true">四柱</div>
      <p>在上方填写出生信息，点击 <b>开始排盘</b>，即刻生成四柱命盘。</p>
      <p class="empty-hint">支持公历 / 农历（含闰月）输入；时辰不确定可选「未知时辰」，命盘将按年、月、日三柱呈现。</p>
    </div>

    <section v-else id="results" ref="resultsRef" aria-live="polite">
      <section class="panel">
        <h2 class="sec-title">基本信息</h2>
        <InfoStrip :chart="chart" />
      </section>

      <section class="panel">
        <h2 class="sec-title">
          四柱命盘
          <span class="sec-extra">{{ (chart.name ? '「' + chart.name + '」· ' : '') + chart.genderLabel }}</span>
        </h2>
        <PillarsPanel :chart="chart" />
      </section>

      <section class="panel">
        <h2 class="sec-title">五行与日主</h2>
        <WuxingPanel :chart="chart" />
      </section>

      <section class="panel">
        <h2 class="sec-title">大运 · 流年</h2>
        <DayunPanel :chart="chart" />
      </section>
    </section>
  </main>

  <footer class="foot">
    <p>本工具仅用于传统历法与命理文化的学习交流，排盘结果不构成任何现实建议。</p>
    <p>干支、节气与历法算法基于开源项目 <a href="https://github.com/6tail/lunar-javascript" target="_blank" rel="noopener">lunar-javascript</a>（MIT License）· 纯本地静态页面，输入数据不出本机。</p>
  </footer>
</template>

<style scoped>
.hero,main,.foot{position:relative;z-index:1}

/* ============ 头部 ============ */
.hero{position:relative;padding:30px 20px 26px;text-align:center}
.bagua{
  position:absolute;left:50%;top:50%;width:330px;height:330px;
  transform:translate(-50%,-52%);
  color:var(--gold);opacity:.075;pointer-events:none;
  animation:spin 180s linear infinite;
}
@keyframes spin{from{transform:translate(-50%,-52%) rotate(0deg)}to{transform:translate(-50%,-52%) rotate(360deg)}}
.hero-inner{position:relative}
.seal{width:34px;height:34px;margin-bottom:10px;filter:drop-shadow(0 4px 12px var(--seal-shadow))}
h1{
  font-size:clamp(26px,4.5vw,34px);font-weight:600;letter-spacing:.35em;text-indent:.35em;line-height:1.3;
  background:var(--h1-grad);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  margin-bottom:8px;
}
.hero-sub{font-size:12px;color:var(--muted);letter-spacing:.42em;text-indent:.42em}

/* ============ 布局 ============ */
.wrap{max-width:1080px;margin:0 auto;padding:0 20px 44px;display:flex;flex-direction:column;gap:20px}
#results{animation:rise .4s ease both}
@keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}

/* ============ 空状态 ============ */
.empty-state{margin-top:0;text-align:center;padding:46px 22px;border-style:dashed}
.empty-glyph{font-size:38px;letter-spacing:.6em;text-indent:.6em;color:var(--empty-glyph);margin-bottom:14px}
.empty-state p{color:var(--muted);font-size:14px}
.empty-hint{margin-top:8px;font-size:12px;color:var(--faint)}

/* ============ 页脚 ============ */
.foot{text-align:center;padding:28px 20px 44px;color:var(--faint);font-size:11.5px;line-height:2.1}
.foot a{color:var(--gold);text-decoration:none;border-bottom:1px dotted var(--line-strong)}
.foot a:hover{color:var(--gold-strong)}

@media (max-width:820px){
  .bagua{width:250px;height:250px}
}
</style>

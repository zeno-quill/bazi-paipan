# 八字排盘 · 四柱推命（Vue 3 重构版）

> 从单文件 HTML 改造成的 **Vue 3 + Vite** 项目。保留了全部功能与视觉风格，组件化后更易维护、扩展和二次开发。

## 技术栈

- **Vue 3** (`<script setup>` Composition API)
- **Vite 6** — 极速构建与开发体验
- **lunar-javascript 1.7.7** (npm 包) — 干支、节气、大运流年等算法
- 纯前端静态页面，数据不出本机

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 开发模式
npm run dev

# 3. 构建（产物在 dist/，相对路径，可直接部署到任意静态目录）
npm run build

# 4. 算法核心自检（示例命例验证 + 边界用例）
npm run test:core
```

## 项目结构

```
bazi-paipan/
├── index.html                 # Vite 入口 HTML
├── index.standalone.html      # 原单文件版（保留可独立运行）
├── package.json
├── vite.config.js
├── src/
│   ├── main.js                # Vue 应用入口
│   ├── App.vue                # 根布局：星图背景 / Hero / 表单 / 结果区 / 页脚
│   ├── core/
│   │   └── bazi.js            # BaziCore 纯计算层：computeChart / shiShen / shiChenName（零 DOM 依赖，可单元测试）
│   ├── utils/
│   │   └── display.js         # 展示层工具：五行着色 class / 十神 tooltip / 动画偏好检测
│   ├── styles/
│   │   └── main.css           # 全局样式（原样保留原版的暗金主题、四柱卡片、五行条形图、大运流年等全部 CSS）
│   └── components/
│       ├── StarBackground.vue # 随机星图 SVG 背景
│       ├── BaziForm.vue       # 出生信息表单（公历 / 农历切换、年份钳制、示例载入）
│       ├── InfoStrip.vue      # 基本信息网格（公历、农历、生肖、节气等）
│       ├── PillarsPanel.vue   # 四柱命盘渲染（天干地支、藏干、十神、纳音、十二长生、旬空）
│       ├── WuxingPanel.vue    # 五行与日主（藏干双层统计、条形图、旺缺标记）
│       └── DayunPanel.vue     # 大运与流年（大运卡片选择、流年十神、当前年份高亮）
└── scripts/
    └── verify-core.mjs        # Node 端算法自检脚本
```

## 与原版对比

| 维度 | 原版（单文件 HTML） | Vue 版 |
|------|-------------------|--------|
| 架构 | 纯脚本 DOM 操作 | Vue 3 响应式组件 |
| 算法库 | **内联** 307KB 压缩脚本 | `lunar-javascript` **npm 包**（ESM/CJS 互操作） |
| 维护性 | 单文件所有逻辑挤在一起 | 计算 / 展示 / UI 三层分离 |
| 可测试性 | 难 | `npm run test:core` 14 项断言直接跑 |
| 可扩展性 | 需改 HTML 和 DOM 函数 | 新增组件插拔即可 |
| 打包产物 | — | `dist/` 可部署到任意 CDN / 服务器 |
| 样式 | 全部保留 | `main.css` 原样继承，无变化 |
| 交互行为 | 全部保留 | 表单双向绑定、动画平滑滚动、大运选中状态等 |

## 算法核心

- `computeChart(input)` 负责全部排盘计算（四柱、十神、藏干、五行统计、大运流年、节气等），零 DOM 依赖。
- `src/core/bazi.js` 可直接在 Node 中运行，用于单元测试和后续服务端扩展。

## 验证情况

- 算法核心通过 14 项 Node 端断言（`npm run test:core`）：
  - 已知公开命例四柱 / 十神 / 纳音 / 空亡 / 大运方向 / 起运天数核对通过
  - 农历闰月、节气交界、非法日期、时辰未知等边界用例通过
- Vite 生产构建无警告、无报错。

## 常见定制

| 想改什么 | 改哪里 |
| --- | --- |
| 配色（金 / 朱砂 / 五行色等） | `src/styles/main.css` 顶部 `:root` 中的 CSS 变量 |
| 标题、副标题、页脚文案 | `src/App.vue` 中 `<header class="hero">` 与 `<footer class="foot">` 文字 |
| 示例命例 | `src/components/BaziForm.vue` 中 `loadSample()` 方法 |
| 新增排盘信息（如神煞、胎息） | `src/core/bazi.js` 追加字段，组件中渲染 |
| 组件级样式覆盖 | 在对应 `.vue` 组件中加 `<style scoped>` |

## 注意事项

1. **lunar-javascript 为 CJS 压缩包**：本项目使用默认导入再解构的方式（`import LunarLib from 'lunar-javascript'`），避免 Vite 对 CJS 命名导出的静态分析失败。
2. **公历日期防溢出**：与原版一致，通过回读 `new Date()` 结果校验，拦截 2 月 30 日等非法输入。
3. **时辰未知**：选「未知时辰」时命盘按年、月、日三柱呈现，时柱标记 `unknown`，不参与五行统计。
4. **纯本地运行**：无任何网络请求，构建产物可直接在浏览器中打开（`file://` 兼容，因为 `vite.config.js` 中设置了 `base: './'`）。

## 免责声明

本工具仅用于传统历法与命理文化的学习交流，排盘结果不构成任何现实建议。

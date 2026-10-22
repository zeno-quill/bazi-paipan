import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 相对路径，打包产物可直接以 file:// 或任意静态目录部署
  base: './'
})

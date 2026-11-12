import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'

// 管理端 Vite 配置：dev 代理 /admin → 后端 8080，生产构建产物在 dist/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/admin': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 来单提醒 WebSocket（后端 @ServerEndpoint("/ws/{sid}")）
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})

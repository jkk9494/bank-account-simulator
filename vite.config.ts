import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/bank/', // Caddy 서브경로 라우팅 지원
  server: {
    port: 8083,
    host: true, // 외부 접속 허용 (0.0.0.0)
    allowedHosts: [
      'jkk9494.iptime.org',
      'fujika.store',
      '.iptime.org'
    ],
    hmr: {
      host: 'jkk9494.iptime.org',
      protocol: 'ws',
      port: 80,
    },
    strictPort: true,
    open: true,
  },
})

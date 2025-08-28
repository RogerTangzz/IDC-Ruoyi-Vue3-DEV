import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// 如需 JSX 支持可取消下一行注释
// import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())

  // 自定义代理示例（按需调整或删除）
  const proxy = {
    // '/dev-api': {
    //   target: env.VITE_APP_BASE_API || 'http://localhost:8080',
    //   changeOrigin: true,
    //   rewrite: p => p.replace(/^\/dev-api/, '')
    // }
  }

  return {
    plugins: [
      vue(),
      // vueJsx()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      },
      dedupe: ['vue']
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 自动注入全局样式（按需）
          // additionalData: `@use "@/styles/variables.scss" as *;`
        }
      }
    },
    build: {
      // 保留 UTF-8 编码 & 本地目标
      charset: 'utf8',
      target: 'es2015',
      // 合并：开发内联 sourcemap，生产关闭
      sourcemap: command === 'build' ? false : 'inline',
      outDir: 'dist',
      assetsDir: 'static',
      cssCodeSplit: true,
      emptyOutDir: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router'],
            vendor: ['axios']
          }
        }
      }
    },
    server: {
      // 合并：自定义响应头（保持 UTF-8）
      headers: {
        'Content-Type': 'text/html; charset=UTF-8'
      },
      port: 80,
      host: true,          // 0.0.0.0
      open: false,
      strictPort: false,
      proxy
    },
    preview: {
      port: 4173,
      host: true,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8'
      }
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'axios']
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV || mode)
    }
  }
})
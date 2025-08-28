// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// 如需 JSX 支持可取消下一行注释
// import vueJsx from '@vitejs/plugin-vue-jsx'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())

  // 自定义代理（按需开启）
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
      // vueJsx(),
      // SVG 雪碧图插件（配合 main.js 中的 `import 'virtual:svg-icons-register'`）
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        symbolId: 'icon-[dir]-[name]'
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
      dedupe: ['vue'],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 自动注入全局样式（按需启用）
          // additionalData: `@use "@/assets/styles/variables.scss" as *;`
        }
      }
    },
    build: {
      charset: 'utf8',
      target: 'es2015',
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
      port: 80,
      host: true,      // 0.0.0.0
      open: false,
      strictPort: false,
      proxy
    },
    preview: {
      port: 4173,
      host: true
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'axios']
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV || mode)
    }
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag: string) => tag === 'wc-mdit'
        }
      }
    }), 
    vueJsx()
  ],
  root: '.',
  publicDir: '../public',
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      
      // el-lowcode 相关包的别名
      'el-lowcode': path.resolve(__dirname, './packages/el-lowcode'),
      'el-form-render': path.resolve(__dirname, './packages/el-form-render'),
      '@el-lowcode/utils': path.resolve(__dirname, './packages/utils'),
      '@el-lowcode/render': path.resolve(__dirname, './packages/render'),
      
      // TipTap 相关包的别名
      '@tiptap-capsule': path.resolve(__dirname, './packages/tiptap-capsule/src'),
      '@tiptap-ext-table': path.resolve(__dirname, './packages/tiptap-ext-table/src'),
      '@tiptap-ext-vue-text-btn-demo': path.resolve(__dirname, './packages/tiptap-ext-vue-text-btn-demo/src'),
      '@tiptap-ext-code-block-enhanced': path.resolve(__dirname, './packages/tiptap-ext-code-block-enhanced/src'),
    }
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    target: 'es2022',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/sse': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true, // 启用WebSocket代理
      }
    },
    allowedHosts: [
      "example.com"
    ]
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['monaco-editor', 'highlight.js', '@tiptap/extension-bubble-menu', '@tiptap/vue-3']
  }
})

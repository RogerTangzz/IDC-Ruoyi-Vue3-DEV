// .clauderc.js
// IDC运维管理系统 AI助手配置文件

module.exports = {
  // 继承核心规范
  extends: './CLAUDE.md',
  
  // 加载业务扩展
  plugins: [
    './CLAUDE-IDC.md'
  ],
  
  // AI助手配置
  ai: {
    // 代码生成偏好
    preferences: {
      // 优先使用的编程模式
      patterns: [
        'composition-api',      // Vue 3 Composition API
        'async-await',         // 异步处理
        'optional-chaining',   // 可选链
        'nullish-coalescing'   // 空值合并
      ],
      
      // 组件风格
      componentStyle: 'script-setup', // <script setup>
      
      // 状态管理
      stateManagement: 'pinia',
      
      // 样式方案
      styling: 'scss-modules'
    },
    
    // 自动导入配置
    autoImports: {
      // Vue 3
      'vue': [
        'ref', 'reactive', 'computed', 'watch', 'watchEffect',
        'onMounted', 'onUnmounted', 'nextTick', 'provide', 'inject'
      ],
      // Vue Router
      'vue-router': [
        'useRoute', 'useRouter'
      ],
      // Pinia
      'pinia': [
        'defineStore', 'storeToRefs'
      ],
      // Element Plus
      'element-plus': [
        'ElMessage', 'ElMessageBox', 'ElNotification', 'ElLoading'
      ],
      // 项目工具
      '@/utils': [
        'request', 'auth', 'cache', 'validate'
      ],
      // 项目hooks
      '@/hooks': [
        'useDict', 'usePermission', 'usePagination'
      ]
    },
    
    // 代码生成配置
    generation: {
      // 文件头注释
      fileHeader: true,
      
      // 自动生成测试
      generateTests: true,
      
      // 模板变量
      variables: {
        author: 'IDC Team',
        company: 'Your Company',
        system: 'IDC运维管理系统'
      }
    },
    
    // 上下文感知
    context: {
      // 自动检测项目结构
      autoDetect: true,
      
      // 分析代码风格
      analyzeStyle: true,
      
      // 学习命名习惯
      learnNaming: true
    }
  },
  
  // 项目特定规则
  rules: {
    // 文件规范
    'max-file-length': 500,
    'max-function-length': 50,
    'max-component-complexity': 10,
    
    // 命名规范
    'component-name': 'PascalCase',
    'composable-name': 'use{Name}',
    'store-name': 'use{Module}Store',
    
    // 代码风格
    'prefer-composition-api': true,
    'prefer-script-setup': true,
    'prefer-typescript': false,
    
    // 安全规范
    'no-console-log': 'production',
    'no-debugger': 'production',
    'require-auth-check': true
  },
  
  // 脚手架配置
  scaffolding: {
    // 模板目录
    templates: './templates',
    
    // 输出目录
    output: {
      api: 'src/api',
      views: 'src/views',
      components: 'src/components',
      composables: 'src/hooks',
      stores: 'src/store/modules',
      tests: 'tests'
    },
    
    // 可用命令
    commands: {
      'module': '生成完整模块',
      'component': '生成组件',
      'api': '生成API',
      'store': '生成Store',
      'test': '生成测试'
    }
  },
  
  // 测试配置
  testing: {
    framework: 'vitest',
    coverage: {
      threshold: 80,
      exclude: ['*.config.js', 'tests/**']
    }
  },
  
  // 性能基准
  performance: {
    bundleSize: {
      js: 200,  // KB (gzip)
      css: 50   // KB (gzip)
    },
    metrics: {
      fcp: 1500,  // First Contentful Paint (ms)
      lcp: 2500,  // Largest Contentful Paint (ms)
      fid: 100,   // First Input Delay (ms)
      cls: 0.1    // Cumulative Layout Shift
    }
  }
};

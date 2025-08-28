# CLAUDE.md — 智能开发助手规范 v2.0（RuoYi‑Vue3 前端）

> **版本**: 2.0.0  
> **适用范围**: RuoYi-Vue3 (Vue 3 + Element Plus + Vite) 前端项目  
> **核心目标**: 提供精准的架构决策、高质量的代码生成、智能的开发辅助

---

## 0. 快速决策树

### 0.1 功能开发决策流
```
新功能需求 → 评估影响域
├── 纯展示功能 → views/ + api/
├── 复用组件 → components/ + 可能的 directive/
├── 全局状态 → store/modules/ + api/
├── 权限相关 → permission.js + router/ + views/
└── 工具函数 → utils/ + 单元测试
```

### 0.2 代码放置决策
```
代码类型判断：
├── HTTP请求 → MUST: src/api/{domain}/{module}.js
├── 页面组件 → src/views/{module}/{feature}/
├── 通用组件 → src/components/{category}/
├── 状态管理 → src/store/modules/{domain}.js
├── 工具函数 → src/utils/{category}.js
└── 静态资源 → src/assets/{type}/
```

---

## 1. 项目环境与依赖

### 1.1 环境要求（MUST）
```json
{
  "node": ">=20.19.0",
  "yarn": ">=1.22.0",
  "vite": "^6.0.0",
  "vue": "^3.5.0",
  "element-plus": "^2.9.0",
  "pinia": "^2.3.0"
}
```

### 1.2 环境变量规范
```bash
# .env.development
VITE_APP_TITLE=系统名称
VITE_APP_ENV=development
VITE_APP_BASE_API=/dev-api
VITE_BUILD_COMPRESS=none

# .env.production  
VITE_APP_TITLE=系统名称
VITE_APP_ENV=production
VITE_APP_BASE_API=https://api.domain.com
VITE_BUILD_COMPRESS=gzip
```

---

## 2. 目录结构与职责边界

### 2.1 标准目录结构（MUST）
```
src/
├── api/              # HTTP接口层 - 所有后端交互
│   ├── system/       # 系统管理接口
│   ├── monitor/      # 监控接口
│   └── {domain}/     # 业务域接口
├── assets/           # 静态资源
│   ├── styles/       # 全局样式
│   ├── icons/        # SVG图标
│   └── images/       # 图片资源
├── components/       # 通用组件
│   ├── Editor/       # 富文本编辑器
│   ├── FileUpload/   # 文件上传
│   └── {Component}/  # 其他通用组件
├── directive/        # 自定义指令
│   ├── permission.js # 权限指令
│   └── {directive}.js
├── layout/           # 布局组件
│   ├── index.vue
│   └── components/
├── router/           # 路由配置
│   └── index.js
├── store/            # Pinia状态管理
│   ├── index.js
│   └── modules/
│       ├── user.js   # 用户/会话
│       ├── app.js    # 应用配置
│       └── permission.js # 权限
├── utils/            # 工具函数
│   ├── request.js    # axios封装
│   ├── auth.js       # token管理
│   ├── cache.js      # 缓存管理
│   └── validate.js   # 验证函数
├── views/            # 页面组件
│   └── {module}/
│       └── {page}/
├── permission.js     # 全局路由守卫
└── main.js          # 应用入口
```

### 2.2 文件命名规范（MUST）
```javascript
// 组件文件：PascalCase
UserProfile.vue
DataTable.vue

// JS模块：camelCase  
userApi.js
dateUtils.js

// 样式文件：kebab-case
user-profile.scss
data-table.css

// 常量文件：kebab-case
error-codes.js
system-config.js
```

---

## 3. 代码生成模板库

### 3.1 API模块模板
```javascript
// src/api/{domain}/{module}.js
import request from '@/utils/request'

// 基础CRUD模板
export const {module}Api = {
  // 分页查询
  page(params) {
    return request({
      url: '/{domain}/{module}/page',
      method: 'get',
      params: {
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 10,
        ...params
      }
    })
  },

  // 获取详情
  get(id) {
    return request({
      url: `/{domain}/{module}/${id}`,
      method: 'get'
    })
  },

  // 新增
  create(data) {
    return request({
      url: '/{domain}/{module}',
      method: 'post',
      data
    })
  },

  // 更新
  update(id, data) {
    return request({
      url: `/{domain}/{module}/${id}`,
      method: 'put',
      data
    })
  },

  // 删除
  delete(id) {
    return request({
      url: `/{domain}/{module}/${id}`,
      method: 'delete'
    })
  },

  // 批量删除
  batchDelete(ids) {
    return request({
      url: '/{domain}/{module}/batch',
      method: 'delete',
      data: ids
    })
  },

  // 导出
  export(params) {
    return request({
      url: '/{domain}/{module}/export',
      method: 'get',
      params,
      responseType: 'blob'
    })
  }
}
```

### 3.2 列表页面模板
```vue
<template>
  <div class="{module}-list">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['{module}:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['{module}:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['{module}:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table 
      v-loading="loading" 
      :data="dataList" 
      @selection-change="handleSelectionChange"
      :default-sort="{ prop: 'createTime', order: 'descending' }"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="55" align="center" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['{module}:edit']"
          >修改</el-button>
          <el-button
            link
            type="danger"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['{module}:delete']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { {module}Api } from '@/api/{domain}/{module}'

// 状态定义
const loading = ref(false)
const dataList = ref([])
const total = ref(0)
const open = ref(false)
const title = ref('')
const multiple = ref(true)
const ids = ref([])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: undefined
})

// 表单数据
const form = ref({})
const rules = {
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
}

// 表单ref
const queryRef = ref()
const formRef = ref()

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res = await {module}Api.page(queryParams)
    dataList.value = res.rows
    total.value = res.total
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryRef.value?.resetFields()
  handleQuery()
}

// 多选
const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.id)
  multiple.value = !selection.length
}

// 新增
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加{moduleName}'
}

// 修改
const handleUpdate = async (row) => {
  reset()
  const id = row.id || ids.value[0]
  const res = await {module}Api.get(id)
  form.value = res.data
  open.value = true
  title.value = '修改{moduleName}'
}

// 删除
const handleDelete = async (row) => {
  const deleteIds = row.id || ids.value
  await ElMessageBox.confirm('是否确认删除选中的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  await {module}Api.batchDelete(Array.isArray(deleteIds) ? deleteIds : [deleteIds])
  ElMessage.success('删除成功')
  getList()
}

// 导出
const handleExport = async () => {
  await ElMessageBox.confirm('是否确认导出所有数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  const res = await {module}Api.export(queryParams)
  // 处理文件下载
  const blob = new Blob([res])
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = `{module}_${new Date().getTime()}.xlsx`
  link.click()
}

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()
  
  if (form.value.id) {
    await {module}Api.update(form.value.id, form.value)
    ElMessage.success('修改成功')
  } else {
    await {module}Api.create(form.value)
    ElMessage.success('新增成功')
  }
  
  open.value = false
  getList()
}

// 取消
const cancel = () => {
  open.value = false
  reset()
}

// 重置表单
const reset = () => {
  form.value = {
    id: undefined,
    name: undefined
  }
  formRef.value?.resetFields()
}

// 初始化
onMounted(() => {
  getList()
})
</script>
```

### 3.3 Store模块模板
```javascript
// src/store/modules/{module}.js
import { defineStore } from 'pinia'
import { {module}Api } from '@/api/{domain}/{module}'

export const use{Module}Store = defineStore('{module}', {
  state: () => ({
    // 列表数据
    list: [],
    // 当前选中
    current: null,
    // 加载状态
    loading: false,
    // 总数
    total: 0,
    // 查询参数
    queryParams: {
      pageNum: 1,
      pageSize: 10
    }
  }),

  getters: {
    // 获取当前项
    currentItem: (state) => state.current,
    
    // 是否有数据
    hasData: (state) => state.list.length > 0,
    
    // 根据ID获取项
    getItemById: (state) => (id) => {
      return state.list.find(item => item.id === id)
    }
  },

  actions: {
    // 获取列表
    async fetchList(params = {}) {
      this.loading = true
      try {
        const mergedParams = { ...this.queryParams, ...params }
        const res = await {module}Api.page(mergedParams)
        this.list = res.rows
        this.total = res.total
        this.queryParams = mergedParams
        return res
      } catch (error) {
        console.error('获取列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取详情
    async fetchDetail(id) {
      try {
        const res = await {module}Api.get(id)
        this.current = res.data
        return res.data
      } catch (error) {
        console.error('获取详情失败:', error)
        throw error
      }
    },

    // 创建
    async create(data) {
      try {
        const res = await {module}Api.create(data)
        // 刷新列表
        await this.fetchList()
        return res
      } catch (error) {
        console.error('创建失败:', error)
        throw error
      }
    },

    // 更新
    async update(id, data) {
      try {
        const res = await {module}Api.update(id, data)
        // 更新本地数据
        const index = this.list.findIndex(item => item.id === id)
        if (index !== -1) {
          this.list[index] = { ...this.list[index], ...data }
        }
        if (this.current?.id === id) {
          this.current = { ...this.current, ...data }
        }
        return res
      } catch (error) {
        console.error('更新失败:', error)
        throw error
      }
    },

    // 删除
    async delete(id) {
      try {
        await {module}Api.delete(id)
        // 从列表中移除
        this.list = this.list.filter(item => item.id !== id)
        if (this.current?.id === id) {
          this.current = null
        }
        this.total--
      } catch (error) {
        console.error('删除失败:', error)
        throw error
      }
    },

    // 重置状态
    reset() {
      this.list = []
      this.current = null
      this.loading = false
      this.total = 0
      this.queryParams = {
        pageNum: 1,
        pageSize: 10
      }
    }
  }
})
```

---

## 4. 架构决策指南

### 4.1 状态管理决策树
```javascript
// 决策：数据应该放在哪里？
const stateDecisionTree = {
  '数据是否跨组件共享？': {
    是: {
      '是否涉及用户会话？': {
        是: 'store/modules/user.js',
        否: {
          '是否是全局配置？': {
            是: 'store/modules/app.js',
            否: '创建新的store模块'
          }
        }
      }
    },
    否: {
      '是否需要持久化？': {
        是: 'localStorage/sessionStorage + 组件state',
        否: '组件内部state'
      }
    }
  }
}
```

### 4.2 组件设计决策
```javascript
// 决策：如何拆分组件？
const componentDecisionTree = {
  '功能是否可复用？': {
    是: {
      '是否依赞特定业务？': {
        是: 'views/{module}/components/',
        否: 'components/'
      }
    },
    否: {
      '代码量是否超过300行？': {
        是: '拆分为容器组件 + 展示组件',
        否: '保持单文件组件'
      }
    }
  }
}
```

### 4.3 接口设计规范
```javascript
// RESTful接口命名规范
const apiDesignRules = {
  // 资源路径
  collection: '/{domain}/{resource}',        // GET(列表) POST(创建)
  item: '/{domain}/{resource}/{id}',         // GET(详情) PUT(更新) DELETE(删除)
  
  // 特殊操作
  action: '/{domain}/{resource}/{id}/{action}', // POST
  batch: '/{domain}/{resource}/batch',          // POST/DELETE
  
  // 查询参数规范
  pagination: {
    pageNum: 'number',    // 页码，从1开始
    pageSize: 'number',   // 每页条数
    sortField: 'string',  // 排序字段
    sortOrder: 'string'   // 排序方向：asc/desc
  }
}
```

---

## 5. 错误处理与异常管理

### 5.1 统一错误处理
```javascript
// src/utils/errorHandler.js
export const errorHandler = {
  // 网络错误
  network: (error) => {
    if (error.message.includes('Network Error')) {
      ElMessage.error('网络连接失败，请检查网络设置')
      return
    }
    if (error.message.includes('timeout')) {
      ElMessage.error('请求超时，请稍后重试')
      return
    }
  },

  // 业务错误
  business: (code, message) => {
    const codeMessages = {
      401: '认证失败，请重新登录',
      403: '没有权限访问该资源',
      404: '请求的资源不存在',
      500: '服务器错误，请联系管理员'
    }
    ElMessage.error(codeMessages[code] || message || '操作失败')
  },

  // 表单验证错误
  validation: (errors) => {
    const firstError = Object.values(errors)[0]
    if (Array.isArray(firstError)) {
      ElMessage.warning(firstError[0])
    } else {
      ElMessage.warning(firstError)
    }
  }
}
```

### 5.2 异步操作封装
```javascript
// src/utils/asyncHandler.js
export async function handleAsync(asyncFunc, options = {}) {
  const {
    loading = true,
    successMsg = '操作成功',
    errorMsg = '操作失败',
    onSuccess,
    onError,
    finallyCallback
  } = options

  let loadingInstance = null
  
  try {
    if (loading) {
      loadingInstance = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }

    const result = await asyncFunc()
    
    if (successMsg) {
      ElMessage.success(successMsg)
    }
    
    onSuccess?.(result)
    return result
  } catch (error) {
    console.error(errorMsg, error)
    ElMessage.error(errorMsg)
    onError?.(error)
    throw error
  } finally {
    loadingInstance?.close()
    finallyCallback?.()
  }
}

// 使用示例
await handleAsync(
  () => userApi.update(id, formData),
  {
    successMsg: '更新成功',
    onSuccess: () => router.push('/user/list')
  }
)
```

---

## 6. 性能优化规范

### 6.1 路由懒加载模板
```javascript
// router/index.js
const routes = [
  {
    path: '/{module}',
    component: Layout,
    redirect: '/{module}/list',
    meta: { title: '{moduleName}管理', icon: 'component' },
    children: [
      {
        path: 'list',
        name: '{Module}List',
        component: () => import('@/views/{module}/list'),
        meta: { title: '{moduleName}列表', perms: ['{module}:list'] }
      },
      {
        path: 'detail/:id',
        name: '{Module}Detail',
        component: () => import('@/views/{module}/detail'),
        meta: { title: '{moduleName}详情', perms: ['{module}:view'] },
        hidden: true
      }
    ]
  }
]
```

### 6.2 组件性能优化
```vue
<script setup>
import { ref, computed, shallowRef, watchEffect } from 'vue'

// 使用shallowRef处理大型对象
const largeData = shallowRef([])

// 使用computed缓存计算结果
const processedData = computed(() => {
  return largeData.value
    .filter(item => item.active)
    .map(item => ({
      ...item,
      displayName: `${item.firstName} ${item.lastName}`
    }))
})

// 防抖处理
import { debounce } from 'lodash-es'
const handleSearch = debounce((keyword) => {
  // 搜索逻辑
}, 300)

// 虚拟滚动（大列表）
import { VirtualList } from '@tanstack/vue-virtual'
</script>
```

### 6.3 打包优化配置
```javascript
// vite.config.js
export default {
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vendor': ['vue', 'vue-router', 'pinia'],
          'utils': ['lodash-es', 'axios', 'dayjs']
        }
      }
    },
    // 压缩
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['element-plus/es', '@element-plus/icons-vue']
  }
}
```

---

## 7. 安全规范增强

### 7.1 输入验证模板
```javascript
// src/utils/validate.js
export const validators = {
  // 手机号验证
  phone: (rule, value, callback) => {
    const pattern = /^1[3-9]\d{9}$/
    if (!value) {
      callback(new Error('请输入手机号'))
    } else if (!pattern.test(value)) {
      callback(new Error('请输入正确的手机号'))
    } else {
      callback()
    }
  },

  // 邮箱验证
  email: (rule, value, callback) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (value && !pattern.test(value)) {
      callback(new Error('请输入正确的邮箱地址'))
    } else {
      callback()
    }
  },

  // 身份证验证（脱敏显示）
  idCard: (rule, value, callback) => {
    const pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (!pattern.test(value)) {
      callback(new Error('请输入正确的身份证号'))
    } else {
      callback()
    }
  },

  // SQL注入检测
  noSqlInjection: (rule, value, callback) => {
    const dangerous = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|EXEC|UNION|WHERE|ORDER BY|GROUP BY)\b)/i
    if (dangerous.test(value)) {
      callback(new Error('输入包含非法字符'))
    } else {
      callback()
    }
  },

  // XSS检测
  noXss: (rule, value, callback) => {
    const xssPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
    if (xssPattern.test(value)) {
      callback(new Error('输入包含非法脚本'))
    } else {
      callback()
    }
  }
}
```

### 7.2 敏感数据处理
```javascript
// src/utils/security.js
export const security = {
  // 手机号脱敏
  maskPhone: (phone) => {
    if (!phone) return ''
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  },

  // 身份证脱敏
  maskIdCard: (idCard) => {
    if (!idCard) return ''
    return idCard.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2')
  },

  // 银行卡脱敏
  maskBankCard: (card) => {
    if (!card) return ''
    return card.replace(/(\d{4})\d+(\d{4})/, '$1 **** **** $2')
  },

  // 姓名脱敏
  maskName: (name) => {
    if (!name) return ''
    if (name.length === 2) {
      return name[0] + '*'
    }
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
  }
}
```

---

## 8. 测试规范

### 8.1 单元测试模板
```javascript
// tests/unit/{module}.spec.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Component from '@/views/{module}/component.vue'

describe('{Module} Component', () => {
  let wrapper
  
  beforeEach(() => {
    wrapper = mount(Component, {
      props: {
        // 默认props
      },
      global: {
        stubs: {
          // 存根组件
        }
      }
    })
  })

  // 渲染测试
  it('should render correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.{module}-component').exists()).toBe(true)
  })

  // 交互测试
  it('should handle click event', async () => {
    const button = wrapper.find('.submit-btn')
    await button.trigger('click')
    expect(wrapper.emitted('submit')).toBeTruthy()
  })

  // 异步测试
  it('should load data on mount', async () => {
    const mockApi = vi.fn().mockResolvedValue({ data: [] })
    // 测试异步加载
  })
})
```

### 8.2 测试用例清单
```javascript
// 每个功能模块应包含的测试点
export const testChecklist = {
  页面组件: [
    '组件渲染正确',
    '数据加载成功',
    '错误状态处理',
    '用户交互响应',
    '权限控制生效'
  ],
  
  API接口: [
    '正常请求返回',
    '参数验证',
    '错误码处理',
    '超时处理',
    'Token刷新'
  ],
  
  Store状态: [
    '状态初始化',
    'Action执行',
    'Getter计算',
    '状态持久化',
    '状态重置'
  ]
}
```

---

## 9. AI助手工作流程（增强版）

### 9.1 需求分析阶段
```markdown
# 需求分析模板
## 1. 功能描述
- 核心功能：
- 用户角色：
- 使用场景：

## 2. 技术评估
- 影响模块：[] api [] views [] store [] router [] permission
- 新增依赖：
- 性能影响：
- 安全风险：

## 3. 实现方案
- 方案A：[描述] 优点/缺点
- 方案B：[描述] 优点/缺点
- 推荐方案：[选择] 理由：
```

### 9.2 代码生成决策
```javascript
// AI应遵循的代码生成决策流程
const codeGenerationFlow = {
  step1: '确定功能类型',
  step2: '选择合适的模板',
  step3: '替换模板变量',
  step4: '添加业务逻辑',
  step5: '补充错误处理',
  step6: '添加权限控制',
  step7: '优化性能',
  step8: '生成测试用例'
}
```

### 9.3 最小变更原则
```javascript
// 变更影响评估
const changeImpactAssessment = {
  // 低影响：仅修改单个文件
  low: {
    files: 1,
    modules: ['views'],
    needReview: false
  },
  
  // 中影响：修改多个相关文件
  medium: {
    files: '2-5',
    modules: ['views', 'api', 'store'],
    needReview: true
  },
  
  // 高影响：涉及核心模块
  high: {
    files: '>5',
    modules: ['router', 'permission', 'utils/request'],
    needReview: true,
    needTest: true
  }
}
```

### 9.4 回滚方案模板
```bash
# 回滚方案
## 文件级回滚
git checkout HEAD -- src/views/{module}/
git checkout HEAD -- src/api/{module}.js

## 提交级回滚
git revert {commit-hash}

## 依赖回滚
yarn install --frozen-lockfile

## 数据回滚
# 如涉及localStorage/sessionStorage
localStorage.removeItem('{key}')
```

---

## 10. 项目扩展机制

### 10.1 扩展文档规范
```markdown
# CLAUDE-{PROJECT}.md - 项目扩展规范

## 1. 项目特定配置
- 业务域划分
- 特殊依赖说明
- 环境变量扩展

## 2. 业务规则映射
- 业务流程 → 代码实现
- 权限矩阵 → 路由配置
- 状态机 → Store设计

## 3. 项目特定模板
- 自定义组件模板
- 业务API模板
- 特殊页面模板
```

### 10.2 扩展引用方式
```javascript
// 在具体项目中引用扩展
// .clauderc.js
export default {
  extends: './CLAUDE.md',
  plugins: [
    './CLAUDE-PROJECT.md',
    './CLAUDE-BUSINESS.md'
  ],
  rules: {
    // 项目特定规则覆盖
  }
}
```

---

## 11. 常见问题与最佳实践

### 11.1 代码组织最佳实践
```javascript
// ❌ 错误：在组件中直接调用API
const data = await axios.get('/api/users')

// ✅ 正确：通过API层调用
import { userApi } from '@/api/system/user'
const data = await userApi.list()

// ❌ 错误：在多个地方维护相同状态
const userInfo = ref({}) // 组件A
const userInfo = ref({}) // 组件B

// ✅ 正确：使用统一的Store
import { useUserStore } from '@/store/modules/user'
const userStore = useUserStore()
```

### 11.2 性能优化最佳实践
```javascript
// ✅ 使用函数式组件
const MyComponent = memo(() => { })

// ✅ 合理使用v-show vs v-if
// v-show: 频繁切换
// v-if: 条件很少改变

// ✅ 使用虚拟滚动处理长列表
import VirtualList from '@tanstack/vue-virtual'

// ✅ 图片懒加载
<img v-lazy="imageSrc" />
```

### 11.3 安全最佳实践
```javascript
// ✅ 永远不信任前端数据
// 后端必须二次验证

// ✅ 敏感操作需要二次确认
await ElMessageBox.confirm('确定删除？')

// ✅ 防止XSS
<div v-html="sanitizeHtml(content)" />

// ✅ 防止CSRF
axios.defaults.headers['X-CSRF-Token'] = token
```

---

## 12. 附录

### 12.1 Git提交规范
```bash
# 格式：<type>(<scope>): <subject>
feat(user): 添加用户导入功能
fix(auth): 修复token刷新异常
perf(table): 优化大数据表格渲染
refactor(api): 重构API层结构
style(button): 调整按钮样式
docs(readme): 更新部署文档
test(user): 添加用户模块单元测试
chore(deps): 升级依赖版本
```

### 12.2 代码审查清单
```markdown
- [ ] 符合编码规范
- [ ] 没有硬编码的URL
- [ ] 有适当的错误处理
- [ ] 有必要的注释
- [ ] 没有console.log
- [ ] 敏感数据已脱敏
- [ ] 权限控制已添加
- [ ] 性能可接受
- [ ] 可以正常构建
- [ ] 测试用例通过
```

### 12.3 性能基准
```yaml
首屏加载:
  - JS Bundle: < 200KB (gzip)
  - CSS Bundle: < 50KB (gzip)
  - 首次渲染: < 1.5s
  
运行时性能:
  - 列表渲染: < 16ms/frame
  - 路由切换: < 200ms
  - API响应: < 800ms
  - 用户交互: < 100ms
```

---

## 更新日志

### v2.0.0 (2024-01)
- 新增：智能决策树系统
- 新增：完整代码模板库
- 新增：架构决策指南
- 新增：增强的错误处理
- 新增：安全规范增强
- 新增：测试规范模板
- 新增：AI助手工作流程
- 优化：目录结构说明
- 优化：性能优化指南

### v1.0.0 (2023-12)
- 初始版本发布

---

> **注意**: 本文档为核心技术规范，具体业务实现请参考项目扩展文档。  
> **维护**: 如需修改本规范，请提交PR并说明变更原因与影响范围。
import { createApp } from 'vue'
import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import locale from 'element-plus/es/locale/lang/zh-cn'

import '@/assets/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive

// 注册指令
import plugins from './plugins' // plugins
import { download } from '@/utils/request'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission' // permission control

import { useDict } from '@/utils/dict'
import { getConfigKey } from "@/api/system/config"
import { parseTime, resetForm, addDateRange, handleTree, selectDictLabel, selectDictLabels } from '@/utils/ruoyi'

// 分页组件
import Pagination from '@/components/Pagination'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar'
// 富文本组件
import Editor from "@/components/Editor"
// 文件上传组件
import FileUpload from "@/components/FileUpload"
// 图片上传组件
import ImageUpload from "@/components/ImageUpload"
// 图片预览组件
import ImagePreview from "@/components/ImagePreview"
// 字典标签组件
import DictTag from '@/components/DictTag'

// 导入后台服务
import ticketEscalationService from '@/services/ticket-escalation'
import inspectionReminderService from '@/services/inspection-reminder'

const app = createApp(App)

// 全局方法挂载
app.config.globalProperties.useDict = useDict
app.config.globalProperties.download = download
app.config.globalProperties.parseTime = parseTime
app.config.globalProperties.resetForm = resetForm
app.config.globalProperties.handleTree = handleTree
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.getConfigKey = getConfigKey
app.config.globalProperties.selectDictLabel = selectDictLabel
app.config.globalProperties.selectDictLabels = selectDictLabels

// 全局组件挂载
app.component('DictTag', DictTag)
app.component('Pagination', Pagination)
app.component('FileUpload', FileUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)
app.component('RightToolbar', RightToolbar)
app.component('Editor', Editor)

app.use(router)
app.use(store)
app.use(plugins)
app.use(elementIcons)
app.component('svg-icon', SvgIcon)

directive(app)

// 使用element-plus 并且设置全局的大小
app.use(ElementPlus, {
  locale: locale,
  // 支持 large、default、small
  size: Cookies.get('size') || 'default'
})

app.mount('#app')

// ==================== 启动后台服务 ====================

// 后台服务启动函数
const startBackgroundServices = () => {
  try {
    // 1. 工单自动升级服务
    ticketEscalationService.start()
    console.log('✅ 工单自动升级服务已启动')
    
    // 2. 巡检提醒服务
    inspectionReminderService.start()
    console.log('✅ 巡检提醒服务已启动')
    
    // 可以添加更多服务...
    
  } catch (error) {
    console.error('❌ 后台服务启动失败:', error)
  }
}

// 停止后台服务函数（用于清理）
const stopBackgroundServices = () => {
  try {
    ticketEscalationService.stop()
    inspectionReminderService.stop()
    console.log('✅ 后台服务已停止')
  } catch (error) {
    console.error('❌ 后台服务停止失败:', error)
  }
}

// 根据环境决定是否启动服务
if (import.meta.env.PROD) {
  // 生产环境自动启动
  startBackgroundServices()
  
  // 页面卸载时清理服务
  window.addEventListener('beforeunload', () => {
    stopBackgroundServices()
  })
} else if (import.meta.env.DEV) {
  // 开发环境提供手动控制
  console.log('📌 开发环境：后台服务未自动启动')
  console.log('   可在控制台手动启动: window.startServices()')
  console.log('   可在控制台手动停止: window.stopServices()')
  
  // 挂载到window对象，方便调试
  window.startServices = startBackgroundServices
  window.stopServices = stopBackgroundServices
  window.services = {
    ticket: ticketEscalationService,
    inspection: inspectionReminderService
  }
  
  // 开发环境如果需要自动启动，取消下面的注释
  // startBackgroundServices()
}

// ==================== 全局错误处理 ====================

// Vue错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err, info)
  // 这里可以接入错误监控服务
}

// Promise错误处理
window.addEventListener('unhandledrejection', event => {
  console.error('Promise Rejection:', event.reason)
  // 这里可以接入错误监控服务
})

// ==================== 性能监控（可选） ====================

if (import.meta.env.PROD) {
  // 监控页面性能
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0]
      console.log('页面加载性能:', {
        domReady: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart
      })
    }, 0)
  })
}
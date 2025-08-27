# CLAUDE-IDC.md — IDC运维管理系统开发扩展规范 v1.0

> **版本**: 1.0.0  
> **基础规范**: CLAUDE.md v2.0  
> **适用项目**: IDC运维管理系统  
> **核心目标**: 将业务逻辑精准映射到技术实现，提供领域特定的开发指导

---

## 0. 快速导航与决策树

### 0.1 模块开发优先级
```
核心模块（P0）
├── 用户认证 (auth)
├── 工单管理 (ticket)
└── 巡检管理 (inspection)

重要模块（P1）
├── 维保计划 (maintenance)
├── 资产管理 (asset)
└── 审批中心 (approval)

支撑模块（P2）
├── 知识库 (knowledge)
├── 通知中心 (notification)
├── 报表统计 (report)
└── 操作日志 (log)
```

### 0.2 业务功能映射表
| 业务模块 | 前端路由 | API前缀 | 状态模块 | 权限标识前缀 |
|---------|---------|---------|---------|-------------|
| 用户认证 | /login, /register | /auth | user | - |
| 维保计划 | /maintenance | /maintenance | maintenance | maintenance: |
| 故障工单 | /ticket | /ticket | ticket | ticket: |
| 巡检管理 | /inspection | /inspection | inspection | inspection: |
| 资产管理 | /asset | /asset | asset | asset: |
| 知识库 | /knowledge | /knowledge | knowledge | knowledge: |
| 审批中心 | /approval | /approval | approval | approval: |
| 通知中心 | /notification | /notification | - | notification: |
| 报表统计 | /report | /report | - | report: |
| 操作日志 | /log | /system/log | - | log: |

---

## 1. 业务领域模型定义

### 1.1 核心实体关系
```javascript
// 实体关系图
const entityRelations = {
  User: {
    hasMany: ['Ticket', 'Inspection', 'MaintenancePlan', 'Asset'],
    belongsTo: ['Role']
  },
  Ticket: {
    belongsTo: ['User', 'Asset'],
    hasMany: ['TicketLog', 'Attachment'],
    hasOne: ['TicketTemplate']
  },
  MaintenancePlan: {
    belongsTo: ['User'],
    hasMany: ['MaintenanceExecution', 'Notification'],
    hasOne: ['Floor', 'MOPCategory']
  },
  Inspection: {
    belongsTo: ['User', 'InspectionPlan'],
    hasMany: ['InspectionItem', 'Ticket'], // 异常自动生成工单
    hasOne: ['Floor']
  },
  Asset: {
    belongsTo: ['AssetCategory', 'Location'],
    hasMany: ['Ticket', 'AssetBorrow']
  }
}
```

### 1.2 状态机定义
```javascript
// 工单状态流转
export const TICKET_STATUS = {
  PENDING: 'pending',      // 待处理
  ASSIGNED: 'assigned',    // 已指派
  PROCESSING: 'processing', // 处理中
  COMPLETED: 'completed',  // 已完成
  CLOSED: 'closed'        // 已关闭
}

export const ticketStateMachine = {
  [TICKET_STATUS.PENDING]: ['assigned', 'processing'],
  [TICKET_STATUS.ASSIGNED]: ['processing', 'pending'],
  [TICKET_STATUS.PROCESSING]: ['completed', 'pending'],
  [TICKET_STATUS.COMPLETED]: ['closed', 'processing'],
  [TICKET_STATUS.CLOSED]: [] // 终态
}

// 维保计划审核状态
export const MAINTENANCE_APPROVAL = {
  DRAFT: 'draft',           // 草稿
  PENDING: 'pending',       // 待审核
  APPROVED: 'approved',     // 已批准
  REJECTED: 'rejected',     // 已拒绝
  EXECUTING: 'executing',   // 执行中
  COMPLETED: 'completed'    // 已完成
}
```

### 1.3 角色权限矩阵
```javascript
export const rolePermissions = {
  admin: {
    maintenance: ['create', 'read', 'update', 'delete', 'approve'],
    ticket: ['create', 'read', 'update', 'delete', 'assign'],
    inspection: ['create', 'read', 'update', 'delete'],
    asset: ['create', 'read', 'update', 'delete'],
    knowledge: ['create', 'read', 'update', 'delete'],
    approval: ['read', 'approve', 'reject'],
    user: ['create', 'read', 'update', 'delete', 'resetPassword'],
    system: ['settings', 'log', 'backup']
  },
  engineer: {
    maintenance: ['read', 'execute'],
    ticket: ['create', 'read', 'update', 'process'],
    inspection: ['create', 'read', 'update'],
    asset: ['read', 'borrow', 'return'],
    knowledge: ['read'],
    approval: ['apply']
  },
  inspector: {
    maintenance: ['read'],
    ticket: ['create', 'read'],
    inspection: ['create', 'read', 'update'],
    asset: ['read', 'borrow', 'return'],
    knowledge: ['read'],
    approval: ['apply']
  }
}
```

---

## 2. 模块开发规范

### 2.1 维保计划模块
```javascript
// src/api/maintenance/plan.js
export const maintenancePlanApi = {
  // 分页查询（含筛选）
  page(params) {
    return request({
      url: '/maintenance/plan/page',
      method: 'get',
      params: {
        pageNum: params.pageNum,
        pageSize: params.pageSize,
        floor: params.floor,           // 楼层筛选
        mopCategory: params.mopCategory, // MOP类别
        approvalStatus: params.approvalStatus, // 审核状态
        executionStatus: params.executionStatus // 执行状态
      }
    })
  },
  
  // 复制上次计划
  copyLast(id) {
    return request({
      url: `/maintenance/plan/${id}/copy`,
      method: 'post'
    })
  },
  
  // 提交审核
  submitApproval(id, approverId) {
    return request({
      url: `/maintenance/plan/${id}/submit`,
      method: 'post',
      data: { approverId }
    })
  },
  
  // 生成工单
  generateTicket(id) {
    return request({
      url: `/maintenance/plan/${id}/generate-ticket`,
      method: 'post'
    })
  }
}

// 数据结构定义
export interface MaintenancePlan {
  id: number
  title: string                    // 标题
  floor: string                     // 楼层编号：1楼|2楼|3楼|4楼|全部楼层
  version: string                   // 版本号
  mopCategory: MOPCategory          // MOP类别
  executionCycle: ExecutionCycle    // 执行周期
  approverId: number                // 审核人ID
  mopName: string                   // MOP名称
  mopPurpose: string                // MOP目的
  notifyUsers: number[]             // 通知人员ID列表
  tools: string                     // 工具仪表
  materials: string                 // 材料
  safety: string                    // 安全PPE
  specialTools: string              // 特殊工具
  steps: string                     // 步骤内容（富文本）
  inspectionResult: string          // 巡检结果
  remark: string                    // 备注
  executorId: number                // 执行审核人ID
  approvalStatus: string            // 审核状态
  executionStatus: string           // 执行状态
  nextExecutionTime: Date           // 下次执行时间
  createTime: Date
  updateTime: Date
}
```

### 2.2 故障工单模块
```javascript
// src/api/ticket/index.js
export const ticketApi = {
  // 创建工单（支持模板）
  create(data) {
    return request({
      url: '/ticket',
      method: 'post',
      data: {
        ...data,
        templateId: data.templateId, // 可选：使用模板
        priority: data.priority || 'medium',
        attachments: data.attachments || []
      }
    })
  },
  
  // 批量指派
  batchAssign(ticketIds, userId) {
    return request({
      url: '/ticket/batch-assign',
      method: 'post',
      data: { ticketIds, userId }
    })
  },
  
  // 状态流转
  changeStatus(id, status, comment) {
    return request({
      url: `/ticket/${id}/status`,
      method: 'put',
      data: { status, comment }
    })
  },
  
  // 获取超时工单
  getOverdue() {
    return request({
      url: '/ticket/overdue',
      method: 'get'
    })
  }
}

// 工单优先级与时限映射
export const TICKET_PRIORITY = {
  HIGH: { value: 'high', label: '高', limit: 4, unit: 'hour', color: 'danger' },
  MEDIUM: { value: 'medium', label: '中', limit: 8, unit: 'hour', color: 'warning' },
  LOW: { value: 'low', label: '低', limit: 24, unit: 'hour', color: 'info' }
}

// 工单自动升级规则
export const autoEscalationRules = {
  low: { after: 24, to: 'medium' },
  medium: { after: 8, to: 'high' },
  high: { after: 4, to: 'critical' } // 严重超时
}
```

### 2.3 巡检管理模块
```javascript
// src/views/inspection/constants.js
// 巡检项目配置（按楼层）
export const INSPECTION_ITEMS = {
  floor1: [
    { id: 'oil_tank', label: '地埋油罐及蓄冷罐是否正常', type: 'boolean' },
    { id: 'electric_room', label: '南侧电气间环境设施是否正常', type: 'boolean' },
    { id: 'water_pump', label: '高压细水泵房环境及设施是否正常', type: 'boolean' },
    { id: 'oil_machine', label: '高压油机室是否漏水漏油环境是否正常', type: 'boolean' },
    { id: 'oil_gas', label: '油箱间最高柴油气体浓度', type: 'number', unit: 'ppm' },
    // ... 共22项
  ],
  floor2: [
    // ... 18项
  ],
  floor3: [
    // ... 13项
  ],
  floor4: [
    // ... 3项
  ]
}

// 异常检测与工单生成规则
export const anomalyDetectionRules = {
  // 布尔类型：false即为异常
  boolean: (value) => value === false,
  
  // 数值类型：超出阈值为异常
  number: {
    oil_gas: (value) => value > 100, // ppm超过100为异常
    water_pressure: (value) => value < 0.2 || value > 0.6, // MPa范围
    // ...其他数值项阈值
  }
}

// 异常优先级判定
export const anomalyPriorityRules = {
  // 关键字匹配
  high: ['氢气', '消防', '漏水', '漏油'],
  medium: ['设备故障', '压力异常', '温度异常'],
  low: ['环境异常', '卫生问题']
}
```

### 2.4 资产管理模块
```javascript
// src/store/modules/asset.js
import { defineStore } from 'pinia'

export const useAssetStore = defineStore('asset', {
  state: () => ({
    categories: [
      { value: 'tool', label: '工具' },
      { value: 'instrument', label: '仪器' },
      { value: 'spare', label: '备件' },
      { value: 'consumable', label: '耗材' },
      { value: 'other', label: '其他' }
    ],
    statuses: [
      { value: 'available', label: '可用', color: 'success' },
      { value: 'borrowed', label: '借用', color: 'warning' },
      { value: 'maintenance', label: '维修中', color: 'info' },
      { value: 'scrapped', label: '报废', color: 'danger' }
    ],
    borrowList: [], // 当前用户借用列表
    warningAssets: [] // 即将过保资产
  }),
  
  getters: {
    // 统计数据
    statistics: (state) => {
      return {
        total: state.list.length,
        totalValue: state.list.reduce((sum, item) => sum + item.price, 0),
        borrowed: state.list.filter(item => item.status === 'borrowed').length,
        maintenance: state.list.filter(item => item.status === 'maintenance').length,
        nearExpiry: state.warningAssets.length
      }
    }
  },
  
  actions: {
    // 借用资产
    async borrowAsset(assetId, userId, expectedReturnDate) {
      const res = await assetApi.borrow({
        assetId,
        userId,
        borrowDate: new Date(),
        expectedReturnDate
      })
      // 更新本地状态
      await this.fetchList()
      return res
    },
    
    // 归还资产
    async returnAsset(borrowId, actualCondition) {
      const res = await assetApi.return(borrowId, {
        returnDate: new Date(),
        actualCondition
      })
      await this.fetchList()
      return res
    }
  }
})
```

---

## 3. 通用业务组件

### 3.1 审批流程组件
```vue
<!-- src/components/Approval/ApprovalFlow.vue -->
<template>
  <div class="approval-flow">
    <el-steps :active="currentStep" finish-status="success">
      <el-step 
        v-for="step in steps" 
        :key="step.id"
        :title="step.title"
        :description="step.description"
        :status="step.status"
      />
    </el-steps>
    
    <div class="approval-actions" v-if="canApprove">
      <el-button type="success" @click="handleApprove">批准</el-button>
      <el-button type="danger" @click="handleReject">拒绝</el-button>
    </div>
  </div>
</template>

<script setup>
// 审批流程通用组件
const props = defineProps({
  type: String, // 'maintenance' | 'deletion' | 'permission'
  entityId: Number,
  currentUser: Object
})

const steps = computed(() => {
  // 根据类型返回不同的审批步骤
  const stepMap = {
    maintenance: [
      { id: 1, title: '创建计划', status: 'finish' },
      { id: 2, title: '提交审核', status: 'process' },
      { id: 3, title: '审核通过', status: 'wait' },
      { id: 4, title: '执行完成', status: 'wait' }
    ],
    deletion: [
      { id: 1, title: '提交申请', status: 'finish' },
      { id: 2, title: '管理员审核', status: 'process' },
      { id: 3, title: '执行删除', status: 'wait' }
    ]
  }
  return stepMap[props.type] || []
})
</script>
```

### 3.2 状态标签组件
```vue
<!-- src/components/Status/StatusTag.vue -->
<template>
  <el-tag 
    :type="config.type" 
    :effect="config.effect"
    :size="size"
  >
    <i :class="config.icon" v-if="config.icon"></i>
    {{ config.label }}
  </el-tag>
</template>

<script setup>
const props = defineProps({
  module: String, // 'ticket' | 'maintenance' | 'asset'
  status: String,
  size: { type: String, default: 'default' }
})

const statusConfig = {
  ticket: {
    pending: { label: '待处理', type: 'warning', icon: 'el-icon-time' },
    processing: { label: '处理中', type: '', icon: 'el-icon-loading' },
    completed: { label: '已完成', type: 'success', icon: 'el-icon-check' },
    overdue: { label: '已超时', type: 'danger', icon: 'el-icon-warning', effect: 'dark' }
  },
  maintenance: {
    draft: { label: '草稿', type: 'info' },
    pending: { label: '待审核', type: 'warning' },
    approved: { label: '已批准', type: 'success' },
    rejected: { label: '已拒绝', type: 'danger' },
    executing: { label: '执行中', type: '' },
    completed: { label: '已完成', type: 'success' }
  },
  asset: {
    available: { label: '可用', type: 'success' },
    borrowed: { label: '借用中', type: 'warning' },
    maintenance: { label: '维修中', type: 'info' },
    scrapped: { label: '已报废', type: 'danger' }
  }
}

const config = computed(() => {
  return statusConfig[props.module]?.[props.status] || { label: props.status }
})
</script>
```

### 3.3 时间倒计时组件
```vue
<!-- src/components/Countdown/TimeCountdown.vue -->
<template>
  <span :class="['countdown', urgencyClass]">
    <i class="el-icon-time"></i>
    {{ displayTime }}
    <el-tooltip v-if="isOverdue" content="已超时，请尽快处理">
      <i class="el-icon-warning-outline"></i>
    </el-tooltip>
  </span>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  deadline: [String, Date],
  format: { type: String, default: 'HH:mm:ss' }
})

const emit = defineEmits(['overdue', 'warning'])

const remainingTime = ref(0)
let timer = null

const displayTime = computed(() => {
  if (remainingTime.value <= 0) return '已超时'
  
  const hours = Math.floor(remainingTime.value / 3600)
  const minutes = Math.floor((remainingTime.value % 3600) / 60)
  const seconds = remainingTime.value % 60
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}天${hours % 24}小时`
  }
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const urgencyClass = computed(() => {
  const hours = remainingTime.value / 3600
  if (remainingTime.value <= 0) return 'text-danger animate-pulse'
  if (hours <= 1) return 'text-danger'
  if (hours <= 4) return 'text-warning'
  return 'text-info'
})

const isOverdue = computed(() => remainingTime.value <= 0)

const updateCountdown = () => {
  const now = dayjs()
  const deadline = dayjs(props.deadline)
  remainingTime.value = Math.max(0, deadline.diff(now, 'second'))
  
  // 触发事件
  if (remainingTime.value === 0) {
    emit('overdue')
  } else if (remainingTime.value <= 3600 && remainingTime.value % 300 === 0) {
    emit('warning', remainingTime.value)
  }
}

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.countdown {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}
.animate-pulse {
  animation: pulse 1s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
```

---

## 4. 数据模型与验证规则

### 4.1 表单验证规则库
```javascript
// src/utils/validate-rules.js
import { validators } from '@/utils/validate'

// IDC运维特定验证规则
export const idcValidators = {
  // 工单标题验证
  ticketTitle: [
    { required: true, message: '请输入工单标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' },
    { validator: validators.noSqlInjection, trigger: 'blur' }
  ],
  
  // 维保计划版本号验证
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { pattern: /^V\d+\.\d+(\.\d+)?$/, message: '版本号格式：V1.0 或 V1.0.0', trigger: 'blur' }
  ],
  
  // 楼层选择验证
  floor: [
    { required: true, message: '请选择楼层', trigger: 'change' },
    { validator: (rule, value, callback) => {
      const validFloors = ['1楼', '2楼', '3楼', '4楼', '全部楼层']
      if (!validFloors.includes(value)) {
        callback(new Error('请选择有效的楼层'))
      } else {
        callback()
      }
    }, trigger: 'change' }
  ],
  
  // 执行周期验证
  executionCycle: {
    frequency: [
      { required: true, message: '请输入执行频次', trigger: 'blur' },
      { type: 'number', min: 1, max: 365, message: '频次应在1-365之间', trigger: 'blur' }
    ],
    unit: [
      { required: true, message: '请选择周期单位', trigger: 'change' }
    ]
  },
  
  // 资产价格验证
  assetPrice: [
    { required: true, message: '请输入采购价格', trigger: 'blur' },
    { type: 'number', min: 0, max: 99999999, message: '价格应在合理范围内', trigger: 'blur' }
  ],
  
  // 巡检数值验证（动态）
  inspectionValue: (min, max, unit) => [
    { required: true, message: `请输入${unit}值`, trigger: 'blur' },
    { type: 'number', min, max, message: `${unit}应在${min}-${max}之间`, trigger: 'blur' }
  ]
}
```

### 4.2 数据字典定义
```javascript
// src/constants/dict.js
export const DICT = {
  // MOP类别
  MOP_CATEGORY: [
    { value: 'daily', label: '日常维护', color: 'success' },
    { value: 'regular', label: '定期保养', color: 'primary' },
    { value: 'annual', label: '年度检修', color: 'warning' },
    { value: 'emergency', label: '应急维修', color: 'danger' }
  ],
  
  // 设备专业
  EQUIPMENT_SPECIALTY: [
    { value: 'hvac', label: '暖通', icon: 'icon-hvac' },
    { value: 'power', label: '配电', icon: 'icon-power' },
    { value: 'fire', label: '消防', icon: 'icon-fire' },
    { value: 'weak', label: '弱电', icon: 'icon-network' }
  ],
  
  // 执行周期单位
  CYCLE_UNIT: [
    { value: 'day', label: '天' },
    { value: 'week', label: '周' },
    { value: 'month', label: '月' },
    { value: 'quarter', label: '季' },
    { value: 'year', label: '年' }
  ],
  
  // 通知类型
  NOTICE_TYPE: [
    { value: 'system', label: '系统公告', icon: 'el-icon-info', color: 'info' },
    { value: 'maintenance', label: '维护通知', icon: 'el-icon-setting', color: 'warning' },
    { value: 'emergency', label: '紧急通知', icon: 'el-icon-warning', color: 'danger' }
  ],
  
  // 审批类型
  APPROVAL_TYPE: [
    { value: 'delete_user', label: '删除用户', risk: 'high' },
    { value: 'delete_asset', label: '删除资产', risk: 'medium' },
    { value: 'delete_knowledge', label: '删除知识库', risk: 'low' },
    { value: 'clear_log', label: '清空日志', risk: 'high' },
    { value: 'maintenance_plan', label: '维保计划审核', risk: 'low' }
  ]
}

// 获取字典项的工具函数
export function getDictLabel(dictType, value) {
  const dict = DICT[dictType]
  if (!dict) return value
  const item = dict.find(d => d.value === value)
  return item ? item.label : value
}

export function getDictColor(dictType, value) {
  const dict = DICT[dictType]
  if (!dict) return ''
  const item = dict.find(d => d.value === value)
  return item ? item.color : ''
}
```

---

## 5. 业务流程与自动化

### 5.1 工单自动升级服务
```javascript
// src/services/ticket-escalation.js
class TicketEscalationService {
  constructor() {
    this.checkInterval = 60 * 60 * 1000 // 每小时检查一次
    this.timer = null
  }
  
  start() {
    this.timer = setInterval(() => {
      this.checkAndEscalate()
    }, this.checkInterval)
    
    // 立即执行一次
    this.checkAndEscalate()
  }
  
  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
  
  async checkAndEscalate() {
    try {
      const overdueTickets = await ticketApi.getOverdue()
      
      for (const ticket of overdueTickets) {
        const hoursOverdue = this.calculateOverdueHours(ticket)
        const newPriority = this.determineNewPriority(ticket.priority, hoursOverdue)
        
        if (newPriority !== ticket.priority) {
          await this.escalateTicket(ticket, newPriority)
          await this.notifyEscalation(ticket, newPriority)
        }
      }
    } catch (error) {
      console.error('工单升级检查失败:', error)
      // 发送错误通知给管理员
      this.notifyError(error)
    }
  }
  
  calculateOverdueHours(ticket) {
    const deadline = new Date(ticket.deadline)
    const now = new Date()
    return Math.floor((now - deadline) / (1000 * 60 * 60))
  }
  
  determineNewPriority(currentPriority, overdueHours) {
    const rules = {
      low: { threshold: 24, next: 'medium' },
      medium: { threshold: 8, next: 'high' },
      high: { threshold: 4, next: 'critical' }
    }
    
    const rule = rules[currentPriority]
    return overdueHours >= rule.threshold ? rule.next : currentPriority
  }
  
  async escalateTicket(ticket, newPriority) {
    await ticketApi.update(ticket.id, {
      priority: newPriority,
      escalationHistory: [
        ...(ticket.escalationHistory || []),
        {
          from: ticket.priority,
          to: newPriority,
          time: new Date(),
          reason: 'auto_escalation'
        }
      ]
    })
  }
  
  async notifyEscalation(ticket, newPriority) {
    const notification = {
      type: 'ticket_escalation',
      title: `工单自动升级提醒`,
      content: `工单 #${ticket.id} 已从 ${ticket.priority} 升级到 ${newPriority}`,
      recipients: [ticket.assigneeId, ticket.reporterId],
      level: newPriority === 'critical' ? 'urgent' : 'warning'
    }
    
    await notificationApi.send(notification)
  }
}

export default new TicketEscalationService()
```

### 5.2 巡检异常自动生成工单
```javascript
// src/services/inspection-anomaly.js
export class InspectionAnomalyService {
  // 检测异常项
  detectAnomalies(inspectionData) {
    const anomalies = []
    
    Object.entries(inspectionData.items).forEach(([itemId, value]) => {
      const itemConfig = this.getItemConfig(itemId)
      if (this.isAnomaly(itemConfig, value)) {
        anomalies.push({
          itemId,
          itemName: itemConfig.label,
          value,
          floor: inspectionData.floor,
          priority: this.determinePriority(itemConfig, value)
        })
      }
    })
    
    return anomalies
  }
  
  // 判断是否异常
  isAnomaly(itemConfig, value) {
    if (itemConfig.type === 'boolean') {
      return value === false
    }
    
    if (itemConfig.type === 'number') {
      const { min, max } = itemConfig.threshold || {}
      return value < min || value > max
    }
    
    return false
  }
  
  // 确定优先级
  determinePriority(itemConfig, value) {
    // 关键设备异常
    const criticalKeywords = ['氢气', '消防', '漏水', '漏油', '高压']
    if (criticalKeywords.some(keyword => itemConfig.label.includes(keyword))) {
      return 'high'
    }
    
    // 数值严重超标
    if (itemConfig.type === 'number' && itemConfig.threshold) {
      const { min, max } = itemConfig.threshold
      const deviation = Math.max(
        Math.abs(value - min) / min,
        Math.abs(value - max) / max
      )
      if (deviation > 0.5) return 'high'
      if (deviation > 0.2) return 'medium'
    }
    
    return 'low'
  }
  
  // 批量生成工单
  async generateTickets(inspectionId, anomalies) {
    const tickets = []
    
    for (const anomaly of anomalies) {
      const ticket = await ticketApi.create({
        title: `[巡检异常] ${anomaly.floor} - ${anomaly.itemName}`,
        description: this.generateDescription(anomaly),
        priority: anomaly.priority,
        source: 'inspection',
        sourceId: inspectionId,
        equipment: anomaly.itemName,
        location: anomaly.floor
      })
      
      tickets.push(ticket)
    }
    
    return tickets
  }
  
  generateDescription(anomaly) {
    return `
巡检发现异常：
- 检查项目：${anomaly.itemName}
- 所在位置：${anomaly.floor}
- 异常值：${anomaly.value}
- 异常等级：${anomaly.priority}
- 发现时间：${new Date().toLocaleString()}

请及时处理！
    `.trim()
  }
}
```

### 5.3 维保计划定时提醒
```javascript
// src/services/maintenance-reminder.js
export class MaintenanceReminderService {
  constructor() {
    this.checkInterval = 15 * 60 * 1000 // 每15分钟检查一次
  }
  
  async checkUpcomingPlans() {
    const plans = await maintenancePlanApi.getUpcoming({
      hours: 48 // 提前48小时提醒
    })
    
    for (const plan of plans) {
      if (!plan.reminded) {
        await this.sendReminder(plan)
        await this.markAsReminded(plan.id)
      }
    }
  }
  
  async sendReminder(plan) {
    const reminderLevels = {
      48: 'info',    // 48小时：普通提醒
      24: 'warning', // 24小时：警告
      4: 'urgent'    // 4小时：紧急
    }
    
    const hoursUntil = this.getHoursUntil(plan.nextExecutionTime)
    const level = Object.entries(reminderLevels)
      .find(([hours]) => hoursUntil <= hours)?.[1] || 'info'
    
    await notificationApi.send({
      type: 'maintenance_reminder',
      title: `维保计划执行提醒`,
      content: `计划"${plan.title}"将在${hoursUntil}小时后执行`,
      recipients: [plan.executorId, ...plan.notifyUsers],
      level,
      actions: [
        { label: '查看详情', url: `/maintenance/plan/${plan.id}` },
        { label: '开始执行', url: `/maintenance/execute/${plan.id}` }
      ]
    })
  }
}
```

---

## 6. 性能优化策略

### 6.1 列表虚拟滚动
```javascript
// 大数据列表优化（工单、巡检记录等）
export const listOptimization = {
  // 使用虚拟滚动阈值
  virtualScrollThreshold: 100,
  
  // 分页加载配置
  pagination: {
    defaultPageSize: 20,
    pageSizes: [20, 50, 100],
    maxExportSize: 5000
  },
  
  // 缓存策略
  cache: {
    ttl: 5 * 60 * 1000, // 5分钟
    maxSize: 100 // 最多缓存100条
  }
}
```

### 6.2 实时数据更新
```javascript
// WebSocket 实时推送（工单状态、巡检提醒等）
class RealtimeService {
  constructor() {
    this.ws = null
    this.subscribers = new Map()
  }
  
  connect() {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'
    this.ws = new WebSocket(wsUrl)
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.dispatch(data.type, data.payload)
    }
  }
  
  subscribe(type, callback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set())
    }
    this.subscribers.get(type).add(callback)
  }
  
  dispatch(type, payload) {
    const callbacks = this.subscribers.get(type)
    if (callbacks) {
      callbacks.forEach(callback => callback(payload))
    }
  }
}
```

---

## 7. 测试规范

### 7.1 业务测试用例模板
```javascript
// tests/unit/maintenance.spec.js
describe('维保计划模块', () => {
  describe('计划创建', () => {
    it('应该成功创建基础维保计划', async () => {
      const plan = await createMaintenancePlan(mockPlanData)
      expect(plan.id).toBeDefined()
      expect(plan.approvalStatus).toBe('draft')
    })
    
    it('应该正确复制上次计划', async () => {
      const copied = await copyLastPlan(lastPlanId)
      expect(copied.title).toContain('(复制)')
      expect(copied.version).toBe('V1.1')
      expect(copied.remark).toContain('复制自计划')
    })
    
    it('应该验证必填字段', async () => {
      const invalidPlan = { ...mockPlanData, title: '' }
      await expect(createMaintenancePlan(invalidPlan)).rejects.toThrow()
    })
  })
  
  describe('审批流程', () => {
    it('应该正确提交审核', async () => {
      const result = await submitForApproval(planId, approverId)
      expect(result.approvalStatus).toBe('pending')
      expect(result.approverId).toBe(approverId)
    })
  })
})
```

### 7.2 E2E测试场景
```javascript
// tests/e2e/ticket-flow.spec.js
describe('工单完整流程', () => {
  it('从创建到完成的完整流程', async () => {
    // 1. 创建工单
    await page.goto('/ticket/create')
    await page.fill('[name="title"]', '测试工单')
    await page.selectOption('[name="priority"]', 'high')
    await page.click('[type="submit"]')
    
    // 2. 验证创建成功
    await expect(page).toHaveURL(/\/ticket\/\d+/)
    
    // 3. 指派工程师
    await page.click('.assign-btn')
    await page.selectOption('[name="assignee"]', 'engineer1')
    
    // 4. 处理工单
    await page.click('.process-btn')
    await page.fill('[name="solution"]', '问题已解决')
    
    // 5. 完成工单
    await page.click('.complete-btn')
    await expect(page.locator('.status')).toHaveText('已完成')
  })
})
```

---

## 8. 部署与监控

### 8.1 环境配置
```bash
# .env.production
VITE_APP_TITLE=IDC运维管理系统
VITE_APP_ENV=production
VITE_APP_BASE_API=https://idc-api.company.com
VITE_WS_URL=wss://idc-ws.company.com
VITE_FILE_UPLOAD_SIZE=10 # MB
VITE_TICKET_AUTO_ESCALATE=true
VITE_INSPECTION_REMINDER=true
```

### 8.2 监控埋点
```javascript
// src/utils/monitor.js
export const monitor = {
  // 业务指标上报
  reportMetrics(type, data) {
    const metrics = {
      ticket_created: data.priority,
      ticket_completed: data.duration,
      inspection_anomaly: data.count,
      maintenance_executed: data.planId,
      asset_borrowed: data.assetId
    }
    
    // 发送到监控平台
    if (window.gtag) {
      window.gtag('event', type, metrics)
    }
  },
  
  // 异常上报
  reportError(error, context) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      user: store.state.user.info,
      time: new Date().toISOString()
    }
    
    // 发送到错误监控平台
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo })
    }
  }
}
```

---

## 9. 安全规范补充

### 9.1 敏感操作二次确认
```javascript
// 所有删除操作必须二次确认
export const criticalOperations = {
  deleteUser: {
    title: '删除用户确认',
    message: '删除用户将清除所有相关数据，是否确认？',
    confirmText: '我已了解风险，确认删除',
    type: 'danger',
    requireApproval: true
  },
  clearLog: {
    title: '清空日志确认',
    message: '此操作将永久删除6个月前的日志，无法恢复！',
    confirmText: '确认清空',
    type: 'danger',
    requireApproval: true
  }
}
```

### 9.2 数据脱敏规则
```javascript
// 日志记录时的数据脱敏
export const dataMasking = {
  user: ['password', 'token', 'refreshToken'],
  ticket: ['attachments'], // 附件URL不记录
  asset: ['price'], // 价格信息脱敏
  inspection: [], // 巡检数据完整记录
}
```

---

## 10. 迁移与升级指南

### 10.1 从其他系统迁移
```javascript
// 数据导入映射
export const migrationMapping = {
  // Excel导入映射
  excel: {
    工单编号: 'ticketNo',
    标题: 'title',
    优先级: (value) => {
      const map = { '紧急': 'high', '一般': 'medium', '低': 'low' }
      return map[value] || 'medium'
    },
    状态: (value) => {
      const map = { '待处理': 'pending', '处理中': 'processing', '已完成': 'completed' }
      return map[value] || 'pending'
    }
  }
}
```

### 10.2 版本升级注意事项
```markdown
## v1.0 → v2.0 升级指南
1. 数据库迁移脚本：/migrations/v1-to-v2.sql
2. 新增字段默认值：
   - ticket.escalation_history = []
   - maintenance.notify_users = []
3. 权限变更：
   - 原"查看工单"拆分为"查看自己工单"和"查看所有工单"
4. API变更：
   - /api/ticket/list → /api/ticket/page (支持分页)
```

---

## 附录A：常用代码片段

```javascript
// 快速创建工单
const quickTicket = {
  template: 'air_condition_water',
  priority: 'medium',
  autoAssign: true
}

// 批量巡检项录入
const batchInspection = items.map(item => ({
  id: item.id,
  value: item.defaultValue || true,
  remark: ''
}))

// 定时任务注册
const schedules = [
  { cron: '0 */1 * * *', task: 'ticket:escalation' },
  { cron: '0 8 * * *', task: 'maintenance:reminder' },
  { cron: '0 0 * * 1', task: 'report:weekly' }
]
```

---

## 附录B：故障排查指南

| 问题 | 可能原因 | 解决方案 |
|-----|---------|---------|
| 工单未自动升级 | 定时服务未启动 | 检查escalation service |
| 巡检异常未生成工单 | 阈值配置错误 | 检查anomalyDetectionRules |
| 通知未收到 | WebSocket断开 | 检查网络连接和WS服务 |
| 导出失败 | 数据量过大 | 分批导出或增加超时时间 |

---

## 更新日志

### v1.0.0 (2025-01)
- 初始版本发布
- 完成核心业务模块映射
- 建立开发规范与测试标准

---

> **注意**: 本文档为IDC运维管理系统专用扩展，必须配合CLAUDE.md主规范使用  
> **维护**: 业务变更时及时更新本文档，确保开发规范与业务逻辑同步

---

## 附录C：脚手架命令集

### 快速生成命令

```bash
# 生成完整模块（包含API、页面、Store、路由）
yarn scaffold:module maintenance --title "维保计划"

# 生成CRUD页面
yarn scaffold:page ticket/list --crud

# 生成单个组件
yarn scaffold:component StatusTag --global

# 生成API模块
yarn scaffold:api ticket/template --rest

# 生成Store模块  
yarn scaffold:store asset --persist

# 生成测试文件
yarn scaffold:test maintenance --unit --e2e
```

### 脚手架配置文件

```javascript
// scripts/scaffold.config.js
module.exports = {
  // 模板路径
  templates: {
    module: './templates/module',
    component: './templates/component',
    api: './templates/api',
    store: './templates/store',
    test: './templates/test'
  },

  // 输出路径
  output: {
    api: 'src/api',
    views: 'src/views',
    components: 'src/components',
    store: 'src/store/modules',
    tests: 'tests'
  },

  // 命名规范
  naming: {
    component: 'PascalCase',
    api: '{domain}{Module}Api',
    store: 'use{Module}Store'
  }
}
```

### 自定义模板

```javascript
// templates/module/index.js
const moduleTemplate = {
  name: '{{moduleName}}',
  files: [
    {
      path: 'api/{{domain}}/{{module}}.js',
      template: 'api.template.js'
    },
    {
      path: 'views/{{module}}/index.vue',
      template: 'list.template.vue'
    },
    {
      path: 'views/{{module}}/components/Form.vue',
      template: 'form.template.vue'
    },
    {
      path: 'store/modules/{{module}}.js',
      template: 'store.template.js'
    }
  ]
}
```

<template>
  <div class="ticket-detail">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>工单详情</span>
          <el-button type="text" @click="goBack">返回列表</el-button>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="工单编号">
          {{ ticketData.ticketNo }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(ticketData.status)">
            {{ getStatusLabel(ticketData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">
          {{ ticketData.title }}
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getPriorityType(ticketData.priority)">
            {{ ticketData.priority === 'high' ? '高' : ticketData.priority === 'medium' ? '中' : '低' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理时限">
          {{ parseTime(ticketData.deadline) }}
        </el-descriptions-item>
        <el-descriptions-item label="报修人">
          {{ ticketData.reporterName }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ ticketData.reporterPhone }}
        </el-descriptions-item>
        <el-descriptions-item label="故障设备">
          {{ ticketData.equipmentName }}
        </el-descriptions-item>
        <el-descriptions-item label="设备专业">
          {{ ticketData.equipmentSpecialty }}
        </el-descriptions-item>
        <el-descriptions-item label="设备位置">
          {{ ticketData.location }}
        </el-descriptions-item>
        <el-descriptions-item label="故障时间">
          {{ parseTime(ticketData.faultTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="故障描述" :span="2">
          {{ ticketData.description }}
        </el-descriptions-item>
        <el-descriptions-item label="应急处置" :span="2">
          {{ ticketData.emergencyMeasure }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ parseTime(ticketData.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ parseTime(ticketData.updateTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作按钮 -->
      <div class="action-buttons" v-if="ticketData.status !== 'closed'">
        <el-button type="primary" @click="handleEdit">编辑</el-button>
        <el-button type="success" @click="handleProcess" v-if="ticketData.status === 'assigned'">
          开始处理
        </el-button>
        <el-button type="warning" @click="handleComplete" v-if="ticketData.status === 'processing'">
          完成工单
        </el-button>
        <el-button type="danger" @click="handleClose" v-if="ticketData.status === 'completed'">
          关闭工单
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { parseTime } from '@/utils'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const ticketData = ref({})

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    assigned: 'info',
    processing: '',
    completed: 'success',
    closed: 'info'
  }
  return types[status] || ''
}

// 获取状态标签
const getStatusLabel = (status) => {
  const labels = {
    pending: '待处理',
    assigned: '已指派',
    processing: '处理中',
    completed: '已完成',
    closed: '已关闭'
  }
  return labels[status] || status
}

// 获取优先级类型
const getPriorityType = (priority) => {
  const types = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[priority] || ''
}

// 加载工单详情
const loadTicketDetail = async () => {
  loading.value = true
  try {
    // 模拟数据
    ticketData.value = {
      id: route.params.id,
      ticketNo: 'TK202501001',
      title: '2楼UPS电源告警',
      status: 'processing',
      priority: 'high',
      deadline: '2025-01-16 18:00:00',
      reporterName: '张三',
      reporterPhone: '13800138000',
      equipmentName: 'UPS-2F-001',
      equipmentSpecialty: '配电',
      location: '2楼配电室',
      faultTime: '2025-01-16 14:00:00',
      description: 'UPS电源出现异常告警，需要紧急处理',
      emergencyMeasure: '已切换到旁路供电',
      createTime: '2025-01-16 14:05:00',
      updateTime: '2025-01-16 14:30:00'
    }
  } finally {
    loading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/ticket/list')
}

// 编辑
const handleEdit = () => {
  ElMessage.info('编辑功能开发中')
}

// 开始处理
const handleProcess = () => {
  ElMessage.success('已开始处理')
  ticketData.value.status = 'processing'
}

// 完成工单
const handleComplete = () => {
  ElMessage.success('工单已完成')
  ticketData.value.status = 'completed'
}

// 关闭工单
const handleClose = () => {
  ElMessage.success('工单已关闭')
  ticketData.value.status = 'closed'
}

onMounted(() => {
  loadTicketDetail()
})
</script>

<style scoped>
.ticket-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  margin-top: 20px;
  text-align: center;
}
</style>
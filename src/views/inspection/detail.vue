<template>
  <div class="inspection-detail">
    <!-- 头部信息卡片 -->
    <el-card class="header-card">
      <div class="header-content">
        <div class="header-left">
          <el-button icon="ArrowLeft" @click="goBack">返回列表</el-button>
        </div>
        <div class="header-center">
          <h2>巡检详情</h2>
        </div>
        <div class="header-right">
          <el-button type="primary" icon="Printer" @click="handlePrint">打印</el-button>
          <el-button type="success" icon="Download" @click="handleExport">导出报告</el-button>
        </div>
      </div>
    </el-card>

    <!-- 基本信息 -->
    <el-card class="info-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
          <el-tag v-if="inspectionData.isCopied" type="info">复制</el-tag>
          <el-tag v-if="inspectionData.anomalyCount > 0" type="danger">
            异常：{{ inspectionData.anomalyCount }}项
          </el-tag>
          <el-tag v-else type="success">正常</el-tag>
        </div>
      </template>
      
      <el-descriptions :column="3" border>
        <el-descriptions-item label="巡检编号">
          {{ inspectionData.inspectionNo }}
        </el-descriptions-item>
        <el-descriptions-item label="巡检楼层">
          <el-tag>{{ getFloorLabel(inspectionData.floor) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="巡检日期">
          {{ parseTime(inspectionData.inspectionDate, '{y}-{m}-{d}') }}
        </el-descriptions-item>
        <el-descriptions-item label="巡检人员">
          {{ inspectionData.inspectorName }}
        </el-descriptions-item>
        <el-descriptions-item label="接力人员">
          {{ inspectionData.relayPersonName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="完成进度">
          <el-progress 
            :percentage="inspectionData.completionRate" 
            :status="inspectionData.completionRate === 100 ? 'success' : ''"
          />
        </el-descriptions-item>
        <el-descriptions-item label="检查项目">
          {{ inspectionData.completedItems }}/{{ inspectionData.totalItems }}项
        </el-descriptions-item>
        <el-descriptions-item label="生成工单">
          <el-link 
            v-if="inspectionData.ticketCount > 0"
            type="primary" 
            @click="viewTickets"
          >
            {{ inspectionData.ticketCount }}个
          </el-link>
          <span v-else>0个</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ parseTime(inspectionData.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="3">
          {{ inspectionData.remark || '无' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 巡检项目结果 -->
    <el-card class="items-card">
      <template #header>
        <div class="card-header">
          <span>巡检项目结果</span>
          <el-radio-group v-model="filterType" @change="handleFilterChange">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="normal">正常</el-radio-button>
            <el-radio-button label="anomaly">异常</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <!-- 统计信息 -->
      <el-row :gutter="20" class="statistics-row">
        <el-col :span="6">
          <el-statistic title="总检查项" :value="statistics.total">
            <template #suffix>项</template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="正常项" :value="statistics.normal" value-style="color: #67c23a">
            <template #suffix>项</template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="异常项" :value="statistics.anomaly" value-style="color: #f56c6c">
            <template #suffix>项</template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="异常率" :value="statistics.anomalyRate" :precision="1">
            <template #suffix>%</template>
          </el-statistic>
        </el-col>
      </el-row>

      <!-- 项目列表 -->
      <el-table 
        :data="filteredItems" 
        stripe
        :row-class-name="getRowClassName"
        class="items-table"
      >
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="检查项目" prop="label" min-width="300" />
        <el-table-column label="类型" prop="type" width="80" align="center">
          <template #default="scope">
            <el-tag size="small" type="info">
              {{ scope.row.type === 'boolean' ? '状态' : '数值' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="检查结果" prop="value" width="150" align="center">
          <template #default="scope">
            <div v-if="scope.row.type === 'boolean'">
              <el-tag v-if="scope.row.value === true" type="success">正常</el-tag>
              <el-tag v-else-if="scope.row.value === false" type="danger">异常</el-tag>
              <el-tag v-else type="info">未检查</el-tag>
            </div>
            <div v-else>
              <span v-if="scope.row.value !== null && scope.row.value !== undefined">
                {{ scope.row.value }} {{ scope.row.unit }}
              </span>
              <el-tag v-else type="info" size="small">未填写</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="正常范围" prop="range" width="150" align="center">
          <template #default="scope">
            <span v-if="scope.row.type === 'boolean'">正常</span>
            <span v-else-if="scope.row.min !== undefined">
              {{ scope.row.min }}-{{ scope.row.max }} {{ scope.row.unit }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.isAnomaly" type="danger" effect="dark">异常</el-tag>
            <el-tag v-else-if="scope.row.value !== null && scope.row.value !== undefined" type="success">正常</el-tag>
            <el-tag v-else type="info">未检查</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="生成工单" prop="ticketNo" width="120" align="center">
          <template #default="scope">
            <el-link 
              v-if="scope.row.ticketNo" 
              type="primary"
              @click="viewTicketDetail(scope.row.ticketId)"
            >
              #{{ scope.row.ticketNo }}
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 异常项汇总 -->
    <el-card class="anomaly-card" v-if="anomalyItems.length > 0">
      <template #header>
        <span>异常项汇总</span>
      </template>
      <el-alert
        title="发现以下异常项，请及时处理"
        type="warning"
        :closable="false"
        show-icon
      />
      <div class="anomaly-list">
        <div v-for="(item, index) in anomalyItems" :key="index" class="anomaly-item">
          <div class="anomaly-header">
            <span class="anomaly-index">{{ index + 1 }}</span>
            <span class="anomaly-title">{{ item.label }}</span>
            <el-tag :type="getPriorityType(item.priority)" size="small">
              {{ getPriorityLabel(item.priority) }}
            </el-tag>
          </div>
          <div class="anomaly-content">
            <el-row>
              <el-col :span="8">
                <span class="label">异常值：</span>
                <span class="value danger">{{ formatValue(item) }}</span>
              </el-col>
              <el-col :span="8">
                <span class="label">正常范围：</span>
                <span class="value">{{ formatRange(item) }}</span>
              </el-col>
              <el-col :span="8">
                <span class="label">工单状态：</span>
                <span class="value">
                  <el-link 
                    v-if="item.ticketNo" 
                    type="primary"
                    @click="viewTicketDetail(item.ticketId)"
                  >
                    #{{ item.ticketNo }} - {{ item.ticketStatus }}
                  </el-link>
                  <span v-else>未生成</span>
                </span>
              </el-col>
            </el-row>
            <div class="suggestion">
              <span class="label">处理建议：</span>
              {{ getHandlingSuggestion(item) }}
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 现场照片 -->
    <el-card class="photos-card" v-if="inspectionData.photos && inspectionData.photos.length > 0">
      <template #header>
        <span>现场照片</span>
      </template>
      <el-image
        v-for="(photo, index) in inspectionData.photos"
        :key="index"
        :src="photo.url"
        :preview-src-list="photoUrls"
        :initial-index="index"
        fit="cover"
        class="photo-item"
      />
    </el-card>

    <!-- 相关工单 -->
    <el-card class="tickets-card" v-if="relatedTickets.length > 0">
      <template #header>
        <span>相关工单</span>
      </template>
      <el-table :data="relatedTickets" stripe>
        <el-table-column label="工单编号" prop="ticketNo" width="120">
          <template #default="scope">
            <el-link type="primary" @click="viewTicketDetail(scope.row.id)">
              #{{ scope.row.ticketNo }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="标题" prop="title" />
        <el-table-column label="优先级" prop="priority" width="80" align="center">
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priority)">
              {{ getPriorityLabel(scope.row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="scope">
            <StatusTag module="ticket" :status="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="160">
          <template #default="scope">
            {{ parseTime(scope.row.createTime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { inspectionApi } from '@/api/inspection'
import { ticketApi } from '@/api/ticket'
import { FLOORS, INSPECTION_ITEMS, ANOMALY_RULES, getAnomalyPriority } from './constants'
import StatusTag from '@/components/Status/StatusTag.vue'
import { parseTime } from '@/utils'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const inspectionData = ref({})
const inspectionItems = ref([])
const relatedTickets = ref([])
const filterType = ref('all')

// 统计数据
const statistics = computed(() => {
  const total = inspectionItems.value.length
  const normal = inspectionItems.value.filter(item => !item.isAnomaly && item.value !== null).length
  const anomaly = inspectionItems.value.filter(item => item.isAnomaly).length
  const anomalyRate = total > 0 ? (anomaly / total) * 100 : 0
  
  return {
    total,
    normal,
    anomaly,
    anomalyRate
  }
})

// 过滤后的项目
const filteredItems = computed(() => {
  if (filterType.value === 'normal') {
    return inspectionItems.value.filter(item => !item.isAnomaly && item.value !== null)
  }
  if (filterType.value === 'anomaly') {
    return inspectionItems.value.filter(item => item.isAnomaly)
  }
  return inspectionItems.value
})

// 异常项
const anomalyItems = computed(() => {
  return inspectionItems.value.filter(item => item.isAnomaly)
})

// 照片URLs
const photoUrls = computed(() => {
  return (inspectionData.value.photos || []).map(p => p.url)
})

// 加载详情
const loadDetail = async () => {
  loading.value = true
  try {
    const res = await inspectionApi.get(route.params.id)
    inspectionData.value = res.data
    
    // 处理巡检项目数据
    const floorItems = INSPECTION_ITEMS[res.data.floor] || []
    inspectionItems.value = floorItems.map(item => {
      const value = res.data.items[item.id]
      const isAnomaly = checkAnomaly(item, value)
      
      return {
        ...item,
        value,
        isAnomaly,
        ticketNo: res.data.ticketMap?.[item.id]?.ticketNo,
        ticketId: res.data.ticketMap?.[item.id]?.id,
        ticketStatus: res.data.ticketMap?.[item.id]?.status,
        priority: isAnomaly ? getAnomalyPriority(item.label) : null
      }
    })
    
    // 加载相关工单
    if (res.data.ticketIds && res.data.ticketIds.length > 0) {
      loadRelatedTickets(res.data.ticketIds)
    }
  } finally {
    loading.value = false
  }
}

// 检查是否异常
const checkAnomaly = (item, value) => {
  if (value === null || value === undefined) return false
  
  if (item.type === 'boolean') {
    return ANOMALY_RULES.boolean(value)
  }
  if (item.type === 'number') {
    return ANOMALY_RULES.number(item, value)
  }
  return false
}

// 加载相关工单
const loadRelatedTickets = async (ticketIds) => {
  try {
    // 这里应该调用批量获取工单的API
    // const res = await ticketApi.getByIds(ticketIds)
    // relatedTickets.value = res.data
    
    // 模拟数据
    relatedTickets.value = ticketIds.map((id, index) => ({
      id,
      ticketNo: `T202501${String(index + 1).padStart(4, '0')}`,
      title: `巡检异常工单${index + 1}`,
      priority: ['high', 'medium', 'low'][index % 3],
      status: ['pending', 'processing', 'completed'][index % 3],
      createTime: new Date()
    }))
  } catch (error) {
    console.error('加载相关工单失败:', error)
  }
}

// 获取楼层标签
const getFloorLabel = (value) => {
  const floor = FLOORS.find(f => f.value === value)
  return floor ? floor.label : value
}

// 获取行样式
const getRowClassName = ({ row }) => {
  if (row.isAnomaly) {
    return 'anomaly-row'
  }
  if (row.value === null || row.value === undefined) {
    return 'unchecked-row'
  }
  return ''
}

// 格式化值
const formatValue = (item) => {
  if (item.type === 'boolean') {
    return item.value ? '正常' : '异常'
  }
  return `${item.value} ${item.unit || ''}`
}

// 格式化范围
const formatRange = (item) => {
  if (item.type === 'boolean') {
    return '正常'
  }
  if (item.min !== undefined) {
    return `${item.min}-${item.max} ${item.unit || ''}`
  }
  return '-'
}

// 获取处理建议
const getHandlingSuggestion = (item) => {
  const suggestions = {
    '氢气': '请立即检查氢气监测系统，确认是否存在泄漏风险',
    '漏水': '请立即前往现场查看漏水情况，防止设备损坏',
    '温度': '请检查空调系统运行状态，调整温度设置',
    'UPS': '请检查UPS系统运行状态，查看告警日志'
  }
  
  for (const [keyword, suggestion] of Object.entries(suggestions)) {
    if (item.label.includes(keyword)) {
      return suggestion
    }
  }
  
  return '请尽快前往现场检查并处理'
}

// 获取优先级类型
const getPriorityType = (priority) => {
  const map = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return map[priority] || 'info'
}

// 获取优先级标签
const getPriorityLabel = (priority) => {
  const map = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return map[priority] || priority
}

// 筛选变化
const handleFilterChange = () => {
  // 筛选逻辑已通过computed属性处理
}

// 查看工单列表
const viewTickets = () => {
  router.push({
    path: '/ticket/list',
    query: { inspectionId: route.params.id }
  })
}

// 查看工单详情
const viewTicketDetail = (id) => {
  router.push(`/ticket/detail/${id}`)
}

// 打印
const handlePrint = () => {
  window.print()
}

// 导出报告
const handleExport = async () => {
  try {
    const res = await inspectionApi.export({ id: route.params.id })
    const blob = new Blob([res])
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `巡检报告_${inspectionData.value.inspectionNo}.pdf`
    link.click()
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 初始化
onMounted(() => {
  loadDetail()
})
</script>

<style lang="scss" scoped>
.inspection-detail {
  padding: 20px;
  
  .header-card {
    margin-bottom: 20px;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-center h2 {
        margin: 0;
      }
    }
  }
  
  .info-card,
  .items-card,
  .anomaly-card,
  .photos-card,
  .tickets-card {
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .el-tag {
      margin-left: 10px;
    }
  }
  
  .statistics-row {
    margin-bottom: 20px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;
  }
  
  .items-table {
    :deep(.anomaly-row) {
      background-color: #fef0f0;
    }
    
    :deep(.unchecked-row) {
      background-color: #f5f5f5;
    }
  }
  
  .anomaly-list {
    margin-top: 20px;
    
    .anomaly-item {
      padding: 15px;
      margin-bottom: 15px;
      background: #fff7e6;
      border: 1px solid #ffd666;
      border-radius: 4px;
      
      .anomaly-header {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        
        .anomaly-index {
          width: 30px;
          height: 30px;
          background: #ff4d4f;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 10px;
        }
        
        .anomaly-title {
          flex: 1;
          font-weight: bold;
          font-size: 14px;
        }
      }
      
      .anomaly-content {
        margin-left: 40px;
        
        .label {
          color: #909399;
          margin-right: 5px;
        }
        
        .value {
          font-weight: 500;
          
          &.danger {
            color: #f56c6c;
          }
        }
        
        .suggestion {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed #dcdfe6;
          color: #606266;
        }
      }
    }
  }
  
  .photos-card {
    .photo-item {
      width: 150px;
      height: 150px;
      margin-right: 10px;
      margin-bottom: 10px;
      cursor: pointer;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
    }
  }
}

// 打印样式
@media print {
  .header-card .header-right {
    display: none;
  }
  
  .el-radio-group {
    display: none;
  }
}
</style>
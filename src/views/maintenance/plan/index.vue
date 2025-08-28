<!-- src/views/maintenance/plan/index.vue -->
<template>
  <div class="maintenance-plan-list">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="queryParams" ref="queryRef" :inline="true">
        <el-form-item label="关键词" prop="keyword">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索标题或MOP名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="楼层" prop="floor">
          <el-select v-model="queryParams.floor" placeholder="全部" clearable>
            <el-option label="1楼" value="1楼" />
            <el-option label="2楼" value="2楼" />
            <el-option label="3楼" value="3楼" />
            <el-option label="4楼" value="4楼" />
            <el-option label="全部楼层" value="全部楼层" />
          </el-select>
        </el-form-item>
        <el-form-item label="MOP类别" prop="mopCategory">
          <el-select v-model="queryParams.mopCategory" placeholder="全部" clearable>
            <el-option label="日常维护" value="daily" />
            <el-option label="定期保养" value="regular" />
            <el-option label="年度检修" value="annual" />
            <el-option label="应急维修" value="emergency" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态" prop="approvalStatus">
          <el-select v-model="queryParams.approvalStatus" placeholder="全部" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="待审核" value="pending" />
            <el-option label="已批准" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行状态" prop="executionStatus">
          <el-select v-model="queryParams.executionStatus" placeholder="全部" clearable>
            <el-option label="待执行" value="pending" />
            <el-option label="执行中" value="executing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>维保计划列表</span>
          <div>
            <el-button type="primary" icon="Plus" @click="handleAdd">新建计划</el-button>
            <el-button type="success" icon="CopyDocument" @click="handleCopyLast">复制上次计划</el-button>
            <el-button type="warning" icon="Download" @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="planList"
        border
        stripe
        :default-sort="{ prop: 'createTime', order: 'descending' }"
      >
        <el-table-column label="ID" prop="id" width="80" align="center" />
        <el-table-column label="标题" prop="title" min-width="200" show-overflow-tooltip />
        <el-table-column label="楼层" prop="floor" width="100" align="center" />
        <el-table-column label="版本" prop="version" width="80" align="center" />
        <el-table-column label="MOP类别" prop="mopCategory" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getMOPCategoryType(scope.row.mopCategory)">
              {{ getMOPCategoryLabel(scope.row.mopCategory) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行周期" prop="executionCycle" width="120" align="center">
          <template #default="scope">
            {{ scope.row.executionCycle?.frequency }}{{ scope.row.executionCycle?.unit }}
          </template>
        </el-table-column>
        <el-table-column label="审核状态" prop="approvalStatus" width="100" align="center">
          <template #default="scope">
            <StatusTag module="maintenance" :status="scope.row.approvalStatus" />
          </template>
        </el-table-column>
        <el-table-column label="执行状态" prop="executionStatus" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getExecutionStatusType(scope.row.executionStatus)">
              {{ getExecutionStatusLabel(scope.row.executionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核人" prop="approverName" width="100" align="center" />
        <el-table-column label="创建时间" prop="createTime" width="160" align="center">
          <template #default="scope">
            {{ parseTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="下次执行" prop="nextExecutionTime" width="160" align="center">
          <template #default="scope">
            <span v-if="scope.row.nextExecutionTime">
              {{ parseTime(scope.row.nextExecutionTime, '{y}-{m}-{d} {h}:{i}') }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleDetail(scope.row)">
              详情
            </el-button>
            <el-button 
              v-if="scope.row.approvalStatus === 'draft'"
              link type="primary" size="small" 
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="scope.row.approvalStatus === 'draft'"
              link type="success" size="small"
              @click="handleSubmitApproval(scope.row)"
            >
              提交审核
            </el-button>
            <el-button
              v-if="scope.row.approvalStatus === 'approved' && scope.row.executionStatus === 'pending'"
              link type="warning" size="small"
              @click="handleStartExecution(scope.row)"
            >
              开始执行
            </el-button>
            <el-button
              v-if="scope.row.approvalStatus === 'approved'"
              link type="info" size="small"
              @click="handleGenerateTicket(scope.row)"
            >
              生成工单
            </el-button>
            <el-button
              v-if="scope.row.approvalStatus === 'draft'"
              link type="danger" size="small"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
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
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useMaintenanceStore } from '@/store/modules/maintenance'
import { maintenancePlanApi } from '@/api/maintenance/plan'
import StatusTag from '@/components/Status/StatusTag.vue'
import { parseTime } from '@/utils'
import { DICT, getDictLabel } from '@/constants/dict'

const router = useRouter()
const maintenanceStore = useMaintenanceStore()

// 状态
const loading = ref(false)
const planList = ref([])
const total = ref(0)
const dateRange = ref([])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  floor: '',
  mopCategory: '',
  approvalStatus: '',
  executionStatus: '',
  startTime: '',
  endTime: ''
})

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res = await maintenanceStore.fetchPlanList(queryParams)
    planList.value = res.rows
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
  queryParams.keyword = ''
  queryParams.floor = ''
  queryParams.mopCategory = ''
  queryParams.approvalStatus = ''
  queryParams.executionStatus = ''
  queryParams.startTime = ''
  queryParams.endTime = ''
  dateRange.value = []
  handleQuery()
}

// 日期变更
const handleDateChange = (value) => {
  if (value) {
    queryParams.startTime = value[0]
    queryParams.endTime = value[1]
  } else {
    queryParams.startTime = ''
    queryParams.endTime = ''
  }
}

// 新增
const handleAdd = () => {
  router.push('/maintenance/plan/add')
}

// 复制上次计划
const handleCopyLast = async () => {
  try {
    // 获取最新计划
    const res = await maintenancePlanApi.getLatest()
    if (!res.data) {
      ElMessage.warning('没有可复制的计划')
      return
    }
    
    await ElMessageBox.confirm(
      `是否复制计划"${res.data.title}"？`,
      '确认复制',
      { type: 'info' }
    )
    
    const newPlan = await maintenanceStore.copyPlan(res.data.id)
    ElMessage.success('复制成功')
    router.push(`/maintenance/plan/edit/${newPlan.id}`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('复制失败:', error)
    }
  }
}

// 查看详情
const handleDetail = (row) => {
  router.push(`/maintenance/plan/detail/${row.id}`)
}

// 编辑
const handleEdit = (row) => {
  router.push(`/maintenance/plan/edit/${row.id}`)
}

// 提交审核
const handleSubmitApproval = async (row) => {
  router.push(`/maintenance/plan/submit/${row.id}`)
}

// 开始执行
const handleStartExecution = async (row) => {
  await ElMessageBox.confirm('确定开始执行该维保计划？', '确认', { type: 'warning' })
  
  try {
    await maintenancePlanApi.startExecution(row.id)
    ElMessage.success('已开始执行')
    getList()
  } catch (error) {
    console.error('开始执行失败:', error)
  }
}

// 生成工单
const handleGenerateTicket = async (row) => {
  await ElMessageBox.confirm('确定生成工单？', '确认', { type: 'warning' })
  
  try {
    await maintenancePlanApi.generateTicket(row.id)
    ElMessage.success('工单生成成功')
    router.push('/ticket')
  } catch (error) {
    console.error('生成工单失败:', error)
  }
}

// 删除
const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除该计划？', '警告', { type: 'warning' })
  
  try {
    await maintenanceStore.deletePlan(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 导出
const handleExport = async () => {
  await ElMessageBox.confirm('确定导出维保计划？', '确认', { type: 'info' })
  
  try {
    const res = await maintenancePlanApi.export(queryParams)
    const blob = new Blob([res])
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `维保计划_${parseTime(new Date(), '{y}{m}{d}{h}{i}{s}')}.xlsx`
    link.click()
  } catch (error) {
    console.error('导出失败:', error)
  }
}

// 获取类型标签
const getMOPCategoryLabel = (value) => getDictLabel('MOP_CATEGORY', value)
const getMOPCategoryType = (value) => {
  const map = { daily: 'success', regular: '', annual: 'warning', emergency: 'danger' }
  return map[value] || ''
}

const getExecutionStatusLabel = (value) => {
  const map = { pending: '待执行', executing: '执行中', completed: '已完成' }
  return map[value] || value
}
const getExecutionStatusType = (value) => {
  const map = { pending: 'warning', executing: '', completed: 'success' }
  return map[value] || ''
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">
.maintenance-plan-list {
  padding: 20px;
  
  .search-card {
    margin-bottom: 20px;
  }
  
  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
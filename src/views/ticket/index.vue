<template>
  <div class="ticket-list">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" class="demo-form-inline">
      <el-form-item label="工单编号" prop="ticketNo">
        <el-input
          v-model="queryParams.ticketNo"
          placeholder="请输入工单编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入标题"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="item in Object.values(TICKET_STATUS)"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-select v-model="queryParams.priority" placeholder="请选择优先级" clearable>
          <el-option
            v-for="item in Object.values(TICKET_PRIORITY)"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="dateRange">
        <el-date-picker
          v-model="queryParams.dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD HH:mm:ss"
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
          v-hasPermi="['ticket:add']"
        >新建工单</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['ticket:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['ticket:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="User"
          :disabled="multiple"
          @click="handleBatchAssign"
          v-hasPermi="['ticket:assign']"
        >批量指派</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['ticket:export']"
        >导出</el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table 
      v-loading="loading" 
      :data="dataList" 
      @selection-change="handleSelectionChange"
      :default-sort="{ prop: 'createTime', order: 'descending' }"
      :row-class-name="getRowClassName"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="工单编号" align="center" prop="ticketNo" width="120" />
      <el-table-column label="标题" align="left" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <StatusTag module="ticket" :status="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="优先级" align="center" prop="priority" width="80">
        <template #default="scope">
          <el-tag :type="TICKET_PRIORITY[scope.row.priority.toUpperCase()]?.color">
            {{ TICKET_PRIORITY[scope.row.priority.toUpperCase()]?.label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="剩余时间" align="center" prop="deadline" width="120">
        <template #default="scope">
          <TimeCountdown 
            v-if="scope.row.deadline && scope.row.status !== 'completed' && scope.row.status !== 'closed'"
            :deadline="scope.row.deadline"
            @overdue="handleOverdue(scope.row)"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="报修人" align="center" prop="reporterName" width="100" />
      <el-table-column label="故障设备" align="center" prop="equipmentName" width="120" />
      <el-table-column label="设备专业" align="center" prop="equipmentSpecialty" width="100">
        <template #default="scope">
          {{ getSpecialtyLabel(scope.row.equipmentSpecialty) }}
        </template>
      </el-table-column>
      <el-table-column label="指派给" align="center" prop="assigneeName" width="100" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="View"
            @click="handleView(scope.row)"
            v-hasPermi="['ticket:view']"
          >查看</el-button>
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['ticket:edit']"
          >修改</el-button>
          <el-button
            link
            type="primary"
            icon="User"
            @click="handleAssign(scope.row)"
            v-hasPermi="['ticket:assign']"
          >指派</el-button>
          <el-button
            link
            type="danger"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['ticket:delete']"
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
    <TicketForm 
      ref="ticketFormRef"
      @success="getList"
    />

    <!-- 指派对话框 -->
    <AssignDialog
      ref="assignDialogRef"
      @success="getList"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ticketApi } from '@/api/ticket'
import { TICKET_STATUS, TICKET_PRIORITY, EQUIPMENT_SPECIALTY } from './constants'
import StatusTag from '@/components/Status/StatusTag.vue'
import TimeCountdown from '@/components/Countdown/TimeCountdown.vue'
import TicketForm from './components/TicketForm.vue'
import AssignDialog from './components/AssignDialog.vue'
import { parseTime } from '@/utils'

// 状态定义
const loading = ref(false)
const dataList = ref([])
const total = ref(0)
const single = ref(true)
const multiple = ref(true)
const ids = ref([])
const queryRef = ref()
const ticketFormRef = ref()
const assignDialogRef = ref()

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  ticketNo: undefined,
  title: undefined,
  status: undefined,
  priority: undefined,
  dateRange: undefined
})

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    // 处理时间范围
    const params = { ...queryParams }
    if (params.dateRange && params.dateRange.length === 2) {
      params.startTime = params.dateRange[0]
      params.endTime = params.dateRange[1]
      delete params.dateRange
    }
    
    const res = await ticketApi.page(params)
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
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 新增
const handleAdd = () => {
  ticketFormRef.value?.open()
}

// 查看
const handleView = (row) => {
  ticketFormRef.value?.open(row.id, 'view')
}

// 修改
const handleUpdate = (row) => {
  const id = row.id || ids.value[0]
  ticketFormRef.value?.open(id, 'edit')
}

// 删除
const handleDelete = async (row) => {
  const ticketIds = row.id || ids.value
  await ElMessageBox.confirm('是否确认删除选中的工单？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  if (Array.isArray(ticketIds)) {
    await ticketApi.batchDelete(ticketIds)
  } else {
    await ticketApi.delete(ticketIds)
  }
  
  ElMessage.success('删除成功')
  getList()
}

// 指派
const handleAssign = (row) => {
  assignDialogRef.value?.open([row.id])
}

// 批量指派
const handleBatchAssign = () => {
  assignDialogRef.value?.open(ids.value)
}

// 导出
const handleExport = async () => {
  await ElMessageBox.confirm('是否确认导出工单数据？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  const params = { ...queryParams }
  delete params.pageNum
  delete params.pageSize
  
  const res = await ticketApi.export(params)
  const blob = new Blob([res])
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = `工单_${new Date().getTime()}.xlsx`
  link.click()
}

// 处理超时
const handleOverdue = (row) => {
  // 可以在这里添加超时提醒逻辑
  console.log(`工单 ${row.ticketNo} 已超时`)
}

// 获取设备专业标签
const getSpecialtyLabel = (value) => {
  const item = EQUIPMENT_SPECIALTY.find(s => s.value === value)
  return item ? item.label : value
}

// 行样式
const getRowClassName = ({ row }) => {
  if (row.isOverdue) {
    return 'row-overdue'
  }
  if (row.priority === 'high') {
    return 'row-high-priority'
  }
  return ''
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.ticket-list {
  padding: 20px;
  
  :deep(.row-overdue) {
    background-color: #fef0f0 !important;
  }
  
  :deep(.row-high-priority) {
    background-color: #fff7e6 !important;
  }
}
</style>
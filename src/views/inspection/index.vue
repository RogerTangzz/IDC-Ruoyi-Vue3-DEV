<template>
  <div class="inspection-list">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="楼层" prop="floor">
        <el-select v-model="queryParams.floor" placeholder="请选择楼层" clearable>
          <el-option
            v-for="floor in FLOORS"
            :key="floor.value"
            :label="floor.label"
            :value="floor.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="巡检人" prop="inspectorName">
        <el-input
          v-model="queryParams.inspectorName"
          placeholder="请输入巡检人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="巡检日期" prop="dateRange">
        <el-date-picker
          v-model="queryParams.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="异常项" prop="hasAnomaly">
        <el-select v-model="queryParams.hasAnomaly" placeholder="全部" clearable>
          <el-option label="有异常" :value="true" />
          <el-option label="无异常" :value="false" />
        </el-select>
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
          v-hasPermi="['inspection:add']"
        >开始巡检</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Calendar"
          @click="handlePlan"
          v-hasPermi="['inspection:plan']"
        >巡检计划</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Setting"
          @click="handleConfig"
          v-hasPermi="['inspection:config']"
        >巡检配置</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['inspection:export']"
        >导出报告</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="DataAnalysis"
          @click="handleStatistics"
        >统计分析</el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table 
      v-loading="loading" 
      :data="dataList" 
      @selection-change="handleSelectionChange"
      :row-class-name="getRowClassName"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="巡检编号" align="center" prop="inspectionNo" width="120" />
      <el-table-column label="楼层" align="center" prop="floor" width="80">
        <template #default="scope">
          {{ getFloorLabel(scope.row.floor) }}
        </template>
      </el-table-column>
      <el-table-column label="巡检人" align="center" prop="inspectorName" width="100" />
      <el-table-column label="接力人员" align="center" prop="relayPersonName" width="100" />
      <el-table-column label="巡检日期" align="center" prop="inspectionDate" width="110">
        <template #default="scope">
          {{ parseTime(scope.row.inspectionDate, '{y}-{m}-{d}') }}
        </template>
      </el-table-column>
      <el-table-column label="检查项数" align="center" prop="totalItems" width="90">
        <template #default="scope">
          <el-tag type="info">{{ scope.row.totalItems }}项</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="异常项数" align="center" prop="anomalyCount" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.anomalyCount > 0" type="danger">
            {{ scope.row.anomalyCount }}项
          </el-tag>
          <el-tag v-else type="success">正常</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="生成工单" align="center" prop="ticketCount" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.ticketCount > 0" type="warning">
            {{ scope.row.ticketCount }}个
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template #default="scope">
          <el-tag 
            :type="scope.row.status === 'completed' ? 'success' : 'warning'"
          >
            {{ scope.row.status === 'completed' ? '已完成' : '进行中' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="复制标记" align="center" prop="isCopied" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.isCopied" type="info">复制</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="left" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="View"
            @click="handleView(scope.row)"
            v-hasPermi="['inspection:view']"
          >查看</el-button>
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['inspection:edit']"
            v-if="scope.row.status !== 'completed'"
          >修改</el-button>
          <el-button
            link
            type="success"
            icon="DocumentCopy"
            @click="handleCopy(scope.row)"
            v-hasPermi="['inspection:add']"
          >复制</el-button>
          <el-button
            link
            type="danger"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['inspection:delete']"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { inspectionApi } from '@/api/inspection'
import { FLOORS } from './constants'
import { parseTime } from '@/utils'

const router = useRouter()
const loading = ref(false)
const dataList = ref([])
const total = ref(0)
const multiple = ref(true)
const ids = ref([])
const queryRef = ref()

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  floor: undefined,
  inspectorName: undefined,
  dateRange: undefined,
  hasAnomaly: undefined
})

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    // 处理日期范围
    const params = { ...queryParams }
    if (params.dateRange && params.dateRange.length === 2) {
      params.startDate = params.dateRange[0]
      params.endDate = params.dateRange[1]
      delete params.dateRange
    }
    
    // 模拟数据（开发阶段）
    const mockData = {
      rows: [
        {
          id: 1,
          inspectionNo: 'INS202501001',
          floor: 'floor1',
          inspectorName: '张三',
          relayPersonName: '',
          inspectionDate: '2025-01-15',
          totalItems: 22,
          anomalyCount: 2,
          ticketCount: 2,
          status: 'completed',
          isCopied: false,
          remark: '例行巡检',
          createTime: '2025-01-15 09:00:00'
        }
      ],
      total: 1
    }
    
    dataList.value = mockData.rows
    total.value = mockData.total
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

// 开始巡检
const handleAdd = () => {
  router.push('/inspection/create')
}

// 查看详情
const handleView = (row) => {
  router.push(`/inspection/detail/${row.id}`)
}

// 修改
const handleUpdate = (row) => {
  router.push(`/inspection/edit/${row.id}`)
}

// 复制巡检
const handleCopy = async (row) => {
  await ElMessageBox.confirm('是否复制该巡检记录？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  ElMessage.success('复制成功')
  router.push('/inspection/create?copy=' + row.id)
}

// 删除
const handleDelete = async (row) => {
  await ElMessageBox.confirm('是否确认删除该巡检记录？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  ElMessage.success('删除成功')
  getList()
}

// 巡检计划
const handlePlan = () => {
  router.push('/inspection/plan')
}

// 巡检配置
const handleConfig = () => {
  router.push('/inspection/config')
}

// 导出报告
const handleExport = async () => {
  await ElMessageBox.confirm('是否确认导出巡检报告？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  ElMessage.success('导出成功')
}

// 统计分析
const handleStatistics = () => {
  router.push('/inspection/statistics')
}

// 获取楼层标签
const getFloorLabel = (value) => {
  const floor = FLOORS.find(f => f.value === value)
  return floor ? floor.label : value
}

// 行样式
const getRowClassName = ({ row }) => {
  if (row.anomalyCount > 5) {
    return 'row-danger'
  }
  if (row.anomalyCount > 0) {
    return 'row-warning'
  }
  return ''
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.inspection-list {
  padding: 20px;
  
  :deep(.row-danger) {
    background-color: #fef0f0 !important;
  }
  
  :deep(.row-warning) {
    background-color: #fdf6ec !important;
  }
}
</style>
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="计划标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入计划标题"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="执行状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="待执行" value="pending" />
          <el-option label="执行中" value="executing" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </el-form-item>
      <el-form-item label="执行时间">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
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
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 执行记录列表 -->
    <el-table v-loading="loading" :data="executionList">
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column label="计划标题" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="楼层" align="center" prop="floor" width="80" />
      <el-table-column label="版本" align="center" prop="version" width="80" />
      <el-table-column label="MOP类别" align="center" prop="mopCategory" width="100">
        <template #default="scope">
          <el-tag :type="getMOPType(scope.row.mopCategory)">
            {{ getMOPLabel(scope.row.mopCategory) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="执行人" align="center" prop="executor" width="100" />
      <el-table-column label="计划时间" align="center" prop="planTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.planTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际执行时间" align="center" prop="actualTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.actualTime) || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="执行状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="View"
            @click="handleView(scope.row)"
          >查看</el-button>
          <el-button
            v-if="scope.row.status === 'pending'"
            link
            type="success"
            icon="VideoPlay"
            @click="handleExecute(scope.row)"
          >执行</el-button>
          <el-button
            v-if="scope.row.status === 'executing'"
            link
            type="warning"
            icon="Check"
            @click="handleComplete(scope.row)"
          >完成</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 执行记录对话框 -->
    <el-dialog title="执行维保计划" v-model="executeOpen" width="600px" append-to-body>
      <el-form ref="executeRef" :model="executeForm" :rules="executeRules" label-width="100px">
        <el-form-item label="执行人" prop="executor">
          <el-input v-model="executeForm.executor" placeholder="请输入执行人" />
        </el-form-item>
        <el-form-item label="执行时间" prop="executeTime">
          <el-date-picker
            v-model="executeForm.executeTime"
            type="datetime"
            placeholder="选择执行时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="执行情况" prop="result">
          <el-radio-group v-model="executeForm.result">
            <el-radio label="normal">正常</el-radio>
            <el-radio label="abnormal">异常</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="异常描述" v-if="executeForm.result === 'abnormal'" prop="abnormalDesc">
          <el-input
            v-model="executeForm.abnormalDesc"
            type="textarea"
            :rows="3"
            placeholder="请描述异常情况"
          />
        </el-form-item>
        <el-form-item label="执行记录" prop="record">
          <el-input
            v-model="executeForm.record"
            type="textarea"
            :rows="4"
            placeholder="请输入执行记录"
          />
        </el-form-item>
        <el-form-item label="现场照片">
          <el-upload
            v-model:file-list="fileList"
            class="upload-demo"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :limit="6"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="executeOpen = false">取消</el-button>
          <el-button type="primary" @click="submitExecute">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog title="执行记录详情" v-model="detailOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="计划标题" :span="2">{{ currentRecord.title }}</el-descriptions-item>
        <el-descriptions-item label="楼层">{{ currentRecord.floor }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ currentRecord.version }}</el-descriptions-item>
        <el-descriptions-item label="执行人">{{ currentRecord.executor }}</el-descriptions-item>
        <el-descriptions-item label="计划时间">{{ parseTime(currentRecord.planTime) }}</el-descriptions-item>
        <el-descriptions-item label="实际执行时间" :span="2">
          {{ parseTime(currentRecord.actualTime) || '未执行' }}
        </el-descriptions-item>
        <el-descriptions-item label="执行状态">
          <el-tag :type="getStatusType(currentRecord.status)">
            {{ getStatusLabel(currentRecord.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行结果">
          <el-tag :type="currentRecord.result === 'normal' ? 'success' : 'danger'">
            {{ currentRecord.result === 'normal' ? '正常' : '异常' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行记录" :span="2">{{ currentRecord.record }}</el-descriptions-item>
        <el-descriptions-item label="异常描述" :span="2" v-if="currentRecord.abnormalDesc">
          {{ currentRecord.abnormalDesc }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const showSearch = ref(true)
const executionList = ref([])
const total = ref(0)
const dateRange = ref([])
const executeOpen = ref(false)
const detailOpen = ref(false)
const currentRecord = ref({})
const fileList = ref([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: undefined,
  status: undefined
})

const executeForm = ref({
  executor: '',
  executeTime: '',
  result: 'normal',
  abnormalDesc: '',
  record: ''
})

const executeRules = {
  executor: [
    { required: true, message: '请输入执行人', trigger: 'blur' }
  ],
  executeTime: [
    { required: true, message: '请选择执行时间', trigger: 'change' }
  ],
  result: [
    { required: true, message: '请选择执行情况', trigger: 'change' }
  ],
  record: [
    { required: true, message: '请输入执行记录', trigger: 'blur' }
  ]
}

// 模拟数据
const mockData = [
  {
    id: 1,
    title: '1楼冷冻站月度维保计划',
    floor: '1楼',
    version: 'V1.0',
    mopCategory: 'regular',
    executor: '张三',
    planTime: '2025-01-15 09:00:00',
    actualTime: '2025-01-15 09:30:00',
    status: 'completed',
    result: 'normal',
    record: '设备运行正常，已完成月度保养'
  },
  {
    id: 2,
    title: '配电室季度检修计划',
    floor: '2楼',
    version: 'V2.1',
    mopCategory: 'annual',
    executor: '李四',
    planTime: '2025-01-20 10:00:00',
    actualTime: null,
    status: 'pending',
    result: null,
    record: null
  },
  {
    id: 3,
    title: '消防系统检查',
    floor: '全部楼层',
    version: 'V1.2',
    mopCategory: 'daily',
    executor: '王五',
    planTime: '2025-01-16 14:00:00',
    actualTime: '2025-01-16 14:00:00',
    status: 'executing',
    result: null,
    record: null
  }
]

const getList = () => {
  loading.value = true
  setTimeout(() => {
    executionList.value = mockData
    total.value = mockData.length
    loading.value = false
  }, 500)
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.title = undefined
  queryParams.status = undefined
  dateRange.value = []
  handleQuery()
}

const handleView = (row) => {
  currentRecord.value = row
  detailOpen.value = true
}

const handleExecute = (row) => {
  currentRecord.value = row
  executeForm.value = {
    executor: '',
    executeTime: new Date(),
    result: 'normal',
    abnormalDesc: '',
    record: ''
  }
  executeOpen.value = true
}

const handleComplete = (row) => {
  ElMessage.success('维保计划已完成')
  row.status = 'completed'
  row.actualTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
}

const submitExecute = async () => {
  const valid = await executeRef.value?.validate()
  if (!valid) return
  
  ElMessage.success('执行记录已保存')
  executeOpen.value = false
  getList()
}

const handleExport = () => {
  ElMessage.success('正在导出...')
}

const getMOPType = (category) => {
  const types = {
    daily: 'success',
    regular: 'primary',
    annual: 'warning',
    emergency: 'danger'
  }
  return types[category] || 'info'
}

const getMOPLabel = (category) => {
  const labels = {
    daily: '日常维护',
    regular: '定期保养',
    annual: '年度检修',
    emergency: '应急维修'
  }
  return labels[category] || category
}

const getStatusType = (status) => {
  const types = {
    pending: 'info',
    executing: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '待执行',
    executing: '执行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return labels[status] || status
}

const parseTime = (time) => {
  return time
}

// 初始化
getList()
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
</style>
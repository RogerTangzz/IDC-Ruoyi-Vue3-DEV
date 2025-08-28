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
      <el-form-item label="楼层" prop="floor">
        <el-select v-model="queryParams.floor" placeholder="请选择楼层" clearable>
          <el-option label="1楼" value="1楼" />
          <el-option label="2楼" value="2楼" />
          <el-option label="3楼" value="3楼" />
          <el-option label="4楼" value="4楼" />
          <el-option label="全部楼层" value="全部楼层" />
        </el-select>
      </el-form-item>
      <el-form-item label="MOP类别" prop="mopCategory">
        <el-select v-model="queryParams.mopCategory" placeholder="请选择MOP类别" clearable>
          <el-option label="日常维护" value="daily" />
          <el-option label="定期保养" value="regular" />
          <el-option label="年度检修" value="annual" />
          <el-option label="应急维修" value="emergency" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 待审批列表 -->
    <el-table v-loading="loading" :data="approvalList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column label="计划标题" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="楼层" align="center" prop="floor" width="100" />
      <el-table-column label="版本" align="center" prop="version" width="80" />
      <el-table-column label="MOP类别" align="center" prop="mopCategory" width="100">
        <template #default="scope">
          <el-tag :type="getMOPType(scope.row.mopCategory)">
            {{ getMOPLabel(scope.row.mopCategory) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="执行周期" align="center" prop="executionCycle" width="120" />
      <el-table-column label="申请人" align="center" prop="applicant" width="100" />
      <el-table-column label="申请时间" align="center" prop="applyTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.applyTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag type="warning">待审批</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="View"
            @click="handleView(scope.row)"
          >查看</el-button>
          <el-button
            link
            type="success"
            icon="Check"
            @click="handleApprove(scope.row)"
          >批准</el-button>
          <el-button
            link
            type="danger"
            icon="Close"
            @click="handleReject(scope.row)"
          >拒绝</el-button>
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

    <!-- 查看详情对话框 -->
    <el-dialog title="维保计划详情" v-model="detailOpen" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="计划标题">{{ currentPlan.title }}</el-descriptions-item>
        <el-descriptions-item label="楼层">{{ currentPlan.floor }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ currentPlan.version }}</el-descriptions-item>
        <el-descriptions-item label="MOP类别">{{ getMOPLabel(currentPlan.mopCategory) }}</el-descriptions-item>
        <el-descriptions-item label="执行周期">{{ currentPlan.executionCycle }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentPlan.applicant }}</el-descriptions-item>
        <el-descriptions-item label="MOP名称" :span="2">{{ currentPlan.mopName }}</el-descriptions-item>
        <el-descriptions-item label="MOP目的" :span="2">{{ currentPlan.mopPurpose }}</el-descriptions-item>
        <el-descriptions-item label="通知人员" :span="2">
          <el-tag v-for="user in currentPlan.notifyUsers" :key="user" class="mr5">{{ user }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="工具仪表" :span="2">{{ currentPlan.tools }}</el-descriptions-item>
        <el-descriptions-item label="材料" :span="2">{{ currentPlan.materials }}</el-descriptions-item>
        <el-descriptions-item label="安全PPE" :span="2">{{ currentPlan.safety }}</el-descriptions-item>
        <el-descriptions-item label="特殊工具" :span="2">{{ currentPlan.specialTools }}</el-descriptions-item>
        <el-descriptions-item label="步骤内容" :span="2">
          <div v-html="currentPlan.steps"></div>
        </el-descriptions-item>
        <el-descriptions-item label="巡检结果" :span="2">{{ currentPlan.inspectionResult }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentPlan.remark }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">关闭</el-button>
          <el-button type="success" @click="handleApprove(currentPlan)">批准</el-button>
          <el-button type="danger" @click="handleReject(currentPlan)">拒绝</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog :title="approvalTitle" v-model="approvalOpen" width="500px" append-to-body>
      <el-form ref="approvalRef" :model="approvalForm" :rules="approvalRules" label-width="80px">
        <el-form-item label="审批意见" prop="comment">
          <el-input
            v-model="approvalForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="approvalOpen = false">取消</el-button>
          <el-button type="primary" @click="submitApproval">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const showSearch = ref(true)
const approvalList = ref([])
const total = ref(0)
const detailOpen = ref(false)
const approvalOpen = ref(false)
const approvalTitle = ref('')
const currentPlan = ref({})

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: undefined,
  floor: undefined,
  mopCategory: undefined
})

const approvalForm = ref({
  comment: ''
})

const approvalRules = {
  comment: [
    { required: true, message: '请输入审批意见', trigger: 'blur' }
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
    executionCycle: '1次/月',
    applicant: '张三',
    applyTime: '2025-01-16 10:00:00',
    mopName: '冷冻站设备保养',
    mopPurpose: '确保冷冻站设备正常运行',
    notifyUsers: ['李四', '王五'],
    tools: '万用表、扳手',
    materials: '润滑油、清洁剂',
    safety: '安全帽、绝缘手套',
    specialTools: '专用检测仪',
    steps: '<p>1. 检查设备运行状态</p><p>2. 清洁设备表面</p><p>3. 更换润滑油</p>',
    inspectionResult: '设备运行正常',
    remark: '注意安全操作'
  },
  {
    id: 2,
    title: '配电室季度检修计划',
    floor: '2楼',
    version: 'V2.1',
    mopCategory: 'annual',
    executionCycle: '1次/季',
    applicant: '李四',
    applyTime: '2025-01-15 14:30:00',
    mopName: '配电设备检修',
    mopPurpose: '保障供电安全稳定',
    notifyUsers: ['张三', '赵六'],
    tools: '绝缘工具、测试仪',
    materials: '备用开关、保险丝',
    safety: '绝缘服、安全带',
    specialTools: '红外测温仪',
    steps: '<p>1. 断电操作</p><p>2. 设备检查</p><p>3. 故障排查</p>',
    inspectionResult: '待检',
    remark: '需要停电作业'
  }
]

const getList = () => {
  loading.value = true
  setTimeout(() => {
    approvalList.value = mockData
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
  queryParams.floor = undefined
  queryParams.mopCategory = undefined
  handleQuery()
}

const handleSelectionChange = (selection) => {
  // 处理多选
}

const handleView = (row) => {
  currentPlan.value = row
  detailOpen.value = true
}

const handleApprove = (row) => {
  currentPlan.value = row
  approvalTitle.value = '批准审批'
  approvalForm.value = { comment: '同意' }
  approvalOpen.value = true
}

const handleReject = (row) => {
  currentPlan.value = row
  approvalTitle.value = '拒绝审批'
  approvalForm.value = { comment: '' }
  approvalOpen.value = true
}

const submitApproval = async () => {
  const valid = await approvalRef.value?.validate()
  if (!valid) return
  
  const isApprove = approvalTitle.value === '批准审批'
  ElMessage.success(isApprove ? '已批准' : '已拒绝')
  approvalOpen.value = false
  getList()
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

const parseTime = (time) => {
  return time
}

// 初始化
getList()
</script>

<style scoped>
.mr5 {
  margin-right: 5px;
}
</style>
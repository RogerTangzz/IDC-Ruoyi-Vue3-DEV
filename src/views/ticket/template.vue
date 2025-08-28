<template>
  <div class="ticket-template">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="模板名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入模板名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="故障类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择" clearable>
          <el-option label="空调故障" value="hvac" />
          <el-option label="电力故障" value="power" />
          <el-option label="网络故障" value="network" />
          <el-option label="消防系统" value="fire" />
          <el-option label="其他" value="other" />
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
        >新增模板</el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="dataList">
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column label="模板名称" align="center" prop="name" />
      <el-table-column label="故障类型" align="center" prop="type">
        <template #default="scope">
          <el-tag>{{ getTypeLabel(scope.row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="默认优先级" align="center" prop="priority">
        <template #default="scope">
          <el-tag :type="getPriorityType(scope.row.priority)">
            {{ getPriorityLabel(scope.row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="使用次数" align="center" prop="useCount" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          {{ parseTime(scope.row.createTime) }}
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
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            link
            type="danger"
            icon="Delete"
            @click="handleDelete(scope.row)"
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
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="故障类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择故障类型">
            <el-option label="空调故障" value="hvac" />
            <el-option label="电力故障" value="power" />
            <el-option label="网络故障" value="network" />
            <el-option label="消防系统" value="fire" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认优先级" prop="priority">
          <el-radio-group v-model="form.priority">
            <el-radio label="high">高</el-radio>
            <el-radio label="medium">中</el-radio>
            <el-radio label="low">低</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="默认专业" prop="specialty">
          <el-select v-model="form.specialty" placeholder="请选择">
            <el-option label="暖通" value="hvac" />
            <el-option label="配电" value="power" />
            <el-option label="消防" value="fire" />
            <el-option label="弱电" value="weak" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认描述" prop="defaultDescription">
          <el-input
            v-model="form.defaultDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入默认描述"
          />
        </el-form-item>
        <el-form-item label="处理方案" prop="defaultSolution">
          <el-input
            v-model="form.defaultSolution"
            type="textarea"
            :rows="3"
            placeholder="请输入默认处理方案"
          />
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
import { parseTime } from '@/utils'

const loading = ref(false)
const dataList = ref([])
const total = ref(0)
const open = ref(false)
const title = ref('')
const queryRef = ref()
const formRef = ref()

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  type: undefined
})

// 表单数据
const form = ref({})
const rules = {
  name: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '请选择故障类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }]
}

// 获取类型标签
const getTypeLabel = (type) => {
  const labels = {
    hvac: '空调故障',
    power: '电力故障',
    network: '网络故障',
    fire: '消防系统',
    other: '其他'
  }
  return labels[type] || type
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

// 获取优先级标签
const getPriorityLabel = (priority) => {
  const labels = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority] || priority
}

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    // 模拟数据
    dataList.value = [
      {
        id: 1,
        name: '空调滴水',
        type: 'hvac',
        priority: 'low',
        specialty: 'hvac',
        defaultDescription: '空调内机滴水',
        defaultSolution: '检查排水管是否堵塞',
        useCount: 15,
        createTime: '2025-01-10 10:00:00'
      },
      {
        id: 2,
        name: 'UPS电池故障',
        type: 'power',
        priority: 'high',
        specialty: 'power',
        defaultDescription: 'UPS电池电压异常',
        defaultSolution: '检查电池组，必要时更换',
        useCount: 8,
        createTime: '2025-01-08 14:00:00'
      }
    ]
    total.value = 2
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

// 新增
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加模板'
}

// 查看
const handleView = (row) => {
  ElMessage.info('查看功能开发中')
}

// 修改
const handleUpdate = async (row) => {
  reset()
  form.value = { ...row }
  open.value = true
  title.value = '修改模板'
}

// 删除
const handleDelete = async (row) => {
  await ElMessageBox.confirm('是否确认删除该模板？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  ElMessage.success('删除成功')
  getList()
}

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()
  
  if (form.value.id) {
    ElMessage.success('修改成功')
  } else {
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
    name: undefined,
    type: undefined,
    priority: 'medium',
    specialty: undefined,
    defaultDescription: undefined,
    defaultSolution: undefined
  }
  formRef.value?.resetFields()
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.ticket-template {
  padding: 20px;
}
</style>
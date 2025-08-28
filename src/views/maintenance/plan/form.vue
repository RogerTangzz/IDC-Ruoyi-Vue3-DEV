<!-- src/views/maintenance/plan/form.vue -->
<template>
  <div class="maintenance-plan-form">
    <el-card>
      <template #header>
        <span>{{ isEdit ? '编辑维保计划' : '新建维保计划' }}</span>
        <el-button 
          v-if="!isEdit && !isCopy"
          type="text" 
          style="float: right"
          @click="handleCopyLast"
        >
          复制上次计划
        </el-button>
      </template>

      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        label-width="140px"
        :disabled="loading"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入标题" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="楼层编号" prop="floor">
              <el-select v-model="form.floor" placeholder="请选择楼层">
                <el-option label="1楼" value="1楼" />
                <el-option label="2楼" value="2楼" />
                <el-option label="3楼" value="3楼" />
                <el-option label="4楼" value="4楼" />
                <el-option label="全部楼层" value="全部楼层" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="版本" prop="version">
              <el-input v-model="form.version" placeholder="如：V1.0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">MOP信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="MOP类别" prop="mopCategory">
              <el-select v-model="form.mopCategory" placeholder="请选择">
                <el-option label="日常维护" value="daily" />
                <el-option label="定期保养" value="regular" />
                <el-option label="年度检修" value="annual" />
                <el-option label="应急维修" value="emergency" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="执行周期" prop="executionCycle">
              <el-input-number
                v-model="form.executionCycle.frequency"
                :min="1"
                :max="365"
                placeholder="频次"
                style="width: 100px"
              />
              <el-select 
                v-model="form.executionCycle.unit" 
                placeholder="单位"
                style="width: 100px; margin-left: 10px"
              >
                <el-option label="次/月" value="monthly" />
                <el-option label="次/季" value="quarterly" />
                <el-option label="次/年" value="yearly" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="审核人" prop="approverId">
              <el-select v-model="form.approverId" placeholder="请选择审核人">
                <el-option
                  v-for="user in approverList"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="MOP名称" prop="mopName">
              <el-input v-model="form.mopName" placeholder="请输入MOP名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="通知相关人员" prop="notifyUsers">
              <el-select 
                v-model="form.notifyUsers" 
                multiple 
                placeholder="请选择通知人员"
              >
                <el-option
                  v-for="user in userList"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="MOP目的" prop="mopPurpose">
          <el-input
            v-model="form.mopPurpose"
            type="textarea"
            :rows="3"
            placeholder="请说明维保目的"
          />
        </el-form-item>

        <el-divider content-position="left">执行信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工具仪表" prop="tools">
              <el-input
                v-model="form.tools"
                type="textarea"
                :rows="2"
                placeholder="列举所需工具"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="材料" prop="materials">
              <el-input
                v-model="form.materials"
                type="textarea"
                :rows="2"
                placeholder="列举所需材料"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="安全（PPE）" prop="safety">
              <el-input
                v-model="form.safety"
                type="textarea"
                :rows="2"
                placeholder="个人防护装备要求"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="特殊工具" prop="specialTools">
              <el-input
                v-model="form.specialTools"
                type="textarea"
                :rows="2"
                placeholder="所需配件"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="执行步骤" prop="steps">
          <RichTextEditor 
            v-model="form.steps"
            :show-table-tool="true"
            placeholder="详细描述执行步骤"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="巡检结果" prop="inspectionResult">
              <el-input
                v-model="form.inspectionResult"
                type="textarea"
                :rows="3"
                placeholder="巡检结果记录"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="form.remark"
                type="textarea"
                :rows="3"
                placeholder="备注信息"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="执行审核人" prop="executorId">
          <el-select v-model="form.executorId" placeholder="请选择执行审核人">
            <el-option
              v-for="user in approverList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isEdit ? '保存修改' : '创建计划' }}
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { maintenancePlanApi } from '@/api/maintenance/plan'
import { idcValidators } from '@/utils/validate-rules'
import RichTextEditor from '@/components/Editor/RichTextEditor.vue'

const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(false)
const formRef = ref()
const isCopy = ref(false)

// 用户列表（模拟数据）
const userList = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])
const approverList = computed(() => userList.value) // 实际应该筛选管理员

// 判断模式
const isEdit = computed(() => route.name === 'MaintenancePlanEdit')
const planId = computed(() => route.params.id)

// 表单数据
const form = reactive({
  title: '',
  floor: '',
  version: 'V1.0',
  mopCategory: '',
  executionCycle: {
    frequency: 1,
    unit: 'monthly'
  },
  approverId: null,
  mopName: '',
  mopPurpose: '',
  notifyUsers: [],
  tools: '',
  materials: '',
  safety: '',
  specialTools: '',
  steps: '',
  inspectionResult: '',
  remark: '',
  executorId: null
})

// 验证规则
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  floor: [
    { required: true, message: '请选择楼层', trigger: 'change' }
  ],
  version: idcValidators.version,
  mopCategory: [
    { required: true, message: '请选择MOP类别', trigger: 'change' }
  ],
  approverId: [
    { required: true, message: '请选择审核人', trigger: 'change' }
  ],
  mopName: [
    { required: true, message: '请输入MOP名称', trigger: 'blur' }
  ],
  mopPurpose: [
    { required: true, message: '请说明MOP目的', trigger: 'blur' }
  ]
}

// 加载计划详情
const loadPlanDetail = async () => {
  if (!planId.value) return
  
  loading.value = true
  try {
    const res = await maintenancePlanApi.get(planId.value)
    Object.assign(form, res.data)
  } catch (error) {
    ElMessage.error('加载计划详情失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 复制上次计划
const handleCopyLast = async () => {
  try {
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
    
    Object.assign(form, res.data)
    form.id = undefined
    form.title += '(复制)'
    form.version = incrementVersion(form.version)
    form.remark = `[复制自计划#${res.data.id}，复制时间：${new Date().toLocaleString()}]\n${form.remark || ''}`
    form.approvalStatus = 'draft'
    form.executionStatus = 'pending'
    isCopy.value = true
    
    ElMessage.success('已复制上次计划')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('复制失败:', error)
    }
  }
}

// 版本号递增
const incrementVersion = (version) => {
  const match = version.match(/^V(\d+)\.(\d+)(?:\.(\d+))?$/)
  if (match) {
    const major = parseInt(match[1])
    const minor = parseInt(match[2]) 
    const patch = match[3] ? parseInt(match[3]) + 1 : 1
    return `V${major}.${minor}.${patch}`
  }
  return 'V1.1'
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value?.validate()
  
  loading.value = true
  try {
    if (isEdit.value) {
      await maintenancePlanApi.update(planId.value, form)
      ElMessage.success('修改成功')
    } else {
      await maintenancePlanApi.create(form)
      ElMessage.success('创建成功')
    }
    router.push('/maintenance/plan')
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    loading.value = false
  }
}

// 取消
const handleCancel = () => {
  router.back()
}

// 初始化
onMounted(() => {
  if (isEdit.value) {
    loadPlanDetail()
  }
})
</script>

<style scoped lang="scss">
.maintenance-plan-form {
  padding: 20px;
}
</style>
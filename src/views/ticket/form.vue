<template>
  <div class="app-container">
    <el-form ref="ticketRef" :model="form" :rules="rules" label-width="120px">
      <!-- 基础信息 -->
      <el-row>
        <el-col :span="12">
          <el-form-item label="工单标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入工单标题" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="form.priority" placeholder="请选择优先级" @change="handlePriorityChange">
              <el-option label="高" value="high" />
              <el-option label="中" value="medium" />
              <el-option label="低" value="low" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="报修人" prop="reporter">
            <el-input v-model="form.reporter" placeholder="请输入报修人姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="处理时限">
            <el-input v-model="timeLimit" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 故障信息 -->
      <el-row>
        <el-col :span="12">
          <el-form-item label="故障设备" prop="equipment">
            <el-input v-model="form.equipment" placeholder="请输入故障设备名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备专业" prop="specialty">
            <el-select v-model="form.specialty" placeholder="请选择设备专业">
              <el-option label="暖通" value="hvac" />
              <el-option label="配电" value="power" />
              <el-option label="消防" value="fire" />
              <el-option label="弱电" value="weak" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="故障描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="请详细描述设备故障状况及位置"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="发现时间" prop="discoveryTime">
            <el-date-picker
              v-model="form.discoveryTime"
              type="datetime"
              placeholder="选择故障发现时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="通知工程师">
            <el-checkbox v-model="form.notifyEngineer">是否通知专业工程师</el-checkbox>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="应急处置" prop="emergencyAction">
            <el-input
              v-model="form.emergencyAction"
              type="textarea"
              :rows="3"
              placeholder="请输入应急处置方法"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="附件上传">
            <el-upload
              v-model:file-list="fileList"
              class="upload-demo"
              action="#"
              :auto-upload="false"
              multiple
              :limit="5"
              accept="image/*,video/*"
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">支持图片/视频，单个文件不超过10MB，最多5个文件</div>
              </template>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const ticketRef = ref()
const fileList = ref([])

const form = ref({
  title: '',
  priority: 'medium',
  reporter: '',
  equipment: '',
  specialty: '',
  description: '',
  discoveryTime: '',
  notifyEngineer: false,
  emergencyAction: '',
  status: 'pending'
})

const rules = {
  title: [
    { required: true, message: '请输入工单标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  reporter: [
    { required: true, message: '请输入报修人', trigger: 'blur' }
  ],
  equipment: [
    { required: true, message: '请输入故障设备', trigger: 'blur' }
  ],
  specialty: [
    { required: true, message: '请选择设备专业', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入故障描述', trigger: 'blur' }
  ],
  discoveryTime: [
    { required: true, message: '请选择发现时间', trigger: 'change' }
  ]
}

const timeLimit = computed(() => {
  const limits = {
    high: '4小时',
    medium: '8小时',
    low: '24小时'
  }
  return limits[form.value.priority] || ''
})

const handlePriorityChange = () => {
  // 优先级变化时的处理
}

const handleSubmit = async () => {
  await ticketRef.value?.validate()
  
  try {
    // 模拟提交
    ElMessage.success('工单创建成功')
    router.push('/ticket')
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

const handleCancel = () => {
  router.back()
}

onMounted(() => {
  if (route.params.id) {
    // 编辑模式，加载数据
  }
})
</script>

<style scoped>
.form-footer {
  margin-top: 20px;
  text-align: center;
}
</style>
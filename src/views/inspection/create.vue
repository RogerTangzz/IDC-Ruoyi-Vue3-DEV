<template>
  <div class="inspection-create">
    <!-- 顶部操作栏 -->
    <el-card class="header-card">
      <div class="header-actions">
        <el-button icon="ArrowLeft" @click="goBack">返回列表</el-button>
        <div class="title">{{ pageTitle }}</div>
        <div class="actions">
          <el-button 
            v-if="mode === 'create'"
            type="info" 
            @click="handleCopyLast"
          >
            <el-icon><DocumentCopy /></el-icon>
            复制上次巡检
          </el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">
            <el-icon><Check /></el-icon>
            保存并检查异常
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 基本信息 -->
    <el-card class="info-card">
      <template #header>
        <span>基本信息</span>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="巡检楼层" prop="floor">
              <el-select 
                v-model="form.floor" 
                placeholder="请选择楼层"
                @change="handleFloorChange"
                :disabled="mode === 'edit'"
              >
                <el-option
                  v-for="floor in FLOORS"
                  :key="floor.value"
                  :label="`${floor.label} (${floor.itemCount}项)`"
                  :value="floor.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="巡检日期" prop="inspectionDate">
              <el-date-picker
                v-model="form.inspectionDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="巡检人员" prop="inspectorName">
              <el-input v-model="form.inspectorName" placeholder="请输入巡检人员" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="接力人员" prop="relayPersonName">
              <el-input v-model="form.relayPersonName" placeholder="请输入接力人员（可选）" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 巡检项目 -->
    <el-card class="items-card" v-if="form.floor">
      <template #header>
        <div class="items-header">
          <span>巡检项目（{{ currentFloorLabel }}，共{{ inspectionItems.length }}项）</span>
          <div class="progress">
            完成进度：
            <el-progress 
              :percentage="completionRate" 
              :stroke-width="20"
              :text-inside="true"
              :status="completionRate === 100 ? 'success' : ''"
            />
          </div>
        </div>
      </template>

      <div class="inspection-items">
        <el-form :model="form" ref="itemsFormRef">
          <div 
            v-for="(item, index) in inspectionItems" 
            :key="item.id"
            class="inspection-item"
            :class="{ 'anomaly': isAnomaly(item) }"
          >
            <div class="item-number">{{ index + 1 }}</div>
            <div class="item-content">
              <div class="item-label">
                {{ item.label }}
                <el-tag v-if="item.type === 'number'" size="small" type="info">
                  {{ item.min }}-{{ item.max }} {{ item.unit }}
                </el-tag>
              </div>
              <div class="item-input">
                <!-- 布尔类型 -->
                <el-radio-group 
                  v-if="item.type === 'boolean'"
                  v-model="form.items[item.id]"
                  @change="handleItemChange(item)"
                >
                  <el-radio :label="true">正常</el-radio>
                  <el-radio :label="false">异常</el-radio>
                </el-radio-group>
                
                <!-- 数值类型 -->
                <div v-else-if="item.type === 'number'" class="number-input">
                  <el-input-number
                    v-model="form.items[item.id]"
                    :min="0"
                    :max="999"
                    :precision="2"
                    @change="handleItemChange(item)"
                  />
                  <span class="unit">{{ item.unit }}</span>
                  <el-tag 
                    v-if="isAnomaly(item)"
                    type="danger"
                    size="small"
                    class="anomaly-tag"
                  >
                    超出范围
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-form>
      </div>
    </el-card>

    <!-- 拍照上传 -->
    <el-card class="photo-card">
      <template #header>
        <span>现场照片</span>
      </template>
      <el-upload
        v-model:file-list="fileList"
        :action="uploadUrl"
        :headers="uploadHeaders"
        list-type="picture-card"
        :on-preview="handlePicturePreview"
        :on-remove="handleRemove"
        :on-success="handleUploadSuccess"
        :limit="9"
        accept="image/*"
      >
        <el-icon><Plus /></el-icon>
        <template #tip>
          <div class="el-upload__tip">支持jpg/png格式，最多上传9张照片</div>
        </template>
      </el-upload>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { inspectionApi } from '@/api/inspection'
import { FLOORS, INSPECTION_ITEMS, ANOMALY_RULES, getAnomalyPriority } from './constants'
import { getToken } from '@/utils/auth'

const router = useRouter()
const route = useRoute()

const mode = ref('create') // create, edit
const pageTitle = computed(() => mode.value === 'create' ? '新建巡检' : '编辑巡检')
const saving = ref(false)
const formRef = ref()
const itemsFormRef = ref()
const fileList = ref([])
const dialogVisible = ref(false)
const dialogImageUrl = ref('')

// 表单数据
const form = reactive({
  id: undefined,
  floor: undefined,
  inspectionDate: new Date().toISOString().split('T')[0],
  inspectorName: '',
  relayPersonName: '',
  remark: '',
  items: {},
  photos: []
})

// 验证规则
const rules = {
  floor: [{ required: true, message: '请选择巡检楼层', trigger: 'change' }],
  inspectionDate: [{ required: true, message: '请选择巡检日期', trigger: 'change' }],
  inspectorName: [{ required: true, message: '请输入巡检人员', trigger: 'blur' }]
}

// 当前楼层标签
const currentFloorLabel = computed(() => {
  const floor = FLOORS.find(f => f.value === form.floor)
  return floor ? floor.label : ''
})

// 巡检项目列表
const inspectionItems = computed(() => {
  return form.floor ? INSPECTION_ITEMS[form.floor] : []
})

// 完成进度
const completionRate = computed(() => {
  if (!inspectionItems.value.length) return 0
  const completed = Object.keys(form.items).filter(key => 
    form.items[key] !== undefined && form.items[key] !== null
  ).length
  return Math.round((completed / inspectionItems.value.length) * 100)
})

// 上传地址
const uploadUrl = computed(() => {
  return `${import.meta.env.VITE_APP_BASE_API}/common/upload`
})

// 上传头部
const uploadHeaders = computed(() => {
  return {
    Authorization: 'Bearer ' + getToken()
  }
})

// 切换楼层
const handleFloorChange = () => {
  form.items = {}
  // 初始化该楼层的所有项目
  inspectionItems.value.forEach(item => {
    form.items[item.id] = item.type === 'boolean' ? true : null
  })
}

// 项目值变化
const handleItemChange = (item) => {
  // 可以在这里添加实时异常检测逻辑
  console.log(`项目 ${item.label} 值变化为:`, form.items[item.id])
}

// 判断是否异常
const isAnomaly = (item) => {
  const value = form.items[item.id]
  if (value === undefined || value === null) return false
  
  if (item.type === 'boolean') {
    return ANOMALY_RULES.boolean(value)
  } else if (item.type === 'number') {
    return ANOMALY_RULES.number(item, value)
  }
  return false
}

// 复制上次巡检
const handleCopyLast = async () => {
  if (!form.floor) {
    ElMessage.warning('请先选择楼层')
    return
  }
  
  await ElMessageBox.confirm('是否复制上次巡检数据？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  try {
    const res = await inspectionApi.getLatest(form.floor)
    if (res.data) {
      // 复制巡检项数据
      form.items = { ...res.data.items }
      form.remark = `[复制自巡检#${res.data.inspectionNo}]`
      ElMessage.success('复制成功')
    } else {
      ElMessage.warning('没有找到上次巡检记录')
    }
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 保存并检查异常
const handleSave = async () => {
  await formRef.value?.validate()
  
  // 检查完成度
  if (completionRate.value < 100) {
    await ElMessageBox.confirm(
      `巡检完成度为${completionRate.value}%，是否继续保存？`,
      '系统提示',
      {
        confirmButtonText: '继续保存',
        cancelButtonText: '继续填写',
        type: 'warning'
      }
    )
  }
  
  saving.value = true
  try {
    // 准备数据
    const data = {
      ...form,
      totalItems: inspectionItems.value.length,
      completedItems: Object.keys(form.items).filter(key => 
        form.items[key] !== undefined && form.items[key] !== null
      ).length
    }
    
    // 保存巡检记录
    let inspectionId
    if (mode.value === 'edit') {
      await inspectionApi.update(form.id, data)
      inspectionId = form.id
    } else {
      const res = await inspectionApi.create(data)
      inspectionId = res.data.id
    }
    
    // 检测异常项
    const anomalies = detectAnomalies()
    
    if (anomalies.length > 0) {
      // 显示异常确认对话框
      await showAnomalyConfirm(inspectionId, anomalies)
    } else {
      ElMessage.success('保存成功，未发现异常项')
      router.push('/inspection')
    }
  } finally {
    saving.value = false
  }
}

// 检测异常项
const detectAnomalies = () => {
  const anomalies = []
  
  inspectionItems.value.forEach(item => {
    if (isAnomaly(item)) {
      anomalies.push({
        itemId: item.id,
        itemLabel: item.label,
        value: form.items[item.id],
        floor: form.floor,
        priority: getAnomalyPriority(item.label)
      })
    }
  })
  
  return anomalies
}

// 显示异常确认对话框
const showAnomalyConfirm = async (inspectionId, anomalies) => {
  const h = ElMessageBox.h
  const message = h('div', null, [
    h('p', null, `发现 ${anomalies.length} 个异常项：`),
    h('ul', null, anomalies.map(a => 
      h('li', null, `${a.itemLabel}: ${a.value}`)
    )),
    h('p', { style: 'margin-top: 10px' }, '是否自动生成工单？')
  ])
  
  try {
    await ElMessageBox.confirm(message, '异常确认', {
      confirmButtonText: '生成工单',
      cancelButtonText: '暂不生成',
      type: 'warning',
      dangerouslyUseHTMLString: true
    })
    
    // 生成工单
    const res = await inspectionApi.generateTickets(inspectionId, anomalies)
    ElMessage.success(`已生成 ${res.data.length} 个工单`)
    router.push('/inspection')
  } catch {
    // 用户取消生成工单
    ElMessage.success('保存成功')
    router.push('/inspection')
  }
}

// 图片预览
const handlePicturePreview = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url
  dialogVisible.value = true
}

// 图片移除
const handleRemove = (uploadFile, uploadFiles) => {
  const index = form.photos.findIndex(p => p.url === uploadFile.url)
  if (index !== -1) {
    form.photos.splice(index, 1)
  }
}

// 上传成功
const handleUploadSuccess = (response, uploadFile) => {
  if (response.code === 200) {
    form.photos.push({
      name: uploadFile.name,
      url: response.data.url
    })
  }
}

// 返回列表
const goBack = () => {
  router.back()
}

// 初始化
onMounted(async () => {
  if (route.params.id) {
    mode.value = 'edit'
    // 加载巡检数据
    const res = await inspectionApi.get(route.params.id)
    Object.assign(form, res.data)
    fileList.value = res.data.photos || []
  }
})
</script>

<style lang="scss" scoped>
.inspection-create {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);

  .header-card {
    margin-bottom: 20px;
    
    .header-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .title {
        font-size: 18px;
        font-weight: bold;
      }
      
      .actions {
        display: flex;
        gap: 10px;
      }
    }
  }

  .info-card,
  .items-card,
  .photo-card {
    margin-bottom: 20px;
  }

  .items-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .progress {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .el-progress {
        width: 200px;
      }
    }
  }

  .inspection-items {
    .inspection-item {
      display: flex;
      padding: 15px;
      border-bottom: 1px solid #ebeef5;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      &.anomaly {
        background-color: #fef0f0;
      }
      
      .item-number {
        width: 40px;
        height: 40px;
        background-color: #409eff;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-right: 20px;
      }
      
      .item-content {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .item-label {
          flex: 1;
          font-size: 14px;
          
          .el-tag {
            margin-left: 10px;
          }
        }
        
        .item-input {
          width: 300px;
          
          .number-input {
            display: flex;
            align-items: center;
            gap: 10px;
            
            .unit {
              color: #909399;
            }
            
            .anomaly-tag {
              margin-left: 10px;
            }
          }
        }
      }
    }
  }
}
</style>
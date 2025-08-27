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
          <el-button 
            v-if="mode === 'edit' && !isCompleted"
            type="warning" 
            @click="handleSaveTemp"
            :loading="saving"
          >
            <el-icon><Document /></el-icon>
            暂存
          </el-button>
          <el-button 
            type="primary" 
            @click="handleSave" 
            :loading="saving"
            :disabled="isCompleted && mode === 'edit'"
          >
            <el-icon><Check /></el-icon>
            {{ mode === 'edit' ? '更新并检查异常' : '保存并检查异常' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 基本信息 -->
    <el-card class="info-card">
      <template #header>
        <span>基本信息</span>
        <el-tag v-if="mode === 'edit'" :type="form.status === 'completed' ? 'success' : 'warning'" class="status-tag">
          {{ form.status === 'completed' ? '已完成' : '进行中' }}
        </el-tag>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" :disabled="isCompleted">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="巡检编号" v-if="mode === 'edit'">
              <el-input v-model="form.inspectionNo" disabled />
            </el-form-item>
            <el-form-item label="巡检楼层" prop="floor" v-else>
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
                :disabled="mode === 'edit'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="巡检人员" prop="inspectorName">
              <el-input 
                v-model="form.inspectorName" 
                placeholder="请输入巡检人员"
                :disabled="mode === 'edit'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="接力人员" prop="relayPersonName">
              <el-input 
                v-model="form.relayPersonName" 
                placeholder="请输入接力人员（可选）"
                :disabled="isCompleted"
              />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="备注" prop="remark">
              <el-input 
                v-model="form.remark" 
                type="textarea" 
                :rows="2" 
                placeholder="请输入备注信息"
                :disabled="isCompleted"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 编辑模式信息 -->
    <el-card class="edit-info-card" v-if="mode === 'edit'">
      <el-alert 
        :title="editAlertTitle"
        :type="editAlertType"
        :closable="false"
        show-icon
      >
        <template #default>
          <div class="edit-info">
            <div>创建时间：{{ parseTime(form.createTime) }}</div>
            <div>最后更新：{{ parseTime(form.updateTime) }}</div>
            <div v-if="form.completedTime">完成时间：{{ parseTime(form.completedTime) }}</div>
          </div>
        </template>
      </el-alert>
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
          <div class="quick-actions" v-if="!isCompleted">
            <el-button size="small" @click="handleQuickFillNormal">快速填充正常值</el-button>
            <el-button size="small" @click="handleClearAll" type="warning">清空所有</el-button>
          </div>
        </div>
      </template>

      <div class="inspection-items">
        <el-form :model="form" ref="itemsFormRef" :disabled="isCompleted">
          <div 
            v-for="(item, index) in inspectionItems" 
            :key="item.id"
            class="inspection-item"
            :class="{ 
              'anomaly': isAnomaly(item),
              'completed': form.items[item.id] !== undefined && form.items[item.id] !== null,
              'unchecked': form.items[item.id] === undefined || form.items[item.id] === null
            }"
          >
            <div class="item-number">{{ index + 1 }}</div>
            <div class="item-content">
              <div class="item-label">
                {{ item.label }}
                <el-tag v-if="item.type === 'number'" size="small" type="info">
                  {{ item.min }}-{{ item.max }} {{ item.unit }}
                </el-tag>
                <el-tag 
                  v-if="mode === 'edit' && form.itemStatus && form.itemStatus[item.id]" 
                  size="small" 
                  :type="form.itemStatus[item.id] === 'modified' ? 'warning' : 'info'"
                >
                  {{ form.itemStatus[item.id] === 'modified' ? '已修改' : '已检查' }}
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
                  <el-button 
                    v-if="mode === 'edit' && !isCompleted" 
                    link 
                    type="info" 
                    size="small"
                    @click="clearItem(item.id)"
                  >
                    清除
                  </el-button>
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
                  <el-button 
                    v-if="mode === 'edit' && !isCompleted" 
                    link 
                    type="info" 
                    size="small"
                    @click="clearItem(item.id)"
                  >
                    清除
                  </el-button>
                </div>
                
                <!-- 项目备注 -->
                <div class="item-remark" v-if="mode === 'edit'">
                  <el-input 
                    v-model="form.itemRemarks[item.id]" 
                    placeholder="备注（可选）" 
                    size="small"
                    :disabled="isCompleted"
                  />
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
        :disabled="isCompleted"
      >
        <el-icon v-if="!isCompleted"><Plus /></el-icon>
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
import { Plus, DocumentCopy, Document, Check } from '@element-plus/icons-vue'
import { inspectionApi } from '@/api/inspection'
import { FLOORS, INSPECTION_ITEMS, ANOMALY_RULES, getAnomalyPriority } from './constants'
import { getToken } from '@/utils/auth'
import { parseTime } from '@/utils'

const router = useRouter()
const route = useRoute()

// 模式：create 或 edit
const mode = ref('create')
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
  inspectionNo: '',
  floor: undefined,
  inspectionDate: new Date().toISOString().split('T')[0],
  inspectorName: '',
  relayPersonName: '',
  remark: '',
  items: {},
  itemRemarks: {}, // 每个检查项的备注
  itemStatus: {}, // 每个检查项的状态：checked/modified
  photos: [],
  status: 'progress', // progress/completed
  createTime: undefined,
  updateTime: undefined,
  completedTime: undefined
})

// 验证规则
const rules = {
  floor: [{ required: true, message: '请选择巡检楼层', trigger: 'change' }],
  inspectionDate: [{ required: true, message: '请选择巡检日期', trigger: 'change' }],
  inspectorName: [{ required: true, message: '请输入巡检人员', trigger: 'blur' }]
}

// 是否已完成
const isCompleted = computed(() => {
  return mode.value === 'edit' && form.status === 'completed'
})

// 编辑提示类型
const editAlertType = computed(() => {
  if (isCompleted.value) return 'success'
  if (completionRate.value < 50) return 'warning'
  return 'info'
})

// 编辑提示标题
const editAlertTitle = computed(() => {
  if (isCompleted.value) return '此巡检已完成，不可编辑'
  if (completionRate.value < 50) return `巡检进行中，已完成 ${completionRate.value}%`
  return `巡检即将完成，已完成 ${completionRate.value}%`
})

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
  form.itemRemarks = {}
  form.itemStatus = {}
  // 初始化该楼层的所有项目
  inspectionItems.value.forEach(item => {
    form.items[item.id] = item.type === 'boolean' ? null : null
  })
}

// 项目值变化
const handleItemChange = (item) => {
  // 标记为已修改
  if (mode.value === 'edit') {
    if (form.itemStatus[item.id]) {
      form.itemStatus[item.id] = 'modified'
    } else {
      form.itemStatus[item.id] = 'checked'
    }
  }
  console.log(`项目 ${item.label} 值变化为:`, form.items[item.id])
}

// 清除单个项目
const clearItem = (itemId) => {
  form.items[itemId] = null
  delete form.itemStatus[itemId]
  delete form.itemRemarks[itemId]
}

// 快速填充正常值
const handleQuickFillNormal = () => {
  ElMessageBox.confirm('是否将所有未填写的项目设置为正常值？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    inspectionItems.value.forEach(item => {
      if (form.items[item.id] === undefined || form.items[item.id] === null) {
        if (item.type === 'boolean') {
          form.items[item.id] = true
        } else if (item.type === 'number') {
          // 填入正常范围的中间值
          form.items[item.id] = (item.min + item.max) / 2
        }
        if (mode.value === 'edit') {
          form.itemStatus[item.id] = 'checked'
        }
      }
    })
    ElMessage.success('已快速填充正常值')
  })
}

// 清空所有
const handleClearAll = () => {
  ElMessageBox.confirm('是否清空所有巡检数据？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    form.items = {}
    form.itemRemarks = {}
    form.itemStatus = {}
    ElMessage.success('已清空所有数据')
  })
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

// 暂存
const handleSaveTemp = async () => {
  saving.value = true
  try {
    const data = {
      ...form,
      status: 'progress',
      totalItems: inspectionItems.value.length,
      completedItems: Object.keys(form.items).filter(key => 
        form.items[key] !== undefined && form.items[key] !== null
      ).length
    }
    
    await inspectionApi.update(form.id, data)
    ElMessage.success('暂存成功')
  } finally {
    saving.value = false
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
      status: completionRate.value === 100 ? 'completed' : 'progress',
      completedTime: completionRate.value === 100 ? new Date() : null,
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
      ElMessage.success('更新成功')
    } else {
      const res = await inspectionApi.create(data)
      inspectionId = res.data.id
      ElMessage.success('创建成功')
    }
    
    // 检测异常项
    const anomalies = detectAnomalies()
    
    if (anomalies.length > 0) {
      // 显示异常确认对话框
      await showAnomalyConfirm(inspectionId, anomalies)
    } else {
      ElMessage.success('巡检完成，未发现异常项')
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
        priority: getAnomalyPriority(item.label),
        remark: form.itemRemarks[item.id] || ''
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
  if (mode.value === 'edit' && completionRate.value > 0 && completionRate.value < 100) {
    ElMessageBox.confirm('巡检尚未完成，是否确认离开？', '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.back()
    })
  } else {
    router.back()
  }
}

// 加载巡检数据（编辑模式）
const loadInspectionData = async (id) => {
  try {
    // 模拟加载数据
    const mockData = {
      id: id,
      inspectionNo: 'INS202501001',
      floor: 'floor1',
      inspectionDate: '2025-01-15',
      inspectorName: '张三',
      relayPersonName: '',
      remark: '例行巡检',
      items: {
        oil_tank: true,
        electric_room: true,
        water_pump: false,
        oil_machine: true,
        oil_gas: 85
      },
      itemRemarks: {
        water_pump: '水泵有异响，需要检修'
      },
      itemStatus: {
        oil_tank: 'checked',
        electric_room: 'checked',
        water_pump: 'checked',
        oil_machine: 'checked',
        oil_gas: 'checked'
      },
      photos: [],
      status: 'progress',
      createTime: '2025-01-15 09:00:00',
      updateTime: '2025-01-15 10:30:00'
    }
    
    Object.assign(form, mockData)
    fileList.value = mockData.photos || []
  } catch (error) {
    ElMessage.error('加载巡检数据失败')
    router.back()
  }
}

// 初始化
onMounted(async () => {
  // 判断是编辑还是创建
  if (route.params.id) {
    mode.value = 'edit'
    await loadInspectionData(route.params.id)
  } else if (route.path.includes('edit')) {
    // 从 URL 判断是编辑模式
    mode.value = 'edit'
    const id = route.path.split('/').pop()
    if (id && id !== 'edit') {
      await loadInspectionData(id)
    }
  } else {
    mode.value = 'create'
    // 从查询参数获取楼层
    if (route.query.floor) {
      form.floor = route.query.floor
      handleFloorChange()
    }
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
  .edit-info-card,
  .items-card,
  .photo-card {
    margin-bottom: 20px;
  }

  .status-tag {
    margin-left: 10px;
  }

  .edit-info-card {
    .edit-info {
      display: flex;
      gap: 30px;
      margin-top: 10px;
      font-size: 14px;
      color: #666;
    }
  }

  .items-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
    
    .progress {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .el-progress {
        width: 200px;
      }
    }

    .quick-actions {
      display: flex;
      gap: 10px;
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

      &.completed {
        background-color: #f0f9ff;
      }

      &.unchecked {
        background-color: #fafafa;
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
        
        .item-label {
          margin-bottom: 10px;
          font-size: 14px;
          
          .el-tag {
            margin-left: 10px;
          }
        }
        
        .item-input {
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

          .item-remark {
            margin-top: 10px;
            
            .el-input {
              width: 300px;
            }
          }
        }
      }
    }
  }
}
</style>
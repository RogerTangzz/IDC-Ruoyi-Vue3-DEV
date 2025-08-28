<template>
  <div class="asset-detail">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>资产详情</span>
          <el-button type="primary" text @click="goBack">
            <el-icon><ArrowLeft /></el-icon> 返回列表
          </el-button>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="资产编号">
          <el-tag>{{ assetData.assetNo }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="资产状态">
          <el-tag :type="getStatusType(assetData.status)">
            {{ getStatusLabel(assetData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="资产名称" :span="2">
          {{ assetData.name }}
        </el-descriptions-item>
        <el-descriptions-item label="资产类别">
          {{ getCategoryLabel(assetData.category) }}
        </el-descriptions-item>
        <el-descriptions-item label="品牌型号">
          {{ assetData.model }}
        </el-descriptions-item>
        <el-descriptions-item label="采购价格">
          ¥{{ assetData.price }}
        </el-descriptions-item>
        <el-descriptions-item label="采购日期">
          {{ parseTime(assetData.purchaseDate, '{y}-{m}-{d}') }}
        </el-descriptions-item>
        <el-descriptions-item label="保修期限">
          {{ assetData.warrantyPeriod }}个月
        </el-descriptions-item>
        <el-descriptions-item label="保修到期">
          {{ parseTime(assetData.warrantyExpiry, '{y}-{m}-{d}') }}
          <el-tag v-if="isNearExpiry" type="warning" size="small" style="margin-left: 10px">
            即将过保
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="存放位置" :span="2">
          {{ assetData.location }}
        </el-descriptions-item>
        <el-descriptions-item label="负责人">
          {{ assetData.manager }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ assetData.managerPhone }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ assetData.remark }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ parseTime(assetData.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ parseTime(assetData.updateTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 借用记录 -->
      <div class="borrow-section" v-if="borrowRecords.length > 0">
        <h4>借用记录</h4>
        <el-table :data="borrowRecords" border>
          <el-table-column label="借用人" prop="borrowerName" />
          <el-table-column label="借用时间" prop="borrowTime">
            <template #default="scope">
              {{ parseTime(scope.row.borrowTime) }}
            </template>
          </el-table-column>
          <el-table-column label="归还时间" prop="returnTime">
            <template #default="scope">
              <span v-if="scope.row.returnTime">
                {{ parseTime(scope.row.returnTime) }}
              </span>
              <el-tag v-else type="warning">借用中</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" />
        </el-table>
      </div>

      <!-- 维保记录 -->
      <div class="maintenance-section" v-if="maintenanceRecords.length > 0">
        <h4>维保记录</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in maintenanceRecords"
            :key="index"
            :timestamp="parseTime(item.date)"
            placement="top"
          >
            <strong>{{ item.type }}</strong>
            <p>{{ item.description }}</p>
            <p class="text-small">操作人：{{ item.operator }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleEdit">编辑资产</el-button>
        <el-button type="success" @click="handleBorrow" v-if="canBorrow">借用</el-button>
        <el-button type="warning" @click="handleReturn" v-if="canReturn">归还</el-button>
        <el-button type="danger" @click="handleScrap" v-if="canScrap">报废</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { parseTime } from '@/utils'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const assetData = ref({})
const borrowRecords = ref([])
const maintenanceRecords = ref([])

// 计算属性
const isNearExpiry = computed(() => {
  if (!assetData.value.warrantyExpiry) return false
  const expiry = new Date(assetData.value.warrantyExpiry)
  const now = new Date()
  const days = Math.floor((expiry - now) / (1000 * 60 * 60 * 24))
  return days > 0 && days <= 30
})

const canBorrow = computed(() => {
  return assetData.value.status === 'available'
})

const canReturn = computed(() => {
  return assetData.value.status === 'borrowed'
})

const canScrap = computed(() => {
  return assetData.value.status === 'available' || assetData.value.status === 'maintenance'
})

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    available: 'success',
    borrowed: 'warning',
    maintenance: 'info',
    scrapped: 'danger'
  }
  return types[status] || ''
}

// 获取状态标签
const getStatusLabel = (status) => {
  const labels = {
    available: '可用',
    borrowed: '借用中',
    maintenance: '维修中',
    scrapped: '已报废'
  }
  return labels[status] || status
}

// 获取类别标签
const getCategoryLabel = (category) => {
  const labels = {
    tool: '工具',
    instrument: '仪器',
    spare: '备件',
    consumable: '耗材',
    other: '其他'
  }
  return labels[category] || category
}

// 加载资产详情
const loadAssetDetail = async () => {
  loading.value = true
  try {
    // 模拟数据
    assetData.value = {
      id: route.params.id,
      assetNo: 'AST202501001',
      name: '数字万用表',
      category: 'instrument',
      model: 'FLUKE 87V',
      price: 3500,
      purchaseDate: '2024-01-15',
      warrantyPeriod: 12,
      warrantyExpiry: '2025-01-15',
      location: '2楼工具间',
      manager: '李四',
      managerPhone: '13900139000',
      status: 'available',
      remark: '精度高，适用于精密测量',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-12-20 14:00:00'
    }
    
    // 模拟借用记录
    borrowRecords.value = [
      {
        borrowerName: '张三',
        borrowTime: '2024-12-01 09:00:00',
        returnTime: '2024-12-03 17:00:00',
        remark: '机房设备检测'
      },
      {
        borrowerName: '王五',
        borrowTime: '2024-11-15 14:00:00',
        returnTime: '2024-11-16 10:00:00',
        remark: 'UPS维护'
      }
    ]
    
    // 模拟维保记录
    maintenanceRecords.value = [
      {
        date: '2024-06-15',
        type: '校准',
        description: '年度校准，精度符合标准',
        operator: '外部服务商'
      },
      {
        date: '2024-03-10',
        type: '保养',
        description: '清洁保养，更换电池',
        operator: '李四'
      }
    ]
  } finally {
    loading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/asset')
}

// 编辑资产
const handleEdit = () => {
  router.push(`/asset/edit/${route.params.id}`)
}

// 借用
const handleBorrow = async () => {
  await ElMessageBox.confirm('确认借用此资产？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  })
  
  ElMessage.success('借用成功')
  assetData.value.status = 'borrowed'
}

// 归还
const handleReturn = async () => {
  await ElMessageBox.confirm('确认归还此资产？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  })
  
  ElMessage.success('归还成功')
  assetData.value.status = 'available'
}

// 报废
const handleScrap = async () => {
  await ElMessageBox.confirm('确认报废此资产？此操作不可撤销', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  ElMessage.success('报废成功')
  assetData.value.status = 'scrapped'
}

// 初始化
onMounted(() => {
  loadAssetDetail()
})
</script>

<style lang="scss" scoped>
.asset-detail {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .borrow-section,
  .maintenance-section {
    margin-top: 30px;
    
    h4 {
      margin-bottom: 15px;
      color: #303133;
      border-bottom: 1px solid #ebeef5;
      padding-bottom: 10px;
    }
  }
  
  .text-small {
    font-size: 12px;
    color: #909399;
  }
  
  .action-buttons {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
    text-align: center;
    
    .el-button {
      margin: 0 10px;
    }
  }
}
</style>
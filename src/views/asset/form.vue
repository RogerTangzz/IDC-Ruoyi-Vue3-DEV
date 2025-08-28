<template>
  <div class="asset-form">
    <el-card>
      <template #header>
        <span>{{ isEdit ? '编辑资产' : '新增资产' }}</span>
      </template>
      
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资产编号" prop="assetNo">
              <el-input v-model="form.assetNo" placeholder="请输入资产编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资产名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入资产名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资产类别" prop="category">
              <el-select v-model="form.category" placeholder="请选择类别">
                <el-option label="工具" value="tool" />
                <el-option label="仪器" value="instrument" />
                <el-option label="备件" value="spare" />
                <el-option label="耗材" value="consumable" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌型号" prop="model">
              <el-input v-model="form.model" placeholder="请输入品牌型号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="采购价格" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采购日期" prop="purchaseDate">
              <el-date-picker
                v-model="form.purchaseDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="存放位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入存放位置" />
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const formRef = ref()

const isEdit = computed(() => !!route.params.id)

// 表单数据
const form = ref({
  assetNo: '',
  name: '',
  category: '',
  model: '',
  price: 0,
  purchaseDate: '',
  location: '',
  remark: ''
})

// 验证规则
const rules = {
  assetNo: [{ required: true, message: '请输入资产编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入资产名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择资产类别', trigger: 'change' }]
}

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()
  
  if (isEdit.value) {
    ElMessage.success('修改成功')
  } else {
    ElMessage.success('新增成功')
  }
  
  router.push('/asset')
}

// 返回
const goBack = () => {
  router.back()
}

// 初始化
onMounted(() => {
  if (isEdit.value) {
    // 加载资产数据
    // loadAssetData()
  }
})
</script>

<style lang="scss" scoped>
.asset-form {
  padding: 20px;
}
</style>
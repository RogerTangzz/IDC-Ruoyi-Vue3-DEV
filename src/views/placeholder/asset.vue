<template>
  <div class="placeholder-page">
    <el-card>
      <el-result icon="info" title="功能开发中">
        <template #sub-title>
          <p>{{ moduleName }}模块正在开发中，敬请期待</p>
        </template>
        <template #extra>
          <el-button type="primary" @click="goHome">返回首页</el-button>
        </template>
      </el-result>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  moduleName: {
    type: String,
    default: '该功能'
  }
})

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.placeholder-page {
  padding: 20px;
}
</style>
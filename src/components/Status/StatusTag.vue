<!-- src/components/Status/StatusTag.vue -->
<template>
  <el-tag 
    :type="config.type" 
    :effect="config.effect"
    :size="size"
  >
    <i :class="config.icon" v-if="config.icon"></i>
    {{ config.label }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  module: String, // 'ticket' | 'maintenance' | 'asset'
  status: String,
  size: { type: String, default: 'default' }
})

const statusConfig = {
  ticket: {
    pending: { label: '待处理', type: 'warning', icon: 'el-icon-time' },
    assigned: { label: '已指派', type: 'info' },
    processing: { label: '处理中', type: '', icon: 'el-icon-loading' },
    completed: { label: '已完成', type: 'success', icon: 'el-icon-check' },
    closed: { label: '已关闭', type: 'info' },
    overdue: { label: '已超时', type: 'danger', icon: 'el-icon-warning', effect: 'dark' }
  },
  maintenance: {
    draft: { label: '草稿', type: 'info' },
    pending: { label: '待审核', type: 'warning' },
    approved: { label: '已批准', type: 'success' },
    rejected: { label: '已拒绝', type: 'danger' },
    executing: { label: '执行中', type: '' },
    completed: { label: '已完成', type: 'success' }
  },
  asset: {
    available: { label: '可用', type: 'success' },
    borrowed: { label: '借用中', type: 'warning' },
    maintenance: { label: '维修中', type: 'info' },
    scrapped: { label: '已报废', type: 'danger' }
  },
  inspection: {
    pending: { label: '待巡检', type: 'warning' },
    processing: { label: '巡检中', type: '' },
    completed: { label: '已完成', type: 'success' }
  }
}

const config = computed(() => {
  return statusConfig[props.module]?.[props.status] || { label: props.status }
})
</script>
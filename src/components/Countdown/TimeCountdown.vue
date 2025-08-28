<!-- src/components/Countdown/TimeCountdown.vue -->
<template>
  <span :class="['countdown', urgencyClass]">
    <i class="el-icon-time"></i>
    {{ displayTime }}
    <el-tooltip v-if="isOverdue" content="已超时，请尽快处理">
      <i class="el-icon-warning-outline"></i>
    </el-tooltip>
  </span>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  deadline: [String, Date],
  format: { type: String, default: 'HH:mm:ss' }
})

const emit = defineEmits(['overdue', 'warning'])

const remainingTime = ref(0)
let timer = null

const displayTime = computed(() => {
  if (remainingTime.value <= 0) return '已超时'
  
  const hours = Math.floor(remainingTime.value / 3600)
  const minutes = Math.floor((remainingTime.value % 3600) / 60)
  const seconds = remainingTime.value % 60
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}天${hours % 24}小时`
  }
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const urgencyClass = computed(() => {
  const hours = remainingTime.value / 3600
  if (remainingTime.value <= 0) return 'text-danger animate-pulse'
  if (hours <= 1) return 'text-danger'
  if (hours <= 4) return 'text-warning'
  return 'text-info'
})

const isOverdue = computed(() => remainingTime.value <= 0)

const updateCountdown = () => {
  const now = dayjs()
  const deadline = dayjs(props.deadline)
  remainingTime.value = Math.max(0, deadline.diff(now, 'second'))
  
  // 触发事件
  if (remainingTime.value === 0) {
    emit('overdue')
  } else if (remainingTime.value <= 3600 && remainingTime.value % 300 === 0) {
    emit('warning', remainingTime.value)
  }
}

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.countdown {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.text-info {
  color: #909399;
}

.text-warning {
  color: #e6a23c;
}

.text-danger {
  color: #f56c6c;
}

.animate-pulse {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
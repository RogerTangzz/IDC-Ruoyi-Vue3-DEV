// src/services/inspection-reminder.js
import { inspectionPlanApi } from '@/api/inspection'
import { ElNotification } from 'element-plus'
import { useRouter } from 'vue-router'

class InspectionReminderService {
  constructor() {
    this.checkInterval = 60 * 1000 // 每分钟检查一次
    this.timer = null
    this.isRunning = false
    this.remindedPlans = new Set() // 已提醒的计划ID集合
  }

  // 启动服务
  start() {
    if (this.isRunning) return
    
    this.isRunning = true
    this.timer = setInterval(() => {
      this.checkPlans()
    }, this.checkInterval)
    
    // 立即执行一次
    this.checkPlans()
    console.log('巡检提醒服务已启动')
  }

  // 停止服务
  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
      this.isRunning = false
      console.log('巡检提醒服务已停止')
    }
  }

  // 检查巡检计划
  async checkPlans() {
    try {
      const plans = await inspectionPlanApi.list()
      const now = new Date()
      
      plans.data.forEach(plan => {
        if (!plan.enabled) return
        
        // 计算下次执行时间
        const nextExecution = new Date(plan.nextExecutionTime)
        const diffMinutes = Math.floor((nextExecution - now) / (1000 * 60))
        
        // 检查是否需要提醒
        if (plan.reminderTime > 0 && diffMinutes > 0 && diffMinutes <= plan.reminderTime) {
          const remindKey = `${plan.id}-${nextExecution.toISOString()}`
          
          if (!this.remindedPlans.has(remindKey)) {
            this.sendReminder(plan, diffMinutes)
            this.remindedPlans.add(remindKey)
            
            // 清理过期的提醒记录
            this.cleanExpiredReminders()
          }
        }
        
        // 检查是否逾期
        if (diffMinutes < -60) { // 超过1小时未执行
          this.sendOverdueAlert(plan)
        }
      })
    } catch (error) {
      console.error('检查巡检计划失败:', error)
    }
  }

  // 发送提醒
  sendReminder(plan, minutesLeft) {
    const router = useRouter()
    
    ElNotification({
      title: '巡检提醒',
      message: `计划"${plan.planName}"将在${this.formatTime(minutesLeft)}后执行`,
      type: 'warning',
      duration: 10000,
      position: 'bottom-right',
      onClick: () => {
        router.push(`/inspection/create?floor=${plan.floor}`)
      }
    })
  }

  // 发送逾期告警
  sendOverdueAlert(plan) {
    ElNotification({
      title: '巡检逾期告警',
      message: `计划"${plan.planName}"已逾期未执行，请尽快处理`,
      type: 'error',
      duration: 0, // 不自动关闭
      position: 'bottom-right'
    })
  }

  // 格式化时间
  formatTime(minutes) {
    if (minutes < 60) {
      return `${minutes}分钟`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
  }

  // 清理过期的提醒记录
  cleanExpiredReminders() {
    const now = new Date()
    const expiredKeys = []
    
    this.remindedPlans.forEach(key => {
      const [id, timeStr] = key.split('-')
      const time = new Date(timeStr)
      if (now > time) {
        expiredKeys.push(key)
      }
    })
    
    expiredKeys.forEach(key => {
      this.remindedPlans.delete(key)
    })
  }

  // 计算下次执行时间
  calculateNextExecutionTime(plan) {
    const now = new Date()
    const [hours, minutes] = plan.executionTime.split(':').map(Number)
    
    if (plan.frequency === 'daily') {
      const next = new Date()
      next.setHours(hours, minutes, 0, 0)
      if (next <= now) {
        next.setDate(next.getDate() + 1)
      }
      return next
    }
    
    if (plan.frequency === 'weekly') {
      const weekDays = plan.weekDays.map(Number).sort()
      const currentDay = now.getDay()
      
      // 找到下一个执行日
      let nextDay = weekDays.find(day => day > currentDay)
      let daysToAdd = 0
      
      if (nextDay === undefined) {
        // 下周的第一个执行日
        nextDay = weekDays[0]
        daysToAdd = (7 - currentDay) + nextDay
      } else {
        daysToAdd = nextDay - currentDay
      }
      
      const next = new Date()
      next.setDate(next.getDate() + daysToAdd)
      next.setHours(hours, minutes, 0, 0)
      
      // 如果是今天但时间已过，找下一个执行日
      if (daysToAdd === 0 && next <= now) {
        return this.calculateNextExecutionTime({
          ...plan,
          weekDays: weekDays.filter(d => d !== currentDay)
        })
      }
      
      return next
    }
    
    if (plan.frequency === 'monthly') {
      const monthDays = plan.monthDays.map(Number).sort()
      const currentDate = now.getDate()
      
      // 找到这个月的下一个执行日
      let nextDate = monthDays.find(date => date > currentDate)
      const next = new Date()
      
      if (nextDate === undefined) {
        // 下个月的第一个执行日
        next.setMonth(next.getMonth() + 1)
        next.setDate(monthDays[0])
      } else {
        next.setDate(nextDate)
      }
      
      next.setHours(hours, minutes, 0, 0)
      
      // 如果是今天但时间已过，找下一个执行日
      if (next.getDate() === currentDate && next <= now) {
        return this.calculateNextExecutionTime({
          ...plan,
          monthDays: monthDays.filter(d => d !== currentDate)
        })
      }
      
      return next
    }
    
    return null
  }
}

// 导出单例
export default new InspectionReminderService()
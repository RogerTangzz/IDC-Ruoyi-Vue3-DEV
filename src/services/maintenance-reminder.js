// src/services/maintenance-reminder.js
import { maintenancePlanApi } from '@/api/maintenance/plan'
import { notificationApi } from '@/api/notification'
import { ElNotification } from 'element-plus'

class MaintenanceReminderService {
  constructor() {
    this.checkInterval = 15 * 60 * 1000 // 每15分钟检查一次
    this.timer = null
  }
  
  // 启动服务
  start() {
    this.timer = setInterval(() => {
      this.checkUpcomingPlans()
    }, this.checkInterval)
    
    // 立即执行一次
    this.checkUpcomingPlans()
  }
  
  // 停止服务
  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
  
  // 检查即将到期的计划
  async checkUpcomingPlans() {
    try {
      const plans = await maintenancePlanApi.getUpcoming(48) // 提前48小时
      
      for (const plan of plans) {
        const hoursUntil = this.getHoursUntil(plan.nextExecutionTime)
        
        if (this.shouldRemind(plan, hoursUntil)) {
          await this.sendReminder(plan, hoursUntil)
          await this.markAsReminded(plan.id, hoursUntil)
        }
      }
    } catch (error) {
      console.error('检查维保计划失败:', error)
    }
  }
  
  // 判断是否需要提醒
  shouldRemind(plan, hoursUntil) {
    const remindPoints = [48, 24, 4, 1] // 提醒时间点
    return remindPoints.includes(Math.floor(hoursUntil))
  }
  
  // 计算剩余小时数
  getHoursUntil(datetime) {
    const now = new Date()
    const target = new Date(datetime)
    return Math.max(0, (target - now) / (1000 * 60 * 60))
  }
  
  // 发送提醒
  async sendReminder(plan, hoursUntil) {
    const level = this.getReminderLevel(hoursUntil)
    
    // 发送系统通知
    await notificationApi.send({
      type: 'maintenance_reminder',
      title: `维保计划执行提醒`,
      content: `计划"${plan.title}"将在${Math.floor(hoursUntil)}小时后执行，请做好准备。`,
      recipients: [plan.executorId, ...plan.notifyUsers],
      level
    })
    
    // 显示桌面通知
    ElNotification({
      title: '维保计划提醒',
      message: `计划"${plan.title}"即将执行`,
      type: level === 'urgent' ? 'error' : level === 'warning' ? 'warning' : 'info',
      duration: 10000
    })
  }
  
  // 获取提醒级别
  getReminderLevel(hoursUntil) {
    if (hoursUntil <= 4) return 'urgent'
    if (hoursUntil <= 24) return 'warning'
    return 'info'
  }
  
  // 标记为已提醒
  async markAsReminded(planId, hours) {
    // 记录提醒历史，避免重复提醒
    const reminderKey = `maintenance_reminder_${planId}_${Math.floor(hours)}`
    sessionStorage.setItem(reminderKey, Date.now())
  }
}

export default new MaintenanceReminderService()
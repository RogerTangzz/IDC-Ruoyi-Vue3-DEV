// src/services/ticket-escalation.js
import { ticketApi } from '@/api/ticket'
import { ElNotification } from 'element-plus'

class TicketEscalationService {
  constructor() {
    this.checkInterval = 60 * 60 * 1000 // 每小时检查一次
    this.timer = null
    this.isRunning = false
  }
  
  // 启动服务
  start() {
    if (this.isRunning) return
    
    this.isRunning = true
    this.timer = setInterval(() => {
      this.checkAndEscalate()
    }, this.checkInterval)
    
    // 立即执行一次
    this.checkAndEscalate()
    console.log('工单自动升级服务已启动')
  }
  
  // 停止服务
  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
      this.isRunning = false
      console.log('工单自动升级服务已停止')
    }
  }
  
  // 检查并升级
  async checkAndEscalate() {
    try {
      const overdueTickets = await ticketApi.getOverdue()
      
      for (const ticket of overdueTickets.data) {
        const hoursOverdue = this.calculateOverdueHours(ticket)
        const newPriority = this.determineNewPriority(ticket.priority, hoursOverdue)
        
        if (newPriority !== ticket.priority) {
          await this.escalateTicket(ticket, newPriority)
          this.notifyEscalation(ticket, newPriority)
        }
      }
    } catch (error) {
      console.error('工单升级检查失败:', error)
      this.notifyError(error)
    }
  }
  
  // 计算超时小时数
  calculateOverdueHours(ticket) {
    const deadline = new Date(ticket.deadline)
    const now = new Date()
    return Math.floor((now - deadline) / (1000 * 60 * 60))
  }
  
  // 确定新优先级
  determineNewPriority(currentPriority, overdueHours) {
    const rules = {
      low: { threshold: 24, next: 'medium' },
      medium: { threshold: 8, next: 'high' },
      high: { threshold: 4, next: 'critical' }
    }
    
    const rule = rules[currentPriority]
    if (!rule) return currentPriority
    
    return overdueHours >= rule.threshold ? rule.next : currentPriority
  }
  
  // 升级工单
  async escalateTicket(ticket, newPriority) {
    await ticketApi.update(ticket.id, {
      priority: newPriority,
      escalationHistory: [
        ...(ticket.escalationHistory || []),
        {
          from: ticket.priority,
          to: newPriority,
          time: new Date().toISOString(),
          reason: 'auto_escalation',
          overdueHours: this.calculateOverdueHours(ticket)
        }
      ]
    })
  }
  
  // 发送升级通知
  notifyEscalation(ticket, newPriority) {
    ElNotification({
      title: '工单自动升级',
      message: `工单 #${ticket.ticketNo} 已从 ${ticket.priority} 升级到 ${newPriority}`,
      type: 'warning',
      duration: 5000,
      position: 'bottom-right'
    })
  }
  
  // 错误通知
  notifyError(error) {
    ElNotification({
      title: '工单升级服务异常',
      message: error.message || '请检查系统日志',
      type: 'error',
      duration: 5000,
      position: 'bottom-right'
    })
  }
}

// 导出单例
export default new TicketEscalationService()
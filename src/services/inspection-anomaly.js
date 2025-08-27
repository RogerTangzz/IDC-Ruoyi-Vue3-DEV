// src/services/inspection-anomaly.js
import { inspectionApi } from '@/api/inspection'
import { ticketApi } from '@/api/ticket'
import { ANOMALY_RULES, getAnomalyPriority } from '@/views/inspection/constants'
import { ElNotification } from 'element-plus'

export class InspectionAnomalyService {
  // 检测异常项
  detectAnomalies(inspectionData) {
    const anomalies = []
    const { items, floor } = inspectionData
    
    // 获取该楼层的检查项配置
    const floorItems = INSPECTION_ITEMS[floor]
    
    floorItems.forEach(itemConfig => {
      const value = items[itemConfig.id]
      
      // 跳过未填写的项
      if (value === undefined || value === null) return
      
      // 检测是否异常
      if (this.isAnomaly(itemConfig, value)) {
        anomalies.push({
          itemId: itemConfig.id,
          itemName: itemConfig.label,
          value,
          expectedRange: this.getExpectedRange(itemConfig),
          floor: inspectionData.floor,
          priority: getAnomalyPriority(itemConfig.label),
          severity: this.calculateSeverity(itemConfig, value)
        })
      }
    })
    
    return anomalies
  }
  
  // 判断是否异常
  isAnomaly(itemConfig, value) {
    if (itemConfig.type === 'boolean') {
      return ANOMALY_RULES.boolean(value)
    }
    
    if (itemConfig.type === 'number') {
      return ANOMALY_RULES.number(itemConfig, value)
    }
    
    return false
  }
  
  // 获取期望范围
  getExpectedRange(itemConfig) {
    if (itemConfig.type === 'boolean') {
      return '正常'
    }
    if (itemConfig.type === 'number') {
      return `${itemConfig.min}-${itemConfig.max} ${itemConfig.unit}`
    }
    return ''
  }
  
  // 计算严重程度
  calculateSeverity(itemConfig, value) {
    if (itemConfig.type === 'number' && itemConfig.min !== undefined && itemConfig.max !== undefined) {
      const range = itemConfig.max - itemConfig.min
      const deviation = Math.max(
        Math.abs(value - itemConfig.min),
        Math.abs(value - itemConfig.max)
      )
      const deviationRate = deviation / range
      
      if (deviationRate > 0.5) return 'critical'
      if (deviationRate > 0.3) return 'major'
      if (deviationRate > 0.1) return 'minor'
    }
    
    return 'normal'
  }
  
  // 批量生成工单
  async generateTickets(inspectionId, anomalies) {
    const tickets = []
    
    for (const anomaly of anomalies) {
      const ticketData = {
        title: `[巡检异常] ${this.getFloorName(anomaly.floor)} - ${anomaly.itemName}`,
        description: this.generateDescription(anomaly),
        priority: anomaly.priority,
        source: 'inspection',
        sourceId: inspectionId,
        equipmentName: anomaly.itemName,
        location: this.getFloorName(anomaly.floor),
        equipmentSpecialty: this.detectSpecialty(anomaly.itemName),
        // 根据优先级设置处理时限
        deadline: this.calculateDeadline(anomaly.priority)
      }
      
      try {
        const res = await ticketApi.create(ticketData)
        tickets.push(res.data)
        
        // 发送通知
        this.notifyTicketCreated(anomaly, res.data)
      } catch (error) {
        console.error('生成工单失败:', error)
        ElNotification({
          title: '工单生成失败',
          message: `无法为"${anomaly.itemName}"生成工单`,
          type: 'error',
          duration: 3000
        })
      }
    }
    
    return tickets
  }
  
  // 生成工单描述
  generateDescription(anomaly) {
    return `
## 巡检异常详情

**检查项目**: ${anomaly.itemName}
**所在位置**: ${this.getFloorName(anomaly.floor)}
**异常值**: ${anomaly.value}
**正常范围**: ${anomaly.expectedRange}
**异常等级**: ${this.getPriorityLabel(anomaly.priority)}
**严重程度**: ${this.getSeverityLabel(anomaly.severity)}
**发现时间**: ${new Date().toLocaleString()}

## 处理建议

${this.getHandlingSuggestion(anomaly)}

---
*此工单由巡检系统自动生成*
    `.trim()
  }
  
  // 获取处理建议
  getHandlingSuggestion(anomaly) {
    const suggestions = {
      '氢气': '请立即检查氢气监测系统，确认是否存在泄漏风险，必要时启动应急预案',
      '漏水': '请立即前往现场查看漏水情况，关闭相关阀门，防止设备损坏',
      '温度': '请检查空调系统运行状态，调整温度设置或检修空调设备',
      '压力': '请检查相关泵组和管道系统，调整压力参数或排查故障',
      'UPS': '请检查UPS系统运行状态，查看告警日志，必要时切换至旁路供电',
      '消防': '请立即检查消防系统，确认是否存在真实火警，排查误报原因'
    }
    
    for (const [keyword, suggestion] of Object.entries(suggestions)) {
      if (anomaly.itemName.includes(keyword)) {
        return suggestion
      }
    }
    
    return '请尽快前往现场检查，确认异常情况并进行处理'
  }
  
  // 检测设备专业
  detectSpecialty(itemName) {
    if (itemName.includes('电') || itemName.includes('UPS')) return 'power'
    if (itemName.includes('空调') || itemName.includes('温度') || itemName.includes('冷')) return 'hvac'
    if (itemName.includes('消防') || itemName.includes('水')) return 'fire'
    if (itemName.includes('监控') || itemName.includes('门禁')) return 'weak'
    return 'other'
  }
  
  // 计算处理时限
  calculateDeadline(priority) {
    const now = new Date()
    const hours = {
      high: 4,
      medium: 8,
      low: 24
    }
    
    now.setHours(now.getHours() + (hours[priority] || 24))
    return now
  }
  
  // 获取楼层名称
  getFloorName(floor) {
    const floorMap = {
      floor1: '1楼',
      floor2: '2楼',
      floor3: '3楼',
      floor4: '4楼'
    }
    return floorMap[floor] || floor
  }
  
  // 获取优先级标签
  getPriorityLabel(priority) {
    const labels = {
      high: '高',
      medium: '中',
      low: '低'
    }
    return labels[priority] || priority
  }
  
  // 获取严重程度标签
  getSeverityLabel(severity) {
    const labels = {
      critical: '严重',
      major: '重要',
      minor: '轻微',
      normal: '一般'
    }
    return labels[severity] || severity
  }
  
  // 发送工单创建通知
  notifyTicketCreated(anomaly, ticket) {
    ElNotification({
      title: '工单已自动生成',
      message: `异常项"${anomaly.itemName}"已生成工单 #${ticket.ticketNo}`,
      type: 'warning',
      duration: 5000,
      position: 'bottom-right'
    })
  }
}

// 导出单例
export default new InspectionAnomalyService()
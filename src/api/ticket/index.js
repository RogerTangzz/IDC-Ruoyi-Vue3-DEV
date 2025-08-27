// src/api/ticket/index.js
import request from '@/utils/request'

// 故障工单API
export const ticketApi = {
  // 分页查询
  page(params) {
    return request({
      url: '/ticket/page',
      method: 'get',
      params: {
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 10,
        status: params.status,
        priority: params.priority,
        assigneeId: params.assigneeId,
        keyword: params.keyword,
        startTime: params.startTime,
        endTime: params.endTime,
        ...params
      }
    })
  },

  // 获取详情
  get(id) {
    return request({
      url: `/ticket/${id}`,
      method: 'get'
    })
  },

  // 创建工单（支持模板）
  create(data) {
    return request({
      url: '/ticket',
      method: 'post',
      data: {
        ...data,
        templateId: data.templateId,
        priority: data.priority || 'medium',
        attachments: data.attachments || []
      }
    })
  },

  // 更新工单
  update(id, data) {
    return request({
      url: `/ticket/${id}`,
      method: 'put',
      data
    })
  },

  // 删除工单
  delete(id) {
    return request({
      url: `/ticket/${id}`,
      method: 'delete'
    })
  },

  // 批量删除
  batchDelete(ids) {
    return request({
      url: '/ticket/batch',
      method: 'delete',
      data: ids
    })
  },

  // 批量指派
  batchAssign(ticketIds, userId) {
    return request({
      url: '/ticket/batch-assign',
      method: 'post',
      data: { ticketIds, userId }
    })
  },

  // 状态流转
  changeStatus(id, status, comment) {
    return request({
      url: `/ticket/${id}/status`,
      method: 'put',
      data: { status, comment }
    })
  },

  // 获取超时工单
  getOverdue() {
    return request({
      url: '/ticket/overdue',
      method: 'get'
    })
  },

  // 导出工单
  export(params) {
    return request({
      url: '/ticket/export',
      method: 'get',
      params,
      responseType: 'blob'
    })
  },

  // 获取工单模板列表
  getTemplates() {
    return request({
      url: '/ticket/template/list',
      method: 'get'
    })
  },

  // 创建工单模板
  createTemplate(data) {
    return request({
      url: '/ticket/template',
      method: 'post',
      data
    })
  }
}

// 工单模板API
export const ticketTemplateApi = {
  // 获取模板列表
  list() {
    return request({
      url: '/ticket/template/list',
      method: 'get'
    })
  },

  // 获取模板详情
  get(id) {
    return request({
      url: `/ticket/template/${id}`,
      method: 'get'
    })
  },

  // 创建模板
  create(data) {
    return request({
      url: '/ticket/template',
      method: 'post',
      data
    })
  },

  // 更新模板
  update(id, data) {
    return request({
      url: `/ticket/template/${id}`,
      method: 'put',
      data
    })
  },

  // 删除模板
  delete(id) {
    return request({
      url: `/ticket/template/${id}`,
      method: 'delete'
    })
  }
}
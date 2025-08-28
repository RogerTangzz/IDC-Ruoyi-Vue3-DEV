// src/api/maintenance/plan.js
import request from '@/utils/request'

export const maintenancePlanApi = {
  // 分页查询
  page(params) {
    return request({
      url: '/maintenance/plan/page',
      method: 'get',
      params: {
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 10,
        keyword: params.keyword,
        floor: params.floor,
        mopCategory: params.mopCategory,
        approvalStatus: params.approvalStatus,
        executionStatus: params.executionStatus,
        startTime: params.startTime,
        endTime: params.endTime
      }
    })
  },

  // 获取详情
  get(id) {
    return request({
      url: `/maintenance/plan/${id}`,
      method: 'get'
    })
  },

  // 新增
  create(data) {
    return request({
      url: '/maintenance/plan',
      method: 'post',
      data
    })
  },

  // 更新
  update(id, data) {
    return request({
      url: `/maintenance/plan/${id}`,
      method: 'put',
      data
    })
  },

  // 删除
  delete(id) {
    return request({
      url: `/maintenance/plan/${id}`,
      method: 'delete'
    })
  },

  // 复制上次计划
  copyLast(id) {
    return request({
      url: `/maintenance/plan/${id}/copy`,
      method: 'post'
    })
  },

  // 获取最新计划（用于复制）
  getLatest(params) {
    return request({
      url: '/maintenance/plan/latest',
      method: 'get',
      params
    })
  },

  // 提交审核
  submitApproval(id, approverId) {
    return request({
      url: `/maintenance/plan/${id}/submit`,
      method: 'post',
      data: { approverId }
    })
  },

  // 审核通过
  approve(id, comment) {
    return request({
      url: `/maintenance/plan/${id}/approve`,
      method: 'post',
      data: { comment }
    })
  },

  // 审核拒绝
  reject(id, reason) {
    return request({
      url: `/maintenance/plan/${id}/reject`,
      method: 'post',
      data: { reason }
    })
  },

  // 生成工单
  generateTicket(id) {
    return request({
      url: `/maintenance/plan/${id}/generate-ticket`,
      method: 'post'
    })
  },

  // 开始执行
  startExecution(id) {
    return request({
      url: `/maintenance/plan/${id}/start`,
      method: 'post'
    })
  },

  // 完成执行
  completeExecution(id, result) {
    return request({
      url: `/maintenance/plan/${id}/complete`,
      method: 'post',
      data: { result }
    })
  },

  // 获取即将到期的计划
  getUpcoming(hours = 48) {
    return request({
      url: '/maintenance/plan/upcoming',
      method: 'get',
      params: { hours }
    })
  },

  // 导出Excel
  export(params) {
    return request({
      url: '/maintenance/plan/export',
      method: 'get',
      params,
      responseType: 'blob'
    })
  }
}
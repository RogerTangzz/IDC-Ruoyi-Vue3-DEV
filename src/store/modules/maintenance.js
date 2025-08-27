// src/store/modules/maintenance.js
import { defineStore } from 'pinia'
import { maintenancePlanApi } from '@/api/maintenance/plan'

export const useMaintenanceStore = defineStore('maintenance', {
  state: () => ({
    // 列表数据
    planList: [],
    total: 0,
    loading: false,
    
    // 当前计划
    currentPlan: null,
    
    // 查询参数
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      keyword: '',
      floor: '',
      mopCategory: '',
      approvalStatus: '',
      executionStatus: ''
    },
    
    // 待审核数量
    pendingApprovalCount: 0,
    
    // 待执行数量
    pendingExecutionCount: 0
  }),

  getters: {
    // 获取待处理事项数
    todoCount: (state) => {
      return state.pendingApprovalCount + state.pendingExecutionCount
    },
    
    // 是否有待审核
    hasPendingApproval: (state) => {
      return state.pendingApprovalCount > 0
    }
  },

  actions: {
    // 获取计划列表
    async fetchPlanList(params = {}) {
      this.loading = true
      try {
        const mergedParams = { ...this.queryParams, ...params }
        const res = await maintenancePlanApi.page(mergedParams)
        this.planList = res.rows
        this.total = res.total
        this.queryParams = mergedParams
        
        // 更新待处理数量
        this.updatePendingCounts(res.rows)
        return res
      } finally {
        this.loading = false
      }
    },

    // 获取计划详情
    async fetchPlanDetail(id) {
      try {
        const res = await maintenancePlanApi.get(id)
        this.currentPlan = res.data
        return res.data
      } catch (error) {
        console.error('获取计划详情失败:', error)
        throw error
      }
    },

    // 创建计划
    async createPlan(data) {
      try {
        const res = await maintenancePlanApi.create(data)
        await this.fetchPlanList()
        return res
      } catch (error) {
        console.error('创建计划失败:', error)
        throw error
      }
    },

    // 更新计划
    async updatePlan(id, data) {
      try {
        const res = await maintenancePlanApi.update(id, data)
        await this.fetchPlanList()
        return res
      } catch (error) {
        console.error('更新计划失败:', error)
        throw error
      }
    },

    // 删除计划
    async deletePlan(id) {
      try {
        await maintenancePlanApi.delete(id)
        await this.fetchPlanList()
      } catch (error) {
        console.error('删除计划失败:', error)
        throw error
      }
    },

    // 复制计划
    async copyPlan(id) {
      try {
        const res = await maintenancePlanApi.copyLast(id)
        await this.fetchPlanList()
        return res.data
      } catch (error) {
        console.error('复制计划失败:', error)
        throw error
      }
    },

    // 提交审核
    async submitForApproval(id, approverId) {
      try {
        const res = await maintenancePlanApi.submitApproval(id, approverId)
        await this.fetchPlanList()
        return res
      } catch (error) {
        console.error('提交审核失败:', error)
        throw error
      }
    },

    // 更新待处理数量
    updatePendingCounts(plans) {
      this.pendingApprovalCount = plans.filter(p => p.approvalStatus === 'pending').length
      this.pendingExecutionCount = plans.filter(p => p.executionStatus === 'pending').length
    },

    // 重置状态
    reset() {
      this.planList = []
      this.currentPlan = null
      this.total = 0
      this.loading = false
      this.queryParams = {
        pageNum: 1,
        pageSize: 10
      }
    }
  }
})
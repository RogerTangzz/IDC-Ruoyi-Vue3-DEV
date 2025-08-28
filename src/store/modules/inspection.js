// src/store/modules/inspection.js
import { defineStore } from 'pinia'
import { inspectionApi, inspectionPlanApi } from '@/api/inspection'

export const useInspectionStore = defineStore('inspection', {
  state: () => ({
    // 巡检列表
    list: [],
    // 当前巡检
    current: null,
    // 加载状态
    loading: false,
    // 总数
    total: 0,
    // 查询参数
    queryParams: {
      pageNum: 1,
      pageSize: 10
    },
    // 巡检计划
    plans: [],
    // 统计数据
    statistics: {
      todayCount: 0,
      weekCount: 0,
      monthCount: 0,
      anomalyRate: 0,
      completionRate: 0
    }
  }),

  getters: {
    // 获取当前巡检
    currentInspection: (state) => state.current,
    
    // 是否有数据
    hasData: (state) => state.list.length > 0,
    
    // 根据ID获取巡检
    getInspectionById: (state) => (id) => {
      return state.list.find(item => item.id === id)
    },
    
    // 获取启用的计划
    activePlans: (state) => {
      return state.plans.filter(plan => plan.enabled)
    },
    
    // 今日待巡检
    todayPendingInspections: (state) => {
      const today = new Date().toISOString().split('T')[0]
      return state.plans.filter(plan => {
        return plan.enabled && plan.nextExecutionDate === today
      })
    }
  },

  actions: {
    // 获取列表
    async fetchList(params = {}) {
      this.loading = true
      try {
        const mergedParams = { ...this.queryParams, ...params }
        const res = await inspectionApi.page(mergedParams)
        this.list = res.rows
        this.total = res.total
        this.queryParams = mergedParams
        return res
      } catch (error) {
        console.error('获取巡检列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取详情
    async fetchDetail(id) {
      try {
        const res = await inspectionApi.get(id)
        this.current = res.data
        return res.data
      } catch (error) {
        console.error('获取巡检详情失败:', error)
        throw error
      }
    },

    // 创建巡检
    async create(data) {
      try {
        const res = await inspectionApi.create(data)
        await this.fetchList()
        return res
      } catch (error) {
        console.error('创建巡检失败:', error)
        throw error
      }
    },

    // 更新巡检
    async update(id, data) {
      try {
        const res = await inspectionApi.update(id, data)
        // 更新本地数据
        const index = this.list.findIndex(item => item.id === id)
        if (index !== -1) {
          this.list[index] = { ...this.list[index], ...data }
        }
        if (this.current?.id === id) {
          this.current = { ...this.current, ...data }
        }
        return res
      } catch (error) {
        console.error('更新巡检失败:', error)
        throw error
      }
    },

    // 删除巡检
    async delete(id) {
      try {
        await inspectionApi.delete(id)
        this.list = this.list.filter(item => item.id !== id)
        if (this.current?.id === id) {
          this.current = null
        }
        this.total--
      } catch (error) {
        console.error('删除巡检失败:', error)
        throw error
      }
    },

    // 获取巡检计划
    async fetchPlans() {
      try {
        const res = await inspectionPlanApi.list()
        this.plans = res.data
        return res.data
      } catch (error) {
        console.error('获取巡检计划失败:', error)
        throw error
      }
    },

    // 获取统计数据
    async fetchStatistics() {
      try {
        // 这里应该调用实际的统计API
        // const res = await inspectionApi.getStatistics()
        // this.statistics = res.data
        
        // 模拟数据
        this.statistics = {
          todayCount: 4,
          weekCount: 28,
          monthCount: 120,
          anomalyRate: 12.5,
          completionRate: 98.5
        }
        
        return this.statistics
      } catch (error) {
        console.error('获取统计数据失败:', error)
        throw error
      }
    },

    // 重置状态
    reset() {
      this.list = []
      this.current = null
      this.loading = false
      this.total = 0
      this.queryParams = {
        pageNum: 1,
        pageSize: 10
      }
      this.plans = []
      this.statistics = {
        todayCount: 0,
        weekCount: 0,
        monthCount: 0,
        anomalyRate: 0,
        completionRate: 0
      }
    }
  }
})
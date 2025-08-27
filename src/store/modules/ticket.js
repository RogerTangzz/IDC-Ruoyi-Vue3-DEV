// src/store/modules/ticket.js
import { defineStore } from 'pinia'
import { ticketApi } from '@/api/ticket'

export const useTicketStore = defineStore('ticket', {
  state: () => ({
    // 列表数据
    list: [],
    // 当前工单
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
    // 超时工单
    overdueTickets: [],
    // 工单模板
    templates: []
  }),

  getters: {
    // 获取当前工单
    currentTicket: (state) => state.current,
    
    // 是否有数据
    hasData: (state) => state.list.length > 0,
    
    // 根据ID获取工单
    getTicketById: (state) => (id) => {
      return state.list.find(item => item.id === id)
    },
    
    // 统计数据
    statistics: (state) => {
      return {
        total: state.total,
        pending: state.list.filter(t => t.status === 'pending').length,
        processing: state.list.filter(t => t.status === 'processing').length,
        completed: state.list.filter(t => t.status === 'completed').length,
        overdue: state.overdueTickets.length
      }
    }
  },

  actions: {
    // 获取列表
    async fetchList(params = {}) {
      this.loading = true
      try {
        const mergedParams = { ...this.queryParams, ...params }
        const res = await ticketApi.page(mergedParams)
        this.list = res.rows
        this.total = res.total
        this.queryParams = mergedParams
        return res
      } catch (error) {
        console.error('获取工单列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取详情
    async fetchDetail(id) {
      try {
        const res = await ticketApi.get(id)
        this.current = res.data
        return res.data
      } catch (error) {
        console.error('获取工单详情失败:', error)
        throw error
      }
    },

    // 创建工单
    async create(data) {
      try {
        const res = await ticketApi.create(data)
        await this.fetchList()
        return res
      } catch (error) {
        console.error('创建工单失败:', error)
        throw error
      }
    },

    // 更新工单
    async update(id, data) {
      try {
        const res = await ticketApi.update(id, data)
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
        console.error('更新工单失败:', error)
        throw error
      }
    },

    // 改变状态
    async changeStatus(id, status, comment) {
      try {
        const res = await ticketApi.changeStatus(id, status, comment)
        await this.fetchList()
        return res
      } catch (error) {
        console.error('改变工单状态失败:', error)
        throw error
      }
    },

    // 删除工单
    async delete(id) {
      try {
        await ticketApi.delete(id)
        this.list = this.list.filter(item => item.id !== id)
        if (this.current?.id === id) {
          this.current = null
        }
        this.total--
      } catch (error) {
        console.error('删除工单失败:', error)
        throw error
      }
    },

    // 获取超时工单
    async fetchOverdueTickets() {
      try {
        const res = await ticketApi.getOverdue()
        this.overdueTickets = res.data
        return res.data
      } catch (error) {
        console.error('获取超时工单失败:', error)
        throw error
      }
    },

    // 获取工单模板
    async fetchTemplates() {
      try {
        const res = await ticketApi.getTemplates()
        this.templates = res.data
        return res.data
      } catch (error) {
        console.error('获取工单模板失败:', error)
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
      this.overdueTickets = []
      this.templates = []
    }
  }
})
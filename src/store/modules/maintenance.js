import { defineStore } from 'pinia'
import { maintenanceApi } from '@/api/business/maintenance'

export const useMaintenanceStore = defineStore('maintenance', {
  state: () => ({
    list: [],
    loading: false,
    total: 0
  }),

  actions: {
    async fetchList(params = {}) {
      this.loading = true
      try {
        const res = await maintenanceApi.page(params)
        this.list = res.rows
        this.total = res.total
        return res
      } finally {
        this.loading = false
      }
    }
  }
})
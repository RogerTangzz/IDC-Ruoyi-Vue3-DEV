import request from '@/utils/request'

// maintenanceAPI
export const maintenanceApi = {
  // 分页查询
  page(params) {
    return request({
      url: '/business/maintenance/page',
      method: 'get',
      params
    })
  },

  // 获取详情
  get(id) {
    return request({
      url: `/business/maintenance/${id}`,
      method: 'get'
    })
  },

  // 新增
  create(data) {
    return request({
      url: '/business/maintenance',
      method: 'post',
      data
    })
  },

  // 更新
  update(id, data) {
    return request({
      url: `/business/maintenance/${id}`,
      method: 'put',
      data
    })
  },

  // 删除
  delete(id) {
    return request({
      url: `/business/maintenance/${id}`,
      method: 'delete'
    })
  }
}
// src/router/config.js
// 功能开发状态配置
export const featureStatus = {
  ticket: {
    list: true,      // 已完成
    create: true,    // 已完成
    edit: true,      // 已完成
    detail: false,   // 开发中
    template: false  // 开发中
  },
  inspection: {
    list: true,      // 已完成
    create: true,    // 已完成
    edit: true,      // 已完成
    detail: true,    // 已完成
    plan: false,     // 开发中
    config: false,   // 开发中
    statistics: false // 开发中
  },
  maintenance: {
    list: true,      // 已完成
    create: true,    // 已完成
    edit: true,      // 已完成
    detail: false    // 开发中
  },
  asset: {
    enabled: false   // 整个模块未开发
  }
}

// 根据开发状态过滤路由
export function filterRoutes(routes, module) {
  const status = featureStatus[module]
  if (!status || status.enabled === false) {
    // 如果整个模块未开发，返回占位路由
    return [{
      path: `/${module}`,
      component: () => import('@/layout'),
      children: [{
        path: '',
        component: () => import('@/views/placeholder/index'),
        meta: { title: `${module}管理` }
      }]
    }]
  }
  
  // 过滤子路由
  return routes.map(route => ({
    ...route,
    children: route.children?.filter(child => {
      const childName = child.name?.toLowerCase()
      const feature = childName?.replace(module, '').toLowerCase()
      return status[feature] !== false
    })
  }))
}
// src/router/dynamic-loader.js
import { featureFlags } from '@/utils/feature-flags'

/**
 * 动态路由加载器
 */
export class DynamicRouteLoader {
  constructor() {
    this.routes = []
  }

  // 加载工单模块路由
  loadTicketRoutes() {
    const routes = {
      path: '/ticket',
      component: () => import('@/layout'),
      redirect: '/ticket/list',
      name: 'Ticket',
      meta: { title: '工单管理', icon: 'tickets' },
      children: [
        {
          path: 'list',
          name: 'TicketList',
          component: () => import('@/views/ticket/index'),
          meta: { title: '工单列表', icon: 'list' }
        },
        {
          path: 'create',
          name: 'TicketCreate',
          component: () => import('@/views/ticket/form'),
          meta: { title: '新建工单', icon: 'plus' }
        },
        {
          path: 'edit/:id',
          name: 'TicketEdit',
          component: () => import('@/views/ticket/form'),
          meta: { title: '编辑工单', noCache: true },
          hidden: true
        }
      ]
    }

    // 根据功能开关动态添加路由
    if (featureFlags.isEnabled('ticket_detail')) {
      routes.children.push({
        path: 'detail/:id',
        name: 'TicketDetail',
        component: () => import('@/views/ticket/detail'),
        meta: { title: '工单详情', noCache: true },
        hidden: true
      })
    }

    if (featureFlags.isEnabled('ticket_template')) {
      routes.children.push({
        path: 'template',
        name: 'TicketTemplate',
        component: () => import('@/views/ticket/template'),
        meta: { title: '工单模板', icon: 'template' }
      })
    }

    if (featureFlags.isEnabled('ticket_statistics')) {
      routes.children.push({
        path: 'statistics',
        name: 'TicketStatistics',
        component: () => import('@/views/ticket/statistics'),
        meta: { title: '统计分析', icon: 'chart' }
      })
    }

    return routes
  }

  // 加载巡检模块路由
  loadInspectionRoutes() {
    const routes = {
      path: '/inspection',
      component: () => import('@/layout'),
      redirect: '/inspection/list',
      name: 'Inspection',
      meta: { title: '巡检管理', icon: 'inspection' },
      children: [
        {
          path: 'list',
          name: 'InspectionList',
          component: () => import('@/views/inspection/index'),
          meta: { title: '巡检记录', icon: 'list' }
        },
        {
          path: 'create',
          name: 'InspectionCreate',
          component: () => import('@/views/inspection/create'),
          meta: { title: '新建巡检', icon: 'plus' }
        },
        {
          path: 'edit/:id',
          name: 'InspectionEdit',
          component: () => import('@/views/inspection/create'),
          meta: { title: '编辑巡检', noCache: true },
          hidden: true
        }
      ]
    }

    // 条件加载
    if (featureFlags.isEnabled('inspection_plan')) {
      routes.children.push({
        path: 'plan',
        name: 'InspectionPlan',
        component: () => import('@/views/inspection/plan'),
        meta: { title: '巡检计划', icon: 'calendar' }
      })
    }

    if (featureFlags.isEnabled('inspection_config')) {
      routes.children.push({
        path: 'config',
        name: 'InspectionConfig',
        component: () => import('@/views/inspection/config'),
        meta: { title: '巡检配置', icon: 'setting' }
      })
    }

    return routes
  }

  // 加载资产模块路由
  loadAssetRoutes() {
    // 如果整个模块未启用，返回占位路由
    if (!featureFlags.isEnabled('asset_module')) {
      return {
        path: '/asset',
        component: () => import('@/layout'),
        children: [{
          path: '',
          component: () => import('@/views/placeholder/index'),
          meta: { title: '资产管理（开发中）', icon: 'asset' }
        }]
      }
    }

    // 正常加载资产路由
    return {
      path: '/asset',
      component: () => import('@/layout'),
      redirect: '/asset/list',
      name: 'Asset',
      meta: { title: '资产管理', icon: 'asset' },
      children: [
        {
          path: 'list',
          name: 'AssetList',
          component: () => import('@/views/asset/index'),
          meta: { title: '资产列表', icon: 'list' }
        }
        // ... 其他资产路由
      ]
    }
  }

  // 加载所有动态路由
  loadAllRoutes() {
    const routes = []
    
    // 始终加载的模块
    routes.push(this.loadTicketRoutes())
    routes.push(this.loadInspectionRoutes())
    
    // 条件加载的模块
    if (featureFlags.anyEnabled('asset_module')) {
      routes.push(this.loadAssetRoutes())
    }
    
    return routes
  }
}
// src/router/temp-routes.js
// 临时路由配置 - 只包含已完成的功能
import Layout from '@/layout'

export default [
  // 工单管理（已完成）
  {
    path: '/ticket',
    component: Layout,
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
  },
  
  // 巡检管理（已完成）
  {
    path: '/inspection',
    component: Layout,
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
  },
  
  // 维保计划（已完成）
  {
    path: '/maintenance',
    component: Layout,
    redirect: '/maintenance/plan',
    name: 'Maintenance',
    meta: { title: '维保管理', icon: 'maintenance' },
    children: [
      {
        path: 'plan',
        name: 'MaintenancePlanList',
        component: () => import('@/views/maintenance/plan/index'),
        meta: { title: '维保计划', icon: 'list' }
      },
      {
        path: 'plan/create',
        name: 'MaintenancePlanCreate',
        component: () => import('@/views/maintenance/plan/form'),
        meta: { title: '新建计划', icon: 'plus' }
      },
      {
        path: 'plan/edit/:id',
        name: 'MaintenancePlanEdit',
        component: () => import('@/views/maintenance/plan/form'),
        meta: { title: '编辑计划', noCache: true },
        hidden: true
      }
    ]
  }
]
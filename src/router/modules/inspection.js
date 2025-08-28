import Layout from '@/layout'

export default {
  path: '/inspection',
  component: Layout,
  redirect: '/inspection/list',
  name: 'Inspection',
  meta: { title: '巡检管理', icon: 'clipboard' },
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
      meta: { title: '新建巡检', icon: 'edit' },
      hidden: true
    },
    {
      path: 'edit/:id',
      name: 'InspectionEdit',
      component: () => import('@/views/inspection/create'),
      meta: { title: '编辑巡检', noCache: true },
      hidden: true
    },
    {
      path: 'detail/:id',
      name: 'InspectionDetail',
      component: () => import('@/views/inspection/detail'),
      meta: { title: '巡检详情', noCache: true },
      hidden: true
    },
    {
      path: 'plan',
      name: 'InspectionPlan',
      component: () => import('@/views/inspection/plan'),
      meta: { title: '巡检计划', icon: 'calendar' }
    },
    {
      path: 'statistics',
      name: 'InspectionStatistics',
      component: () => import('@/views/inspection/statistics'),
      meta: { title: '统计分析', icon: 'chart' }
    }
  ]
}
import Layout from '@/layout/index.vue'

export default {
  path: '/inspection',
  component: Layout,
  redirect: '/inspection/list',
  name: 'Inspection',
  meta: { title: '宸℃绠＄悊', icon: 'clipboard' },
  children: [
    {
      path: 'list',
      name: 'InspectionList',
      component: () => import('@/views/inspection/index'),
      meta: { title: '宸℃璁板綍', icon: 'list' }
    },
    {
      path: 'create',
      name: 'InspectionCreate',
      component: () => import('@/views/inspection/create'),
      meta: { title: '鏂板缓宸℃', icon: 'edit' },
      hidden: true
    },
    {
      path: 'edit/:id',
      name: 'InspectionEdit',
      component: () => import('@/views/inspection/create'),
      meta: { title: '缂栬緫宸℃', noCache: true },
      hidden: true
    },
    {
      path: 'detail/:id',
      name: 'InspectionDetail',
      component: () => import('@/views/inspection/detail'),
      meta: { title: '宸℃璇︽儏', noCache: true },
      hidden: true
    },
    {
      path: 'plan',
      name: 'InspectionPlan',
      component: () => import('@/views/inspection/plan'),
      meta: { title: '宸℃璁″垝', icon: 'calendar' }
    },
    {
      path: 'statistics',
      name: 'InspectionStatistics',
      component: () => import('@/views/inspection/statistics'),
      meta: { title: '缁熻鍒嗘瀽', icon: 'chart' }
    }
  ]
}


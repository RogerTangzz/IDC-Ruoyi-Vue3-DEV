// src/router/modules/maintenance.js
import Layout from '@/layout/index.vue'

export default {
  path: '/maintenance',
  component: Layout,
  redirect: '/maintenance/plan',
  name: 'Maintenance',
  meta: { 
    title: '缁翠繚璁″垝',
    icon: 'setting',
    perms: ['maintenance:view']
  },
  children: [
    {
      path: 'plan',
      name: 'MaintenancePlanList',
      component: () => import('@/views/maintenance/plan/index'),
      meta: { 
        title: '璁″垝鍒楄〃',
        icon: 'list',
        perms: ['maintenance:list']
      }
    },
    {
      path: 'plan/add',
      name: 'MaintenancePlanAdd',
      component: () => import('@/views/maintenance/plan/form'),
      meta: { 
        title: '鏂板缓璁″垝',
        icon: 'plus',
        perms: ['maintenance:add']
      },
      hidden: true
    },
    {
      path: 'plan/edit/:id',
      name: 'MaintenancePlanEdit',
      component: () => import('@/views/maintenance/plan/form'),
      meta: { 
        title: '缂栬緫璁″垝',
        noCache: true,
        perms: ['maintenance:edit']
      },
      hidden: true
    },
    {
      path: 'plan/detail/:id',
      name: 'MaintenancePlanDetail',
      component: () => import('@/views/maintenance/plan/detail'),
      meta: { 
        title: '璁″垝璇︽儏',
        noCache: true,
        perms: ['maintenance:view']
      },
      hidden: true
    },
    {
      path: 'plan/submit/:id',
      name: 'MaintenancePlanSubmit',
      component: () => import('@/views/maintenance/plan/submit'),
      meta: { 
        title: '鎻愪氦瀹℃牳',
        noCache: true,
        perms: ['maintenance:submit']
      },
      hidden: true
    },
    {
      path: 'execution',
      name: 'MaintenanceExecution',
      component: () => import('@/views/maintenance/execution/index'),
      meta: { 
        title: '鎵ц璁板綍',
        icon: 'document',
        perms: ['maintenance:execution']
      }
    }
  ]
}


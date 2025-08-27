// src/router/modules/maintenance.js
export default {
  path: '/maintenance',
  component: Layout,
  redirect: '/maintenance/plan',
  meta: { 
    title: '维保计划',
    icon: 'setting',
    perms: ['maintenance:view']
  },
  children: [
    {
      path: 'plan',
      name: 'MaintenancePlanList',
      component: () => import('@/views/maintenance/plan/index'),
      meta: { 
        title: '计划列表',
        perms: ['maintenance:list']
      }
    },
    {
      path: 'plan/add',
      name: 'MaintenancePlanAdd',
      component: () => import('@/views/maintenance/plan/form'),
      meta: { 
        title: '新建计划',
        perms: ['maintenance:add']
      },
      hidden: true
    },
    {
      path: 'plan/edit/:id',
      name: 'MaintenancePlanEdit',
      component: () => import('@/views/maintenance/plan/form'),
      meta: { 
        title: '编辑计划',
        perms: ['maintenance:edit']
      },
      hidden: true
    },
    {
      path: 'plan/detail/:id',
      name: 'MaintenancePlanDetail',
      component: () => import('@/views/maintenance/plan/detail'),
      meta: { 
        title: '计划详情',
        perms: ['maintenance:view']
      },
      hidden: true
    },
    {
      path: 'plan/submit/:id',
      name: 'MaintenancePlanSubmit',
      component: () => import('@/views/maintenance/plan/submit'),
      meta: { 
        title: '提交审核',
        perms: ['maintenance:submit']
      },
      hidden: true
    },
    {
      path: 'execution',
      name: 'MaintenanceExecution',
      component: () => import('@/views/maintenance/execution/index'),
      meta: { 
        title: '执行记录',
        perms: ['maintenance:execution']
      }
    }
  ]
}
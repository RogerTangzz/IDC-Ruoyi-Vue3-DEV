import { createWebHistory, createRouter } from 'vue-router'
/* Layout */
import Layout from '@/layout'

// 公共路由
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register'),
    hidden: true
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import('@/views/error/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/index'),
        name: 'Index',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile/:activeTab?',
        component: () => import('@/views/system/user/profile/index'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  },
  // 工单模块路由
  {
    path: '/ticket',
    component: Layout,
    redirect: '/ticket/list',
    name: 'Ticket',
    meta: { title: '工单管理', icon: 'document' },
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
        component: () => import('@/views/ticket/create'),
        meta: { title: '创建工单', icon: 'edit' },
        hidden: true
      },
      {
        path: 'detail/:id',
        name: 'TicketDetail',
        component: () => import('@/views/ticket/detail'),
        meta: { title: '工单详情', noCache: true },
        hidden: true
      },
      {
        path: 'template',
        name: 'TicketTemplate',
        component: () => import('@/views/ticket/template'),
        meta: { title: '工单模板', icon: 'template' }
      }
    ]
  },
  // 巡检模块路由 - 注意这里是独立的对象，不是嵌套在工单模块里
  {
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
]

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes = [
  {
    path: '/system/user-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:user:edit'],
    children: [
      {
        path: 'role/:userId(\\d+)',
        component: () => import('@/views/system/user/authRole'),
        name: 'AuthRole',
        meta: { title: '分配角色', activeMenu: '/system/user' }
      }
    ]
  },
  {
    path: '/system/role-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:role:edit'],
    children: [
      {
        path: 'user/:roleId(\\d+)',
        component: () => import('@/views/system/role/authUser'),
        name: 'AuthUser',
        meta: { title: '分配用户', activeMenu: '/system/role' }
      }
    ]
  },
  {
    path: '/system/dict-data',
    component: Layout,
    hidden: true,
    permissions: ['system:dict:list'],
    children: [
      {
        path: 'index/:dictId(\\d+)',
        component: () => import('@/views/system/dict/data'),
        name: 'Data',
        meta: { title: '字典数据', activeMenu: '/system/dict' }
      }
    ]
  },
  {
    path: '/monitor/job-log',
    component: Layout,
    hidden: true,
    permissions: ['monitor:job:list'],
    children: [
      {
        path: 'index/:jobId(\\d+)',
        component: () => import('@/views/monitor/job/log'),
        name: 'JobLog',
        meta: { title: '调度日志', activeMenu: '/monitor/job' }
      }
    ]
  },
  {
    path: '/tool/gen-edit',
    component: Layout,
    hidden: true,
    permissions: ['tool:gen:edit'],
    children: [
      {
        path: 'index/:tableId(\\d+)',
        component: () => import('@/views/tool/gen/editTable'),
        name: 'GenEdit',
        meta: { title: '修改生成配置', activeMenu: '/tool/gen' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

export default router
// src/router/index.js
import { createWebHistory, createRouter } from 'vue-router'
/* Layout */
import Layout from '@/layout'

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

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
    path: '/404',
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
        path: 'profile',
        component: () => import('@/views/system/user/profile/index'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  },
  // ========== IDC运维管理系统业务路由 ==========
  // 工单管理
  {
    path: '/ticket',
    component: Layout,
    redirect: '/ticket/list',
    name: 'Ticket',
    meta: { title: '工单管理', icon: 'edit' },
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
        path: 'edit/:id(\\d+)',
        name: 'TicketEdit',
        component: () => import('@/views/ticket/form'),
        meta: { title: '编辑工单', noCache: true },
        hidden: true
      },
      {
        path: 'detail/:id(\\d+)',
        name: 'TicketDetail',
        component: () => import('@/views/ticket/detail'),
        meta: { title: '工单详情', noCache: true },
        hidden: true
      },
      {
        path: 'template',
        name: 'TicketTemplate',
        component: () => import('@/views/ticket/template'),
        meta: { title: '工单模板', icon: 'dict' }
      }
    ]
  },
  // 巡检管理
  {
    path: '/inspection',
    component: Layout,
    redirect: '/inspection/list',
    name: 'Inspection',
    meta: { title: '巡检管理', icon: 'search' },
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
        path: 'edit/:id(\\d+)',
        name: 'InspectionEdit',
        component: () => import('@/views/inspection/create'),
        meta: { title: '编辑巡检', noCache: true },
        hidden: true
      },
      {
        path: 'detail/:id(\\d+)',
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
      }
    ]
  },
  // 维保计划
  {
    path: '/maintenance',
    component: Layout,
    redirect: '/maintenance/plan',
    name: 'Maintenance',
    meta: { title: '维保管理', icon: 'tool' },
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
        path: 'plan/edit/:id(\\d+)',
        name: 'MaintenancePlanEdit',
        component: () => import('@/views/maintenance/plan/form'),
        meta: { title: '编辑计划', noCache: true },
        hidden: true
      },
      {
        path: 'approval',
        name: 'MaintenanceApproval',
        component: () => import('@/views/maintenance/approval'),
        meta: { title: '待审批', icon: 'checkbox' }
      },
      {
        path: 'execution',
        name: 'MaintenanceExecution',
        component: () => import('@/views/maintenance/execution'),
        meta: { title: '执行记录', icon: 'document' }
      }
    ]
  },
  // 资产管理
  {
    path: '/asset',
    component: Layout,
    redirect: '/asset/list',
    name: 'Asset',
    meta: { title: '资产管理', icon: 'shopping' },
    children: [
      {
        path: 'list',
        name: 'AssetList',
        component: () => import('@/views/asset/index'),
        meta: { title: '资产台账', icon: 'list' }
      },
      {
        path: 'add',
        name: 'AssetAdd',
        component: () => import('@/views/asset/form'),
        meta: { title: '新增资产', icon: 'plus' }
      },
      {
        path: 'edit/:id(\\d+)',
        name: 'AssetEdit',
        component: () => import('@/views/asset/form'),
        meta: { title: '编辑资产', noCache: true },
        hidden: true
      },
      {
        path: 'detail/:id(\\d+)',
        name: 'AssetDetail',
        component: () => import('@/views/asset/detail'),
        meta: { title: '资产详情', noCache: true },
        hidden: true
      },
      {
        path: 'borrow',
        name: 'AssetBorrow',
        component: () => import('@/views/asset/borrow'),
        meta: { title: '借用管理', icon: 'peoples' }
      }
    ]
  },
  // 知识库
  {
    path: '/knowledge',
    component: Layout,
    redirect: '/knowledge/list',
    name: 'Knowledge',
    meta: { title: '知识库', icon: 'documentation' },
    children: [
      {
        path: 'list',
        name: 'KnowledgeList',
        component: () => import('@/views/knowledge/index'),
        meta: { title: '知识列表', icon: 'list' }
      },
      {
        path: 'create',
        name: 'KnowledgeCreate',
        component: () => import('@/views/knowledge/form'),
        meta: { title: '新建知识', icon: 'plus' }
      },
      {
        path: 'edit/:id(\\d+)',
        name: 'KnowledgeEdit',
        component: () => import('@/views/knowledge/form'),
        meta: { title: '编辑知识', noCache: true },
        hidden: true
      },
      {
        path: 'detail/:id(\\d+)',
        name: 'KnowledgeDetail',
        component: () => import('@/views/knowledge/detail'),
        meta: { title: '知识详情', noCache: true },
        hidden: true
      },
      {
        path: 'tag',
        name: 'KnowledgeTag',
        component: () => import('@/views/knowledge/tag'),
        meta: { title: '标签管理', icon: 'tag' }
      }
    ]
  },
  // 通知中心
  {
    path: '/notification',
    component: Layout,
    redirect: '/notification/list',
    name: 'Notification',
    meta: { title: '通知中心', icon: 'message' },
    children: [
      {
        path: 'list',
        name: 'NotificationList',
        component: () => import('@/views/notification/index'),
        meta: { title: '通知列表', icon: 'list' }
      },
      {
        path: 'publish',
        name: 'NotificationPublish',
        component: () => import('@/views/notification/publish'),
        meta: { title: '发布通知', icon: 'edit' }
      },
      {
        path: 'message',
        name: 'MessageCenter',
        component: () => import('@/views/notification/message'),
        meta: { title: '消息中心', icon: 'email' }
      }
    ]
  },
  // 审批中心
  {
    path: '/approval',
    component: Layout,
    redirect: '/approval/pending',
    name: 'Approval',
    meta: { title: '审批中心', icon: 'checkbox' },
    children: [
      {
        path: 'pending',
        name: 'ApprovalPending',
        component: () => import('@/views/approval/pending'),
        meta: { title: '待审批', icon: 'time' }
      },
      {
        path: 'history',
        name: 'ApprovalHistory',
        component: () => import('@/views/approval/history'),
        meta: { title: '审批记录', icon: 'document' }
      },
      {
        path: 'apply',
        name: 'ApprovalApply',
        component: () => import('@/views/approval/apply'),
        meta: { title: '我的申请', icon: 'user' }
      }
    ]
  },
  // 报表统计
  {
    path: '/report',
    component: Layout,
    redirect: '/report/overview',
    name: 'Report',
    meta: { title: '报表统计', icon: 'chart' },
    children: [
      {
        path: 'overview',
        name: 'ReportOverview',
        component: () => import('@/views/report/overview'),
        meta: { title: '数据总览', icon: 'dashboard' }
      },
      {
        path: 'ticket',
        name: 'ReportTicket',
        component: () => import('@/views/report/ticket'),
        meta: { title: '工单统计', icon: 'chart' }
      },
      {
        path: 'inspection',
        name: 'ReportInspection',
        component: () => import('@/views/report/inspection'),
        meta: { title: '巡检统计', icon: 'chart' }
      },
      {
        path: 'maintenance',
        name: 'ReportMaintenance',
        component: () => import('@/views/report/maintenance'),
        meta: { title: '维保统计', icon: 'chart' }
      },
      {
        path: 'asset',
        name: 'ReportAsset',
        component: () => import('@/views/report/asset'),
        meta: { title: '资产统计', icon: 'chart' }
      }
    ]
  }
]

// 动态路由（需要权限控制的路由）
export const dynamicRoutes = [
  // 系统管理
  {
    path: '/system',
    component: Layout,
    hidden: false,
    redirect: 'noRedirect',
    alwaysShow: true,
    name: 'System',
    meta: { title: '系统管理', icon: 'system', roles: ['admin'] },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user/index'),
        name: 'User',
        meta: { title: '用户管理', icon: 'user' }
      },
      {
        path: 'role',
        component: () => import('@/views/system/role/index'),
        name: 'Role',
        meta: { title: '角色管理', icon: 'peoples' }
      },
      {
        path: 'menu',
        component: () => import('@/views/system/menu/index'),
        name: 'Menu',
        meta: { title: '菜单管理', icon: 'tree-table' }
      },
      {
        path: 'dept',
        component: () => import('@/views/system/dept/index'),
        name: 'Dept',
        meta: { title: '部门管理', icon: 'tree' }
      },
      {
        path: 'post',
        component: () => import('@/views/system/post/index'),
        name: 'Post',
        meta: { title: '岗位管理', icon: 'post' }
      },
      {
        path: 'dict',
        component: () => import('@/views/system/dict/index'),
        name: 'Dict',
        meta: { title: '字典管理', icon: 'dict' }
      },
      {
        path: 'config',
        component: () => import('@/views/system/config/index'),
        name: 'Config',
        meta: { title: '参数设置', icon: 'edit' }
      },
      {
        path: 'notice',
        component: () => import('@/views/system/notice/index'),
        name: 'Notice',
        meta: { title: '通知公告', icon: 'message' }
      },
      {
        path: 'log',
        component: () => import('@/views/monitor/operlog/index'),
        name: 'Log',
        meta: { title: '日志管理', icon: 'log', alwaysShow: true },
        children: [
          {
            path: 'operlog',
            component: () => import('@/views/monitor/operlog/index'),
            name: 'Operlog',
            meta: { title: '操作日志', icon: 'form' }
          },
          {
            path: 'logininfor',
            component: () => import('@/views/monitor/logininfor/index'),
            name: 'Logininfor',
            meta: { title: '登录日志', icon: 'logininfor' }
          }
        ]
      }
    ]
  },
  // 系统监控
  {
    path: '/monitor',
    component: Layout,
    hidden: false,
    redirect: 'noRedirect',
    alwaysShow: true,
    name: 'Monitor',
    meta: { title: '系统监控', icon: 'monitor', roles: ['admin'] },
    children: [
      {
        path: 'online',
        component: () => import('@/views/monitor/online/index'),
        name: 'Online',
        meta: { title: '在线用户', icon: 'online' }
      },
      {
        path: 'job',
        component: () => import('@/views/monitor/job/index'),
        name: 'Job',
        meta: { title: '定时任务', icon: 'job' }
      },
      {
        path: 'druid',
        component: () => import('@/views/monitor/druid/index'),
        name: 'Druid',
        meta: { title: '数据监控', icon: 'druid' }
      },
      {
        path: 'server',
        component: () => import('@/views/monitor/server/index'),
        name: 'Server',
        meta: { title: '服务监控', icon: 'server' }
      },
      {
        path: 'cache',
        component: () => import('@/views/monitor/cache/index'),
        name: 'Cache',
        meta: { title: '缓存监控', icon: 'redis' }
      },
      {
        path: 'cacheList',
        component: () => import('@/views/monitor/cache/list'),
        name: 'CacheList',
        meta: { title: '缓存列表', icon: 'redis-list' }
      }
    ]
  },
  // 隐藏的权限路由
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
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
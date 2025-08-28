// src/router/modules/ticket.js
export default [
  {
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
      // 暂时注释掉未开发的页面
      // {
      //   path: 'detail/:id',
      //   name: 'TicketDetail',
      //   component: () => import('@/views/ticket/detail'),
      //   meta: { title: '工单详情', noCache: true },
      //   hidden: true
      // },
      // {
      //   path: 'template',
      //   name: 'TicketTemplate',
      //   component: () => import('@/views/ticket/template'),
      //   meta: { title: '工单模板', icon: 'template' }
      // }
    ]
  }
]
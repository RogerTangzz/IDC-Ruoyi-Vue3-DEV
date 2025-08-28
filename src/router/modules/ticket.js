import Layout from '@/layout'

export default {
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
}
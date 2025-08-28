import Layout from '@/layout'

export default {
  path: '/asset',
  component: Layout,
  redirect: '/asset/list',
  name: 'Asset',
  meta: { title: '资产管理', icon: 'box' },
  children: [
    {
      path: 'list',
      name: 'AssetList',
      component: () => import('@/views/asset/index'),
      meta: { title: '资产列表', icon: 'list' }
    },
    {
      path: 'add',
      name: 'AssetAdd',
      component: () => import('@/views/asset/form'),
      meta: { title: '新增资产', icon: 'plus' },
      hidden: true
    },
    {
      path: 'edit/:id',
      name: 'AssetEdit',
      component: () => import('@/views/asset/form'),
      meta: { title: '编辑资产', noCache: true },
      hidden: true
    },
    {
      path: 'detail/:id',
      name: 'AssetDetail',
      component: () => import('@/views/asset/detail'),
      meta: { title: '资产详情', noCache: true },
      hidden: true
    },
    {
      path: 'borrow',
      name: 'AssetBorrow',
      component: () => import('@/views/asset/borrow'),
      meta: { title: '借用记录', icon: 'calendar' }
    }
  ]
}
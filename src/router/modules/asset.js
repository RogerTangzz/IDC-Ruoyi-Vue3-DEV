// src/router/modules/asset.js
export default [
  {
    path: '/asset',
    component: () => import('@/layout'),
    redirect: '/asset/placeholder',
    name: 'Asset',
    meta: { title: '资产管理', icon: 'asset' },
    children: [
      {
        path: 'placeholder',
        name: 'AssetPlaceholder',
        component: () => import('@/views/placeholder/asset'),
        meta: { title: '资产管理', icon: 'list' }
      }
    ]
  }
]
# IDC运维管理系统

基于 RuoYi-Vue3 框架开发的 IDC 机房运维管理系统

## 项目概述

本系统是专门为 IDC 数据中心运维管理开发的综合管理平台，旨在提升运维效率，规范巡检流程，实现故障快速响应。

## 技术栈

- 前端框架：Vue 3.5 + Element Plus 2.9 + Vite 6.0
- 状态管理：Pinia 2.3
- 路由管理：Vue Router 4
- HTTP客户端：Axios
- 开发语言：JavaScript / Vue3 Composition API
- UI组件库：Element Plus
- 构建工具：Vite

## 已完成功能模块

### 🔧 工单管理
- ✅ 工单全生命周期管理（创建、指派、处理、完成、关闭）
- ✅ 批量工单指派功能
- ✅ 工单优先级管理（高/中/低）
- ✅ 处理时限倒计时提醒
- ✅ 工单模板快速创建
- ✅ 文件附件上传（支持jpg/png/pdf）

### 🔍 巡检管理
- ✅ 多楼层巡检配置（1-4楼，共56个检查项）
- ✅ 巡检记录创建与编辑
- ✅ 巡检进度实时计算
- ✅ 异常自动检测与高亮
- ✅ 异常自动生成工单
- ✅ 复制上次巡检数据
- ✅ 现场照片上传（最多9张）

### 📋 维保计划
- ✅ 维保计划创建与管理
- ✅ 计划列表展示
- ✅ 执行记录跟踪
- ✅ 审批流程支持
- ✅ 复制计划功能

## 项目启动

```bash
# 克隆项目
git clone [your-repository-url]

# 进入项目目录
cd ruoyi-vue3

# 安装依赖
yarn install --registry=https://registry.npmmirror.com

# 启动开发服务器
yarn dev

# 访问地址
http://localhost:80
构建部署
bash# 构建测试环境
yarn build:stage

# 构建生产环境  
yarn build:prod
项目结构
src/
├── api/                  # API接口
│   ├── business/        # 业务接口
│   ├── ticket/          # 工单接口
│   ├── inspection/      # 巡检接口
│   └── maintenance/     # 维保接口
├── views/               # 页面组件
│   ├── ticket/          # 工单管理
│   ├── inspection/      # 巡检管理
│   └── maintenance/     # 维保计划
├── store/               # 状态管理
│   └── modules/         # 模块化store
├── router/              # 路由配置
│   └── modules/         # 模块化路由
└── components/          # 通用组件
开发规范
项目遵循以下开发规范文档：

CLAUDE.md - 核心开发规范 v2.0
CLAUDE-IDC.md - IDC业务扩展规范 v1.0

更新日志
详见 UPDATELOG.md
贡献指南

Fork 本仓库
创建特性分支 (git checkout -b feature/AmazingFeature)
提交更改 (git commit -m 'Add some AmazingFeature')
推送到分支 (git push origin feature/AmazingFeature)
开启 Pull Request

授权协议
本项目基于 MIT 协议开源
鸣谢

RuoYi-Vue3 - 基础框架
Element Plus - UI组件库
Vue.js - 前端框架
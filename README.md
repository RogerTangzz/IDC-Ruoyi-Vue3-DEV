# IDC运维管理系统 (IDC Operations Management System)

基于Vue3 + Element Plus + RuoYi-Vue3框架开发的IDC机房运维管理系统，提供工单管理、巡检管理、维保计划、资产管理等功能。

## 🚀 特性

- 🎯 **工单管理** - 完整的工单生命周期管理，自动升级机制
- 🔍 **巡检管理** - 56项巡检点配置，异常自动生成工单，完成率统计分析
- 📅 **维保计划** - 定期维护计划管理，自动提醒
- 📦 **资产管理** - 设备资产全生命周期管理
- 📊 **数据分析** - 多维度统计分析，决策支持
- 📱 **移动适配** - 支持移动端巡检录入

## 📋 系统要求

- Node.js >= 20.19.0
- Yarn >= 1.22.0
- Git

## 🔧 安装部署

### 1. 克隆项目
```bashgit clone https://github.com/RogerTangzz/IDC-Ruoyi-Vue3-DEV.git
cd IDC-Ruoyi-Vue3-DEV

### 2. 安装依赖
```bashyarn install

### 3. 配置环境变量
复制环境变量模板并修改配置：
```bashcp .env.example .env.development

### 4. 启动开发服务器
```bashyarn dev

### 5. 构建生产版本
```bashyarn build

## 📁 项目结构src/
├── api/              # API接口
├── assets/           # 静态资源
├── components/       # 通用组件
├── directive/        # 自定义指令
├── layout/           # 布局组件
├── router/           # 路由配置
├── store/            # 状态管理
├── utils/            # 工具函数
├── views/            # 页面组件
│   ├── ticket/       # 工单管理
│   ├── inspection/   # 巡检管理
│   ├── maintenance/  # 维保计划
│   └── asset/        # 资产管理
└── main.js           # 应用入口

## 📖 开发文档

- [开发规范](./CLAUDE.md) - 核心开发规范
- [业务规范](./CLAUDE-IDC.md) - IDC业务扩展规范
- [更新日志](./UPDATELOG.md) - 版本更新记录

## 🔨 开发指南

### 代码规范
项目使用ESLint + Prettier进行代码格式化，提交前请运行：
```bashyarn lint

### 提交规范
提交信息格式：<type>(<scope>): <subject>示例
feat(ticket): 添加工单导出功能
fix(inspection): 修复巡检数据保存问题
docs(readme): 更新安装说明

## 🚦 功能状态

| 模块 | 状态 | 进度 |
|------|------|------|
| 工单管理 | ✅ 已完成 | 100% |
| 巡检管理 | ✅ 已完成 | 100% |
| 维保计划 | 📅 计划中 | 0% |
| 资产管理 | 📅 计划中 | 0% |

## 📄 许可证

[MIT License](./LICENSE)
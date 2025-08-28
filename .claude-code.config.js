// .claude-code.config.js
export default {
  // 项目规范文档
  context: [
    './CLAUDE.md',
    './CLAUDE-IDC.md', 
    './.clauderc.js'
  ],
  
  // 工单模块任务定义
  tasks: {
    'ticket-module': {
      description: '创建完整的故障工单模块',
      requirements: [
        '遵循 CLAUDE-IDC.md 2.2节的工单模块规范',
        '实现完整的工单状态机',
        '包含自动升级功能',
        '支持工单模板'
      ],
      outputs: [
        'src/api/ticket/*.js',
        'src/views/ticket/**/*.vue',
        'src/components/Ticket/*.vue',
        'src/store/modules/ticket.js',
        'src/services/ticket-escalation.js'
      ]
    }
  }
}
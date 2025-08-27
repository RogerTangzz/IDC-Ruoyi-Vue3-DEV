#!/usr/bin/env node
import { program } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Scaffold {
  constructor() {
    this.config = {
      templates: {
        module: path.join(__dirname, '../templates/module'),
        component: path.join(__dirname, '../templates/component'),
        api: path.join(__dirname, '../templates/api'),
        store: path.join(__dirname, '../templates/store')
      },
      output: {
        api: 'src/api',
        views: 'src/views',
        components: 'src/components',
        store: 'src/store/modules'
      }
    };
  }

  async generateModule(name, options) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: '模块中文名称:',
        default: options.title || name
      },
      {
        type: 'input',
        name: 'domain',
        message: '业务域 (如: system, maintenance):',
        default: 'business'
      },
      {
        type: 'checkbox',
        name: 'features',
        message: '选择功能:',
        choices: ['增删改查', '导入导出', '审批流程'],
        default: ['增删改查']
      }
    ]);

    console.log(chalk.blue('⚡ 开始生成模块...'));
    
    // 生成API文件
    const apiContent = this.generateApiTemplate(name, answers);
    const apiPath = path.join(this.config.output.api, answers.domain, `${name}.js`);
    await fs.ensureDir(path.dirname(apiPath));
    await fs.writeFile(apiPath, apiContent);
    console.log(chalk.gray(`  创建: ${apiPath}`));

    // 生成页面文件
    const viewContent = this.generateViewTemplate(name, answers);
    const viewPath = path.join(this.config.output.views, name, 'index.vue');
    await fs.ensureDir(path.dirname(viewPath));
    await fs.writeFile(viewPath, viewContent);
    console.log(chalk.gray(`  创建: ${viewPath}`));

    // 生成Store文件
    const storeContent = this.generateStoreTemplate(name, answers);
    const storePath = path.join(this.config.output.store, `${name}.js`);
    await fs.ensureDir(path.dirname(storePath));
    await fs.writeFile(storePath, storeContent);
    console.log(chalk.gray(`  创建: ${storePath}`));
    
    console.log(chalk.green(`✅ 模块 ${name} 生成完成!`));
    this.printNextSteps(name, answers.domain);
  }

  generateApiTemplate(name, config) {
    return `import request from '@/utils/request'

// ${config.title}API
export const ${name}Api = {
  // 分页查询
  page(params) {
    return request({
      url: '/${config.domain}/${name}/page',
      method: 'get',
      params
    })
  },

  // 获取详情
  get(id) {
    return request({
      url: \`/${config.domain}/${name}/\${id}\`,
      method: 'get'
    })
  },

  // 新增
  create(data) {
    return request({
      url: '/${config.domain}/${name}',
      method: 'post',
      data
    })
  },

  // 更新
  update(id, data) {
    return request({
      url: \`/${config.domain}/${name}/\${id}\`,
      method: 'put',
      data
    })
  },

  // 删除
  delete(id) {
    return request({
      url: \`/${config.domain}/${name}/\${id}\`,
      method: 'delete'
    })
  }
}`;
  }

  generateViewTemplate(name, config) {
    return `<template>
  <div class="${name}-list">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="dataList">
      <el-table-column label="序号" type="index" width="55" align="center" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ${name}Api } from '@/api/${config.domain}/${name}'

const loading = ref(false)
const dataList = ref([])
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: undefined
})

const getList = async () => {
  loading.value = true
  try {
    const res = await ${name}Api.page(queryParams)
    dataList.value = res.rows
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>`;
  }

  generateStoreTemplate(name, config) {
    const storeName = name.charAt(0).toUpperCase() + name.slice(1);
    return `import { defineStore } from 'pinia'
import { ${name}Api } from '@/api/${config.domain}/${name}'

export const use${storeName}Store = defineStore('${name}', {
  state: () => ({
    list: [],
    loading: false,
    total: 0
  }),

  actions: {
    async fetchList(params = {}) {
      this.loading = true
      try {
        const res = await ${name}Api.page(params)
        this.list = res.rows
        this.total = res.total
        return res
      } finally {
        this.loading = false
      }
    }
  }
})`;
  }

  printNextSteps(name, domain) {
    console.log('\n' + chalk.yellow('📝 下一步:'));
    console.log(`  1. 在 router/index.js 中添加路由配置`);
    console.log(`  2. 运行 npm run dev 查看效果`);
  }
}

// CLI 命令
program
  .version('1.0.0')
  .description('IDC运维系统脚手架工具');

program
  .command('module <name>')
  .description('生成完整模块')
  .option('-t, --title <title>', '模块标题')
  .action((name, options) => {
    new Scaffold().generateModule(name, options);
  });

program.parse(process.argv);
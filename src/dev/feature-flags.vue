<template>
  <div class="feature-flags-manager" v-if="isDev">
    <el-card>
      <template #header>
        <span>功能开关管理（仅开发环境）</span>
      </template>
      
      <el-table :data="features" stripe>
        <el-table-column prop="name" label="功能名称" />
        <el-table-column prop="module" label="所属模块" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.enabled ? 'success' : 'info'">
              {{ scope.row.enabled ? '已启用' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-switch
              v-model="scope.row.enabled"
              @change="toggleFeature(scope.row)"
              :disabled="!canToggle"
            />
          </template>
        </el-table-column>
      </el-table>
      
      <div class="tips">
        <el-alert type="warning" :closable="false">
          注意：修改功能开关需要修改 .env.development.local 文件并重启项目
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { featureFlags } from '@/utils/feature-flags'

const isDev = import.meta.env.DEV
const canToggle = ref(false) // 需要重启才能生效，所以默认禁用

const features = ref([
  { name: 'ticket_detail', module: '工单管理', enabled: featureFlags.isEnabled('ticket_detail') },
  { name: 'ticket_template', module: '工单管理', enabled: featureFlags.isEnabled('ticket_template') },
  { name: 'inspection_plan', module: '巡检管理', enabled: featureFlags.isEnabled('inspection_plan') },
  { name: 'asset_module', module: '资产管理', enabled: featureFlags.isEnabled('asset_module') },
])

const toggleFeature = (feature) => {
  ElMessage.warning('请修改 .env.development.local 文件并重启项目')
}
</script>
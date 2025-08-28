<template>
  <div class="asset-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>资产管理</span>
          <el-tag type="info">功能开发中</el-tag>
        </div>
      </template>
      
      <el-empty description="资产管理模块正在开发中，敬请期待">
        <el-button type="primary" @click="goBack">返回首页</el-button>
      </el-empty>
      
      <!-- 预览功能列表 -->
      <div class="feature-preview">
        <h4>即将上线的功能：</h4>
        <ul>
          <li>✓ 资产台账管理</li>
          <li>✓ 资产借用归还</li>
          <li>✓ 资产盘点</li>
          <li>✓ 资产维保记录</li>
          <li>✓ 资产报废处理</li>
          <li>✓ 资产统计分析</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.asset-list {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .el-empty {
    padding: 40px 0;
  }
  
  .feature-preview {
    margin-top: 40px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;
    
    h4 {
      margin-bottom: 15px;
      color: #303133;
    }
    
    ul {
      list-style: none;
      padding: 0;
      
      li {
        padding: 8px 0;
        color: #606266;
      }
    }
  }
}
</style>
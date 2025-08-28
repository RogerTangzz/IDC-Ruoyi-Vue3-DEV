// src/utils/feature-flags.js

/**
 * 功能开关管理器
 */
class FeatureFlagManager {
  constructor() {
    this.flags = this.loadFlags()
  }

  // 加载所有功能开关
  loadFlags() {
    const flags = {}
    const env = import.meta.env
    
    // 遍历所有环境变量，提取功能开关
    for (const key in env) {
      if (key.startsWith('VITE_FEATURE_')) {
        const featureName = key.replace('VITE_FEATURE_', '').toLowerCase()
        flags[featureName] = env[key] === 'true'
      }
    }
    
    return flags
  }

  // 检查功能是否启用
  isEnabled(featureName) {
    const key = featureName.toLowerCase().replace(/-/g, '_')
    return this.flags[key] === true
  }

  // 批量检查功能
  areEnabled(...featureNames) {
    return featureNames.every(name => this.isEnabled(name))
  }

  // 任意一个功能启用
  anyEnabled(...featureNames) {
    return featureNames.some(name => this.isEnabled(name))
  }

  // 获取所有已启用的功能
  getEnabledFeatures() {
    return Object.keys(this.flags).filter(key => this.flags[key])
  }

  // 获取功能状态详情
  getStatus() {
    return { ...this.flags }
  }
}

// 导出单例
export const featureFlags = new FeatureFlagManager()

// 便捷函数
export const isFeatureEnabled = (name) => featureFlags.isEnabled(name)
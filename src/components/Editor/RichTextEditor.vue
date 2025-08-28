<!-- src/components/Editor/RichTextEditor.vue -->
<template>
  <div class="rich-text-editor">
    <div ref="editorRef" class="editor-container"></div>
    <div class="editor-toolbar" v-if="showTableTool">
      <el-button size="small" @click="insertTable">插入表格</el-button>
      <el-button size="small" @click="insertList">插入列表</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  modelValue: String,
  showTableTool: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref()
const editorContent = ref('')

// 插入表格
const insertTable = () => {
  const rows = prompt('请输入行数：', '3')
  const cols = prompt('请输入列数：', '3')
  
  if (rows && cols) {
    const table = createTable(parseInt(rows), parseInt(cols))
    insertHtml(table)
  }
}

// 创建表格HTML
const createTable = (rows, cols) => {
  let html = '<table border="1" style="width: 100%; border-collapse: collapse;">\n'
  for (let i = 0; i < rows; i++) {
    html += '  <tr>\n'
    for (let j = 0; j < cols; j++) {
      if (i === 0) {
        html += `    <th style="padding: 8px; border: 1px solid #ddd;">标题${j + 1}</th>\n`
      } else {
        html += `    <td style="padding: 8px; border: 1px solid #ddd;">内容</td>\n`
      }
    }
    html += '  </tr>\n'
  }
  html += '</table>'
  return html
}

// 插入列表
const insertList = () => {
  const listHtml = `
<ul>
  <li>步骤1：检查设备外观</li>
  <li>步骤2：测试运行状态</li>
  <li>步骤3：记录参数</li>
  <li>步骤4：清洁维护</li>
  <li>步骤5：填写记录</li>
</ul>`
  insertHtml(listHtml)
}

// 插入HTML
const insertHtml = (html) => {
  if (editorRef.value) {
    editorRef.value.innerHTML += html
    updateContent()
  }
}

// 更新内容
const updateContent = () => {
  editorContent.value = editorRef.value.innerHTML
  emit('update:modelValue', editorContent.value)
}

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (editorRef.value && newVal !== editorContent.value) {
    editorRef.value.innerHTML = newVal || ''
    editorContent.value = newVal || ''
  }
})

onMounted(() => {
  // 设置编辑器为可编辑
  editorRef.value.contentEditable = true
  editorRef.value.innerHTML = props.modelValue || ''
  
  // 监听输入事件
  editorRef.value.addEventListener('input', updateContent)
})
</script>

<style scoped lang="scss">
.rich-text-editor {
  .editor-container {
    min-height: 200px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 12px;
    background: #fff;
    
    &:focus {
      outline: none;
      border-color: #409eff;
    }
    
    :deep(table) {
      width: 100%;
      margin: 10px 0;
      
      th, td {
        border: 1px solid #dcdfe6;
        padding: 8px;
        text-align: left;
      }
      
      th {
        background-color: #f5f7fa;
        font-weight: bold;
      }
    }
    
    :deep(ul), :deep(ol) {
      margin: 10px 0;
      padding-left: 30px;
      
      li {
        margin: 5px 0;
      }
    }
  }
  
  .editor-toolbar {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #ebeef5;
  }
}
</style>
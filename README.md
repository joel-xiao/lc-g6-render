# lc-g6-render

基于 AntV G6 的 Vue 3 图可视化组件库

## 目录结构

```
src/
├── index.vue                    # 主入口组件
├── lc-g6-buttons.vue           # 布局切换按钮组件
├── lc-g6-legend.vue             # 自定义图例组件
├── lc-g6-tooltip.vue            # 自定义 HTML 提示框组件
├── lc-g6-text-tooltip.vue       # 文本截断提示组件
├── lc-g6-loading.vue            # 加载状态组件
├── lc-loading-icon.vue          # 加载图标组件
├── lc-zoom.vue                  # 缩放控制组件
├── scss/                        # 样式文件
│   └── plugins.scss             # 插件样式
└── compossible/                 # 组合式函数
    ├── g6.js                    # 核心类 G6Graph（G6 实例封装）
    ├── event.js                 # 事件处理（G6 事件转 Vue 事件）
    ├── data-format-methods.js   # 数据转换工具
    ├── graph-options.js         # 图配置选项
    ├── caching.js               # 缓存工具
    ├── custom-behavior.js       # 自定义行为
    ├── icons.js                 # 图标处理
    ├── plugins-tooltip.js       # 提示框插件
    ├── plugins.js               # 插件管理
    ├── register-combo.js        # 注册组合节点
    ├── register-combo-methods.js # 组合节点方法
    ├── register-edge.js         # 注册边
    ├── register-edge-common.js  # 边通用方法
    ├── register-edge-methods.js # 边方法
    ├── register-layout.js       # 注册布局
    ├── register-layout-methods.js # 布局方法
    ├── register-node.js         # 注册节点
    ├── register-shape-methods.js # 形状方法
    ├── shape-animate.js         # 形状动画
    ├── storage.js               # 存储工具
    └── util.js                  # 工具函数
```

## 依赖

- `vue` (^3.0.0)
- `@antv/g6` (^4.x)
- `lodash`
- `element-plus` (用于 lc-zoom 组件的 el-slider)

## 使用方法

### 基础用法

```vue
<template>
  <lc-g6 
    ref="graphRef"
    :data="graphData" 
    :options="graphOptions" 
    @event="onGraphEvent"
    @zoom="onZoom"
  >
    <template #tooltip="{ model }">
      <div>{{ model.label }}</div>
    </template>
  </lc-g6>
</template>

<script setup>
import LcG6 from './src/index.vue'

const graphData = {
  nodes: [
    { id: '1', label: '节点1' },
    { id: '2', label: '节点2' }
  ],
  edges: [
    { source: '1', target: '2' }
  ]
}

const graphOptions = {
  layout: { type: 'force' },
  defaultNode: { type: 'circle' }
}

function onGraphEvent(eventType, e) {
  console.log('Graph event:', eventType, e)
}

function onZoom(zoom) {
  console.log('Zoom:', zoom)
}
</script>
```

### Props

- `data` - 图数据对象 `{ nodes: [], edges: [], combos: [] }`
- `options` - 配置对象（默认样式、布局、插件等）

### 暴露的方法

通过 `ref` 可以访问以下方法：

- `setData(data)` - 设置图数据
- `addData(option, data, ...args)` - 添加数据
- `getGraph()` - 获取底层 G6 图实例
- `addItem(...args)` - 添加图项
- `removeItem(...args)` - 删除图项
- `updateItem(...args)` - 更新图项
- `refresh(id)` - 刷新提示框
- 更多方法请参考组件源码

## Demo 演示

项目包含一个完整的演示页面 `demo.vue`，展示了如何使用 LcG6 组件。

### 运行 Demo

#### 方式一：使用 Vite（推荐）

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 浏览器会自动打开 `http://localhost:3000` 显示演示页面

#### 方式二：在现有项目中引入

```javascript
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Demo from './demo.vue'

const app = createApp(Demo)
app.use(ElementPlus)
app.mount('#app')
```

3. Demo 功能：
   - 加载示例数据：展示拓扑图
   - 清空数据：清除当前图表
   - 切换布局：在多种布局算法间切换
   - 自定义 Tooltip：展示节点和边的详细信息
   - 缩放控制：支持鼠标滚轮和缩放控件
   - 事件监听：监听节点和边的点击事件

### Demo 文件说明

- `demo.vue` - 演示页面主文件
- `demo-app.js` - Vue 应用入口文件（示例）

## 注意事项

1. 确保已安装所有依赖包
2. 组件需要在一个有明确高度的容器中使用
3. 图标类名 `lc-ico-empty` 需要在使用项目中定义或替换
4. Demo 中使用了模拟数据，实际使用时需要根据业务需求获取真实数据

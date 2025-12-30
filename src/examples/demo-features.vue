<template>
  <div class="lc-g6-demo">
    <div class="demo-header">
      <h2>功能展示 (Feature Showcase)</h2>
      <div class="demo-controls">
        <el-button size="small" type="primary" @click="loadSampleData">重置数据</el-button>
        <el-select 
          v-model="currentLayout" 
          size="small" 
          style="width: 150px; margin-left: 10px;"
          @change="changeLayout"
        >
          <el-option
            v-for="layout in layouts"
            :key="layout.value"
            :label="layout.label"
            :value="layout.value"
          />
        </el-select>
      </div>
    </div>

    <div class="demo-content">
      <LcG6
        v-if="show"
        :options="g6Options"
        ref="lcG6"
        :data="graphData"
        @event="onEvent"
        @zoom="onZoom"
      >
        <template v-slot:tooltip="slotProps">
          <div class="custom-tooltip" v-if="slotProps.model">
            <div class="tooltip-title">{{ slotProps.model.label || slotProps.model.id }}</div>
            <div style="font-size: 12px; color: #666">
              Features: {{ slotProps.model.desc }}
            </div>
          </div>
        </template>
      </LcG6>
    </div>

    <div class="demo-info">
      <div class="info-item">
        <span class="label">当前缩放:</span>
        <span class="value">{{ currentZoom.toFixed(2) }}</span>
      </div>
       <div class="info-item">
        <span class="label">说明:</span>
        <span class="value" style="font-size: 11px; color: #888">展示组件库支持的各种节点装饰与状态</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, toRaw } from 'vue'
import LcG6 from '../index.vue'

const show = ref(false)
const lcG6 = ref(null)
const currentZoom = ref(1)
const currentLayout = ref('dagre')

// G6 支持的所有布局类型（移除不支持的布局）
const layouts = [
  { label: 'Dagre (层次)', value: 'dagre' },
  { label: 'Depth-Vertical (深度垂直)', value: 'depth-vertical' },
  // { label: 'Depth-Grid (深度网格)', value: 'depth-grid' },
  { label: 'Force (力导向)', value: 'force' },
  { label: 'Circular (环形)', value: 'circular' },
  { label: 'Radial (辐射)', value: 'radial' },
  { label: 'ComboForce', value: 'comboForce' },
  { label: 'Grid (网格)', value: 'grid' },
  { label: 'Random (随机)', value: 'random' }
]

const graphData = reactive({
  nodes: [],
  edges: [],
  combos: []
})

const getLayoutConfig = (layoutType) => {
  // 使用普通对象，避免响应式导致的循环引用问题
  const baseConfig = {
    preventOverlap: true
  }
  
  switch (layoutType) {
    case 'dagre':
      return {
        ...baseConfig,
        type: 'dagre',
        rankdir: 'LR',
        nodesep: 60,
        ranksep: 100,
        sortByCombo: true
      }
    case 'depth-vertical':
      return {
        ...baseConfig,
        type: 'depth-vertical',
        nodesep: 70,
        ranksep: 80
      }
    case 'depth-grid':
      return {
        ...baseConfig,
        type: 'depth-grid',
        nodesep: 70,
        ranksep: 80
      }
    case 'force':
      return {
        ...baseConfig,
        type: 'force',
        nodeSize: 100,
        linkDistance: 150,
        nodeStrength: -500,
        edgeStrength: 0.2,
        collideStrength: 1,
        alpha: 0.5,
        alphaDecay: 0.02,
        tick: 100
      }
    case 'circular':
      return {
        ...baseConfig,
        type: 'circular',
        radius: 200,
        startRadius: 10,
        endRadius: 300,
        clockwise: true,
        divisions: 5
      }
    case 'radial':
      return {
        ...baseConfig,
        type: 'radial',
        unitRadius: 100,
        preventOverlap: true
      }
    case 'comboForce':
      return {
        ...baseConfig,
        type: 'comboForce',
        nodeSpacing: 30,
        comboSpacing: 50,
        preventOverlap: true
      }
    case 'grid':
      return {
        ...baseConfig,
        type: 'grid',
        nodeSize: 100,
        preventOverlapPadding: 30
      }
    case 'random':
      return {
        ...baseConfig,
        type: 'random'
      }
    default:
      return {
        ...baseConfig,
        type: 'dagre',
        rankdir: 'LR',
        nodesep: 60,
        ranksep: 100
      }
  }
}

const g6Options = computed(() => {
  return {
    legend: true,
    minimap: true,
    customBehaviors: ['normal-event', 'collapse-expand-combo', 'drag-combo'],
    tooltip: { show: true },
    layout: getLayoutConfig(currentLayout.value),
    defaultNode: {
      type: 'node-icon',
      size: 70,
      style: {
        lineWidth: 2,
        stroke: '#5B8FF9',
        fill: '#E6F7FF',
      },
      labelCfg: {
        position: 'bottom',
        offset: 10,
        style: {
          fontSize: 12
        }
      }
    },
    defaultCombo: {
      type: 'custom-combo',
      padding: [80, 80, 80, 80],
      style: {
        fill: '#0099ff07',
        stroke: '#09F',
        lineWidth: 2
      }
    },
    defaultEdge: {
      type: 'cubic-v-circle-run',
      style: {
        stroke: '#6AC9FF',
        lineWidth: 2
      },
      labelCfg: {
        style: {
          fontSize: 10,
          fill: '#666',
          background: {
            fill: '#fff',
            padding: [2, 4, 2, 4],
            radius: 2
          }
        }
      }
    },
    fitView: true,
    fitViewPadding: [20, 20, 20, 20]
  }
})

function loadSampleData() {
  // 用少量节点展示所有场景
  const nodes = [
      // 1. 节点类型和形状（合并展示）
      { 
        id: 'node-type-app', 
        label: 'app',
        title: 'app', 
        desc: '节点类型: app, 形状: 圆形',
        type: 'node-icon',
        node_type: 'app',
        shape: 'ellipse',
        statusType: 'normal',
        showIcon: true,
        icon: '/g6-icons/server-normal.svg',
        comboId: 'group-basic',
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { status: 'normal' }
      },
      { 
        id: 'shape-hexagonal', 
        label: '六边形',
        title: '六边形', 
        desc: '节点类型: sys, 形状: 六边形',
        type: 'node-icon',
        node_type: 'sys',
        shape: 'hexagonal-polygon',
        statusType: 'normal',
        showIcon: true,
        icon: '/g6-icons/server2-normal.svg',
        comboId: 'group-basic',
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { status: 'normal' }
      },
      
      // 2. 状态类型（只保留3个关键状态）
      { 
        id: 'status-normal', 
        label: '正常',
        title: '正常', 
        desc: 'statusType: normal (绿色光环)',
        type: 'node-icon',
        statusType: 'normal',
        node_type: 'server',
        showIcon: true,
        comboId: 'group-status',
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { status: 'normal' }
      },
      { 
        id: 'status-warning', 
        label: '警告',
        title: '警告', 
        desc: 'statusType: warning (黄色光环)',
        type: 'node-icon',
        statusType: 'warning',
        node_type: 'server',
        showIcon: true,
        comboId: 'group-status',
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { status: 'warning' }
      },
      { 
        id: 'status-abnormal', 
        label: '异常',
        title: '异常', 
        desc: 'statusType: abnormal (红色光环)',
        type: 'node-icon',
        statusType: 'abnormal',
        node_type: 'server',
        showIcon: true,
        comboId: 'group-status',
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { status: 'error' }
      },
      { 
        id: 'status-special', 
        label: '特殊状态',
        title: '特殊状态', 
        desc: 'statusType: disabled/external/user',
        type: 'node-icon',
        statusType: 'disabled',
        node_type: 'app',
        showIcon: true,
        icon: '/g6-icons/deleted.svg',
        comboId: 'group-status',
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { status: 'normal' }
      },
      { 
        id: 'status-moved', 
        label: '已移动',
        title: '已移动', 
        desc: 'statusType: moved',
        type: 'node-icon',
        statusType: 'moved',
        node_type: 'app',
        showIcon: true,
        icon: '/g6-icons/moved.svg',
        comboId: 'group-status',
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { status: 'normal' }
      },
      
      // 3. 角标展示（合并到一个节点）- 不在组里
      { 
        id: 'badges-both', 
        label: '双角标',
        title: '双角标', 
        desc: '右上角标: 99, 右下角标: 5',
        type: 'node-icon',
        node_type: 'app',
        statusType: 'normal',
        showIcon: true,
        icon: '/g6-icons/server-normal.svg',
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { 
          status: 'normal',
          right_top_number: 99,
          right_bottom_number: 5
        },
        rightTop: { show: true },
        rightBottom: { show: true }
      },
      
      // 4. 中心内容（合并展示：数字+文字+图标）- 不在组里
      { 
        id: 'center-all', 
        label: '中心内容',
        title: '中心内容', 
        desc: '中心数字: 10, 文字: CORE, 图标',
        type: 'node-icon',
        node_type: 'server',
        statusType: 'normal',
        showIcon: false,
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { 
          status: 'normal',
          center_number: 10
        },
        center: { show: true, showIcon: true, text: 'CORE' }
      },
      
      // 5. 图标类型（部分在组里，部分不在组里）
      { 
        id: 'icon-web', 
        label: 'Web',
        title: 'Web图标', 
        desc: 'icon: "/g6-icons/web-normal.svg"',
        type: 'node-icon',
        node_type: 'app',
        statusType: 'normal',
        icon: '/g6-icons/web-normal.svg',
        showIcon: true,
        comboId: 'group-icons',
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { status: 'normal' }
      },
      { 
        id: 'icon-phone', 
        label: 'Phone',
        title: 'Phone图标', 
        desc: 'icon: "/g6-icons/phone-normal.svg"',
        type: 'node-icon',
        node_type: 'app',
        statusType: 'normal',
        icon: '/g6-icons/phone-normal.svg',
        showIcon: true,
        comboId: 'group-icons',
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { status: 'normal' }
      },
      { 
        id: 'icon-default', 
        label: 'Default',
        title: 'Default图标', 
        desc: 'icon: "/g6-icons/server-normal.svg"',
        type: 'node-icon',
        node_type: 'app',
        statusType: 'normal',
        icon: '/g6-icons/server-normal.svg',
        showIcon: true,
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { status: 'normal' }
      },
      { 
        id: 'icon-default2', 
        label: 'Default2',
        title: 'Default2图标', 
        desc: 'icon: "/g6-icons/server2-normal.svg"',
        type: 'node-icon',
        node_type: 'app',
        statusType: 'normal',
        icon: '/g6-icons/server2-normal.svg',
        showIcon: true,
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { status: 'normal' }
      },
      { 
        id: 'icon-warning', 
        label: 'Warning',
        title: 'Warning图标', 
        desc: 'icon: "/g6-icons/server-warning.svg"',
        type: 'node-icon',
        node_type: 'app',
        statusType: 'normal',
        icon: '/g6-icons/server-warning.svg',
        showIcon: true,
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { status: 'normal' }
      },
      { 
        id: 'icon-abnormal', 
        label: 'Abnormal',
        title: 'Abnormal图标', 
        desc: 'icon: "/g6-icons/server-abnormal.svg"',
        type: 'node-icon',
        node_type: 'app',
        statusType: 'normal',
        icon: '/g6-icons/server-abnormal.svg',
        showIcon: true,
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { status: 'normal' }
      },
      
      // 6. Combo 节点组（只保留一个）
      { 
        id: 'combo-node-1', 
        label: 'Combo节点1',
        title: 'Combo节点1', 
        desc: 'comboId: combo-group-1',
        type: 'node-icon',
        node_type: 'app',
        statusType: 'normal',
        comboId: 'combo-group-1',
        showIcon: true,
        icon: '/g6-icons/server-normal.svg',
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { status: 'normal' }
      },
      { 
        id: 'combo-node-2', 
        label: 'Combo节点2',
        title: 'Combo节点2', 
        desc: 'comboId: combo-group-1',
        type: 'node-icon',
        node_type: 'app',
        statusType: 'normal',
        comboId: 'combo-group-1',
        showIcon: true,
        icon: '/g6-icons/server2-normal.svg',
        disabled_collapse: true, // 隐藏展开下一层按钮
        data: { status: 'normal' }
      }
    ]
    
    // Combo 配置（节点组）- 默认展开状态
    const combos = [
      { 
        id: 'group-basic', 
        title: '基础节点',
        type: 'custom-combo',
        statusType: 'normal',
        collapsed: false, // 默认展开
        show_collapsed: true, // 显示展开/收起按钮
        padding: [60, 60, 60, 60],
        style: {
          fill: '#0099ff07',
          stroke: '#09F',
          lineWidth: 2
        }
      },
      { 
        id: 'group-status', 
        title: '状态类型',
        type: 'custom-combo',
        statusType: 'normal',
        collapsed: false, // 默认展开
        show_collapsed: true, // 显示展开/收起按钮
        padding: [60, 60, 60, 60],
        style: {
          fill: '#0099ff07',
          stroke: '#09F',
          lineWidth: 2
        }
      },
      { 
        id: 'group-icons', 
        title: '图标类型',
        type: 'custom-combo',
        statusType: 'normal',
        collapsed: false, // 默认展开
        show_collapsed: true, // 显示展开/收起按钮
        padding: [60, 60, 60, 60],
        style: {
          fill: '#0099ff07',
          stroke: '#09F',
          lineWidth: 2
        }
      },
      { 
        id: 'combo-group-1', 
        title: 'Combo组',
        type: 'custom-combo',
        statusType: 'normal',
        collapsed: false, // 默认展开
        show_collapsed: true, // 显示展开/收起按钮
        padding: [80, 80, 80, 80],
        style: {
          fill: '#0099ff07',
          stroke: '#09F',
          lineWidth: 2
        }
      },
      { 
        id: 'group-empty', 
        title: '空组',
        type: 'custom-combo',
        statusType: 'normal',
        collapsed: false, // 默认展开
        show_collapsed: true, // 显示展开/收起按钮
        padding: [60, 60, 60, 60],
        style: {
          fill: '#0099ff07',
          stroke: '#09F',
          lineWidth: 2
        }
      }
    ]

  // 创建分支结构的边连接，避免形成一条线
  const edges = [
    // 以基础节点为中心，形成分支结构
    { 
      id: 'edge-center-1',
      source: 'node-type-app',
      target: 'shape-hexagonal',
      type: 'line-circle-run'
    },
    { 
      id: 'edge-center-2',
      source: 'node-type-app',
      target: 'status-normal',
      type: 'line-circle-run'
    },
    { 
      id: 'edge-center-3',
      source: 'node-type-app',
      target: 'badges-both',
      type: 'line-circle-run'
    },
    { 
      id: 'edge-center-4',
      source: 'node-type-app',
      target: 'icon-web',
      type: 'line-circle-run'
    },
    
    // 状态组分支连接
    { 
      id: 'edge-status-1',
      source: 'status-normal',
      target: 'status-warning',
      type: 'line-circle-run'
    },
    { 
      id: 'edge-status-2',
      source: 'status-normal',
      target: 'status-abnormal',
      type: 'line-circle-run'
    },
    { 
      id: 'edge-status-3',
      source: 'status-warning',
      target: 'status-special',
      type: 'line-circle-run'
    },
    { 
      id: 'edge-status-4',
      source: 'status-abnormal',
      target: 'status-moved',
      type: 'line-circle-run'
    },
    
    // 功能特性分支
    { 
      id: 'edge-feature-1',
      source: 'badges-both',
      target: 'center-all',
      type: 'line-circle-run'
    },
    
    // 图标类型分支连接
    { 
      id: 'edge-icon-1',
      source: 'icon-web',
      target: 'icon-phone',
      type: 'line-circle-run'
    },
    { 
      id: 'edge-icon-2',
      source: 'icon-web',
      target: 'icon-default',
      type: 'line-circle-run'
    },
    { 
      id: 'edge-icon-3',
      source: 'icon-default',
      target: 'icon-default2',
      type: 'line-circle-run'
    },
    { 
      id: 'edge-icon-4',
      source: 'icon-default',
      target: 'icon-warning',
      type: 'line-circle-run'
    },
    { 
      id: 'edge-icon-5',
      source: 'icon-warning',
      target: 'icon-abnormal',
      type: 'line-circle-run'
    },
    
    // Combo 节点组内部连接
    { 
      id: 'edge-combo-1',
      source: 'combo-node-1',
      target: 'combo-node-2',
      type: 'line-circle-run'
    },
    
    // 跨组连接，形成交叉调用
    { 
      id: 'edge-cross-1',
      source: 'shape-hexagonal',
      target: 'status-warning',
      type: 'line-circle-run'
    },
    { 
      id: 'edge-cross-2',
      source: 'center-all',
      target: 'icon-phone',
      type: 'line-circle-run'
    },
    { 
      id: 'edge-cross-3',
      source: 'icon-abnormal',
      target: 'combo-node-1',
      type: 'line-circle-run'
    },
    { 
      id: 'edge-cross-4',
      source: 'status-special',
      target: 'icon-default2',
      type: 'line-circle-run'
    }
  ]

  // 直接设置 G6 格式的数据
  graphData.nodes = nodes
  graphData.edges = edges
  graphData.combos = combos
  
  show.value = true
}

function changeLayout() {
  // 切换布局后重新渲染 G6 组件
  if (lcG6.value && show.value) {
    try {
      // 先更新布局配置
      const layoutConfig = toRaw(getLayoutConfig(currentLayout.value))
      const graph = lcG6.value.getGraph()
      
      if (graph) {
        // 更新布局
        graph.updateLayout(layoutConfig)
      }
      
      // 重新设置数据以触发重新渲染
      setTimeout(() => {
        if (lcG6.value && graphData.nodes.length > 0) {
          // 使用 setData 重新渲染整个组件
          lcG6.value.setData({
            nodes: [...graphData.nodes],
            edges: [...graphData.edges],
            combos: [...graphData.combos]
          })
        }
      }, 50)
    } catch (error) {
      console.error('Layout update error:', error)
    }
  }
}

function onEvent(type, e) {
  if (type === 'node:click') {
    console.log('Feature Node Clicked:', e.item.getModel())
  } else if (type === 'combo:click') {
    // 处理 combo 点击事件，确保收起/展开功能正常工作
    const eventName = e.target?.get('event-name')
    
    if (eventName === 'combo-collapsed') {
      // 通过 onG6Event 触发 combo-collapsed 事件，让系统自动处理收起/展开
      const g6 = lcG6.value
      if (g6) {
        const g6_example = g6.getExample()
        const g6_graph = g6.getGraph()
        
        g6.onG6Event(["combo-collapsed"], "click", e, g6_graph, {
          g6_example: g6_example,
        })
      }
    }
  }
}

function onZoom(zoom) {
  currentZoom.value = zoom
}

onMounted(() => {
  loadSampleData()
})
</script>

<style lang="scss" scoped>
.lc-g6-demo {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;

  .demo-header {
    padding: 16px 20px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    h2 { margin: 0; font-size: 18px; font-weight: 500; color: #333; }
    .demo-controls { display: flex; gap: 10px; }
  }

  .demo-content {
    flex: 1;
    overflow: hidden;
    position: relative;
    background: #fff;
    margin: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .demo-info {
    padding: 12px 20px;
    background: #fff;
    border-top: 1px solid #e8e8e8;
    display: flex;
    gap: 30px;
    font-size: 12px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      .label { color: #666; }
      .value { color: #333; font-weight: 500; }
    }
  }
}

.custom-tooltip {
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 150px;
  .tooltip-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 5px;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
  }
}
</style>

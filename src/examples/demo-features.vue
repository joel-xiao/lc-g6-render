<template>
  <div class="lc-g6-demo">
    <div class="demo-header">
      <h2>功能展示 (Feature Showcase)</h2>
      <div class="demo-controls">
        <el-button size="small" type="primary" @click="loadSampleData">重置数据</el-button>
        <el-button size="small" @click="toggleAnimate">动画: {{ animate ? '开' : '关' }}</el-button>
        <el-button size="small" @click="toggleStatus">切换状态</el-button>
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
import { ref, reactive, computed, onMounted } from 'vue'
import LcG6 from '../index.vue'
import { toG6Data } from '../compossible/data-format-methods.js'

const show = ref(false)
const lcG6 = ref(null)
const currentZoom = ref(1)
const animate = ref(false)

const graphData = reactive({
  nodes: [],
  edges: [],
  combos: []
})

const g6Options = computed(() => {
  return {
    legend: true,
    minimap: true,
    customBehaviors: ['normal-event'],
    tooltip: { show: true },
    layout: {
      type: 'grid',
      begin: [50, 50],
      width: 800,
      height: 600,
      cols: 6
    },
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
        offset: 10
      }
    },
    defaultEdge: {
      type: 'cubic-v-circle-run',
      style: {
        stroke: '#6AC9FF',
        lineWidth: 2
      }
    },
    fitView: true
  }
})

function loadSampleData() {
  const rawData = {
    props: ['id'], // Explicitly use 'id' for this demo
    nodes: [
      // 节点类型展示
      { 
        id: 'node-type-app', 
        label: '节点类型: app', 
        desc: 'node_type: app',
        node_type: 'app',
        statusType: 'normal',
        data: { status: 'normal' }
      },
      { 
        id: 'node-type-sys', 
        label: '节点类型: sys', 
        desc: 'node_type: sys',
        node_type: 'sys',
        statusType: 'normal',
        data: { status: 'normal' }
      },
      { 
        id: 'node-type-db', 
        label: '节点类型: db', 
        desc: 'node_type: db',
        node_type: 'db',
        statusType: 'normal',
        data: { status: 'normal' }
      },
      { 
        id: 'node-type-server', 
        label: '节点类型: server', 
        desc: 'node_type: server',
        node_type: 'server',
        statusType: 'normal',
        data: { status: 'normal' }
      },
      
      // 节点形状展示
      { 
        id: 'shape-hexagonal', 
        label: '形状: 六边形', 
        desc: 'shape: hexagonal-polygon',
        node_type: 'sys',
        shape: 'hexagonal-polygon',
        statusType: 'normal',
        data: { status: 'normal' }
      },
      { 
        id: 'shape-ellipse', 
        label: '形状: 椭圆', 
        desc: 'shape: ellipse',
        node_type: 'db',
        shape: 'ellipse',
        statusType: 'normal',
        data: { status: 'normal' }
      },
      
      // 状态类型（光环）展示
      { 
        id: 'status-normal', 
        label: '状态: 正常', 
        desc: 'statusType: normal (Green Halo)',
        statusType: 'normal',
        node_type: 'app',
        data: { status: 'normal' }
      },
      { 
        id: 'status-warning', 
        label: '状态: 警告', 
        desc: 'statusType: warning (Yellow Halo)',
        statusType: 'warning',
        node_type: 'app',
        data: { status: 'warning' }
      },
      { 
        id: 'status-abnormal', 
        label: '状态: 异常', 
        desc: 'statusType: abnormal (Red Halo)',
        statusType: 'abnormal',
        node_type: 'app',
        data: { status: 'error' }
      },
      { 
        id: 'status-disabled', 
        label: '状态: 禁用', 
        desc: 'statusType: disabled (Gray)',
        statusType: 'disabled',
        node_type: 'app',
        data: { status: 'normal' }
      },
      { 
        id: 'status-external', 
        label: '状态: 外部', 
        desc: 'statusType: external',
        statusType: 'external',
        node_type: 'app',
        data: { status: 'normal' }
      },
      
      // 角标展示
      { 
        id: 'badges-top', 
        label: '右上角标', 
        desc: 'Right Top Badge: 99',
        node_type: 'app',
        statusType: 'normal',
        data: { 
          status: 'normal',
          right_top_number: 99
        },
        rightTop: { show: true }
      },
      { 
        id: 'badges-bottom', 
        label: '右下角标', 
        desc: 'Right Bottom Badge: 5',
        node_type: 'app',
        statusType: 'normal',
        data: { 
          status: 'normal',
          right_bottom_number: 5
        },
        rightBottom: { show: true }
      },
      { 
        id: 'badges-both', 
        label: '双角标', 
        desc: 'Both Badges: 99/5',
        node_type: 'db',
        statusType: 'warning',
        data: { 
          status: 'normal',
          right_top_number: 99,
          right_bottom_number: 5
        },
        rightTop: { show: true },
        rightBottom: { show: true }
      },
      
      // 中心内容展示
      { 
        id: 'center-number', 
        label: '中心数字', 
        desc: 'Center Number: 10',
        node_type: 'server',
        statusType: 'normal',
        data: { 
          status: 'normal',
          center_number: 10
        },
        center: { show: true }
      },
      { 
        id: 'center-text', 
        label: '中心文字', 
        desc: 'Center Text: CORE',
        node_type: 'server',
        statusType: 'normal',
        data: { 
          status: 'normal',
          center_number: 'CORE'
        },
        center: { show: true, showIcon: false }
      },
      
      // 图标展示
      { 
        id: 'icon-show', 
        label: '显示图标', 
        desc: 'showIcon: true',
        node_type: 'app',
        statusType: 'normal',
        showIcon: true,
        data: { status: 'normal' }
      },
      { 
        id: 'icon-hide', 
        label: '隐藏图标', 
        desc: 'showIcon: false',
        node_type: 'app',
        statusType: 'normal',
        showIcon: false,
        data: { status: 'normal' }
      }
    ],
    links: [
      // 边类型展示
      { 
        id: 'edge-line',
        from: { id: 'node-type-app' },
        to: { id: 'node-type-sys' },
        type: 'line-circle-run',
        label: 'line-circle-run'
      },
      { 
        id: 'edge-cubic',
        from: { id: 'node-type-sys' },
        to: { id: 'node-type-db' },
        type: 'cubic-circle-run',
        label: 'cubic-circle-run'
      },
      { 
        id: 'edge-cubic-v',
        from: { id: 'node-type-db' },
        to: { id: 'node-type-server' },
        type: 'cubic-v-circle-run',
        label: 'cubic-v-circle-run'
      },
      { 
        id: 'edge-cubic-h',
        from: { id: 'status-normal' },
        to: { id: 'status-warning' },
        type: 'cubic-h-circle-run',
        label: 'cubic-h-circle-run'
      },
      { 
        id: 'edge-quadratic',
        from: { id: 'status-warning' },
        to: { id: 'status-abnormal' },
        type: 'quadratic-circle-run',
        label: 'quadratic-circle-run'
      },
      { 
        id: 'edge-loop',
        from: { id: 'status-abnormal' },
        to: { id: 'status-abnormal' },
        type: 'loop-circle-run',
        label: 'loop-circle-run'
      }
    ]
  }

  // 处理边数据，添加 type 字段
  rawData.links.forEach(link => {
    if (link.type && !link.link_type) {
      link.link_type = link.type
    }
  })
  
  const formatted = toG6Data(rawData)
  
  // Apply specific styles that might be lost in simple toG6Data or need manual override
  formatted.nodes.forEach(node => {
    // Ensure styles are initialized
    node.style = node.style || {};
    
    // Pass high-level props to model for renderers to pick up
    const original = rawData.nodes.find(n => n.id === node.id);
    if (original) {
        // 保留所有原始属性
        if (original.shape) node.shape = original.shape
        if (original.statusType) node.statusType = original.statusType
        if (original.showIcon !== undefined) node.showIcon = original.showIcon
        if (original.rightTop) node.rightTop = original.rightTop
        if (original.rightBottom) node.rightBottom = original.rightBottom
        if (original.center) node.center = original.center
        if (original.node_type) node.node_type = original.node_type
    }
  })
  
  // 处理边类型：确保边使用正确的 type
  formatted.edges.forEach(edge => {
    // 找到对应的原始 link（通过 source_props 和 target_props 匹配）
    const originalLink = rawData.links.find(link => {
      const linkFromId = link.from.id || link.from.appsysid
      const linkToId = link.to.id || link.to.appsysid
      return (edge.source_props?.id === linkFromId || edge.source === linkFromId) &&
             (edge.target_props?.id === linkToId || edge.target === linkToId)
    })
    if (originalLink?.type) {
      edge.type = originalLink.type
    }
  })

  graphData.nodes = formatted.nodes
  graphData.edges = formatted.edges
  
  show.value = true
}

function toggleAnimate() {
  animate.value = !animate.value
  // In a real scenario, we would trigger a global config change or re-render
  // For this demo, we might just toggle a class or state if supported
  console.log('Animation toggled:', animate.value)
}

function toggleStatus() {
   graphData.nodes.forEach(node => {
       if (node.id === 'status-halo') {
           node.statusType = node.statusType === 'abnormal' ? 'normal' : 'abnormal';
           // Refresh graph item state if possible, or just let reactivity handle re-render if key changes
           // G6 often requires explicit updateItem or refresh
           if (lcG6.value) {
               const graph = lcG6.value.getGraph();
               const item = graph.findById('status-halo');
               if (item) {
                   graph.updateItem(item, { statusType: node.statusType });
                   // Trigger state change logic
                   graph.setItemState(item, 'statusType', node.statusType); 
               }
           }
       }
   })
}

function onEvent(type, e) {
  if (type === 'node:click') console.log('Feature Node Clicked:', e.item.getModel())
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

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
      type: 'dagre',
      rankdir: 'LR',
      nodesep: 120,
      ranksep: 150,
      controlPoints: true
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
        offset: 10,
        style: {
          fontSize: 12
        }
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
    fitViewPadding: 50
  }
})

function loadSampleData() {
  // 直接使用 G6 格式，按功能分组清晰展示
  const nodes = [
      // 第一组：节点类型展示（从左到右连接）
      { 
        id: 'node-type-app', 
        title: 'app', 
        desc: '节点类型: app',
        type: 'node-icon',
        node_type: 'app',
        statusType: 'normal',
        data: { status: 'normal' }
      },
      { 
        id: 'node-type-sys', 
        title: 'sys', 
        desc: '节点类型: sys',
        type: 'node-icon',
        node_type: 'sys',
        statusType: 'normal',
        data: { status: 'normal' }
      },
      { 
        id: 'node-type-db', 
        title: 'db', 
        desc: '节点类型: db',
        type: 'node-icon',
        node_type: 'db',
        statusType: 'normal',
        data: { status: 'normal' }
      },
      { 
        id: 'node-type-server', 
        title: 'server', 
        desc: '节点类型: server',
        type: 'node-icon',
        node_type: 'server',
        statusType: 'normal',
        data: { status: 'normal' }
      },
      
      // 第二组：节点形状展示
      { 
        id: 'shape-hexagonal', 
        title: '六边形', 
        desc: 'shape: hexagonal-polygon',
        type: 'node-icon',
        node_type: 'sys',
        shape: 'hexagonal-polygon',
        statusType: 'normal',
        data: { status: 'normal' }
      },
      { 
        id: 'shape-ellipse', 
        title: '椭圆', 
        desc: 'shape: ellipse',
        type: 'node-icon',
        node_type: 'db',
        shape: 'ellipse',
        statusType: 'normal',
        data: { status: 'normal' }
      },
      
      // 第三组：状态类型（光环）展示 - 形成状态流转链
      { 
        id: 'status-normal', 
        title: '正常', 
        desc: 'statusType: normal (绿色光环)',
        type: 'node-icon',
        statusType: 'normal',
        node_type: 'app',
        data: { status: 'normal' }
      },
      { 
        id: 'status-warning', 
        title: '警告', 
        desc: 'statusType: warning (黄色光环)',
        type: 'node-icon',
        statusType: 'warning',
        node_type: 'app',
        data: { status: 'warning' }
      },
      { 
        id: 'status-abnormal', 
        title: '异常', 
        desc: 'statusType: abnormal (红色光环)',
        type: 'node-icon',
        statusType: 'abnormal',
        node_type: 'app',
        data: { status: 'error' }
      },
      { 
        id: 'status-disabled', 
        title: '禁用', 
        desc: 'statusType: disabled (灰色)',
        type: 'node-icon',
        statusType: 'disabled',
        node_type: 'app',
        data: { status: 'normal' }
      },
      { 
        id: 'status-external', 
        title: '外部', 
        desc: 'statusType: external',
        type: 'node-icon',
        statusType: 'external',
        node_type: 'app',
        data: { status: 'normal' }
      },
      
      // 第四组：角标展示
      { 
        id: 'badges-top', 
        title: '右上角标', 
        desc: '右上角标: 99',
        type: 'node-icon',
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
        title: '右下角标', 
        desc: '右下角标: 5',
        type: 'node-icon',
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
        title: '双角标', 
        desc: '双角标: 99/5',
        type: 'node-icon',
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
      
      // 第五组：中心内容展示
      { 
        id: 'center-number', 
        title: '中心数字', 
        desc: '中心数字: 10',
        type: 'node-icon',
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
        title: '中心文字', 
        desc: '中心文字: CORE',
        type: 'node-icon',
        node_type: 'server',
        statusType: 'normal',
        data: { 
          status: 'normal',
          center_number: 'CORE'
        },
        center: { show: true, showIcon: false }
      },
      
      // 第六组：图标展示
      { 
        id: 'icon-show', 
        title: '显示图标', 
        desc: 'showIcon: true',
        type: 'node-icon',
        node_type: 'app',
        statusType: 'normal',
        showIcon: true,
        data: { status: 'normal' }
      },
      { 
        id: 'icon-hide', 
        title: '隐藏图标', 
        desc: 'showIcon: false',
        type: 'node-icon',
        node_type: 'app',
        statusType: 'normal',
        showIcon: false,
        data: { status: 'normal' }
      }
    ]

  // 创建清晰的边连接，展示不同边类型
  const edges = [
    // 节点类型组：从左到右连接，展示不同边类型
    { 
      id: 'edge-line',
      source: 'node-type-app',
      target: 'node-type-sys',
      type: 'line-circle-run',
      label: 'line'
    },
    { 
      id: 'edge-cubic',
      source: 'node-type-sys',
      target: 'node-type-db',
      type: 'cubic-circle-run',
      label: 'cubic'
    },
    { 
      id: 'edge-cubic-v',
      source: 'node-type-db',
      target: 'node-type-server',
      type: 'cubic-v-circle-run',
      label: 'cubic-v'
    },
    
    // 形状组：连接形状节点
    { 
      id: 'edge-shape',
      source: 'shape-hexagonal',
      target: 'shape-ellipse',
      type: 'cubic-h-circle-run',
      label: 'cubic-h'
    },
    
    // 状态流转链：正常 -> 警告 -> 异常 -> 自环
    { 
      id: 'edge-status-1',
      source: 'status-normal',
      target: 'status-warning',
      type: 'quadratic-circle-run',
      label: 'quadratic'
    },
    { 
      id: 'edge-status-2',
      source: 'status-warning',
      target: 'status-abnormal',
      type: 'cubic-v-circle-run',
      label: ''
    },
    { 
      id: 'edge-loop',
      source: 'status-abnormal',
      target: 'status-abnormal',
      type: 'loop-circle-run',
      label: 'loop',
      loopCfg: {
        position: 'top',
        dist: 60,
        clockwise: true
      }
    },
    
    // 角标组：连接展示
    { 
      id: 'edge-badge-1',
      source: 'badges-top',
      target: 'badges-both',
      type: 'line-circle-run',
      label: ''
    },
    { 
      id: 'edge-badge-2',
      source: 'badges-bottom',
      target: 'badges-both',
      type: 'line-circle-run',
      label: ''
    },
    
    // 中心内容组
    { 
      id: 'edge-center',
      source: 'center-number',
      target: 'center-text',
      type: 'cubic-circle-run',
      label: ''
    },
    
    // 图标组
    { 
      id: 'edge-icon',
      source: 'icon-show',
      target: 'icon-hide',
      type: 'line-circle-run',
      label: ''
    }
  ]

  // 直接设置 G6 格式的数据
  graphData.nodes = nodes
  graphData.edges = edges
  
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

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
import { ref, reactive, computed, onMounted } from 'vue'
import LcG6 from '../index.vue'
import { getFeaturesDemoData } from './utils/mock-data.js'

const show = ref(false)
const lcG6 = ref(null)
const currentZoom = ref(1)
const currentLayout = ref('dagre')

// G6 支持的所有布局类型
const layouts = [
  { label: 'Dagre (层次)', value: 'dagre' },
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
  // 节点实际占用空间（包含光环、标题等装饰）
  const nodeSize = 120
  const baseConfig = {
    preventOverlap: true,
    nodeSize
  }
  
  switch (layoutType) {
    case 'dagre':
      return {
        ...baseConfig,
        type: 'dagre',
        rankdir: 'LR',
        nodesep: 35,
        ranksep: 35,
        sortByCombo: true
      }
    case 'depth-grid':
      return {
        ...baseConfig,
        type: 'depth-grid',
        nodesep: 100,
        ranksep: 120
      }
    case 'force':
      return {
        ...baseConfig,
        type: 'force',
        linkDistance: 250,
        nodeStrength: -1000,
        edgeStrength: 0.1,
        collideStrength: 1
      }
    case 'circular':
      return {
        ...baseConfig,
        type: 'circular',
        radius: 400
      }
    case 'radial':
      return {
        ...baseConfig,
        type: 'radial',
        unitRadius: 200
      }
    case 'comboForce':
      return {
        ...baseConfig,
        type: 'comboForce',
        nodeSpacing: 80,
        comboSpacing: 100
      }
    case 'grid':
      return {
        ...baseConfig,
        type: 'grid',
        preventOverlapPadding: 80
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
        nodesep: 100,
        ranksep: 150
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
  const data = getFeaturesDemoData()
  graphData.nodes = data.nodes
  graphData.edges = data.edges
  graphData.combos = data.combos
  show.value = true
}

function changeLayout() {
  // 切换布局 - 重新创建图实例
  if (lcG6.value && show.value) {
    show.value = false
    setTimeout(() => {
      show.value = true
    }, 100)
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

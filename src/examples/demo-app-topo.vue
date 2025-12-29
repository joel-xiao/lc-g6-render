<template>
  <div class="lc-g6-demo">
    <div class="demo-header">
      <h2>应用拓扑图 (Application Topology)</h2>
      <div class="demo-controls">
        <el-button size="small" @click="clearData">清空</el-button>
        <el-button size="small" @click="changeLayout">切换布局: {{ currentLayout }}</el-button>
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
            <div class="tooltip-status" v-if="slotProps.model.data?.status">
              状态: <span :class="'status-' + slotProps.model.data.status">{{ slotProps.model.data.status }}</span>
            </div>
            <div class="tooltip-content" v-if="slotProps.model.data">
              <div v-for="(value, key) in slotProps.model.data" :key="key" class="tooltip-item">
                <span class="tooltip-label">{{ key }}:</span>
                <span class="tooltip-value">{{ value }}</span>
              </div>
            </div>
          </div>
        </template>
      </LcG6>

      <div v-if="!show" class="no-data">
        <LcLoadingIcon />
        <div style="font-size: 12px; color: #666; margin-top: 5px">
          正在加载数据...
        </div>
      </div>
    </div>

    <div class="demo-info">
      <div class="info-item">
        <span class="label">当前缩放:</span>
        <span class="value">{{ currentZoom.toFixed(2) }}</span>
      </div>
      <div class="info-item">
        <span class="label">服务数量:</span>
        <span class="value">{{ graphData.nodes?.length || 0 }}</span>
      </div>
      <div class="info-item">
        <span class="label">调用链路:</span>
        <span class="value">{{ graphData.edges?.length || 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import LcG6 from '../index.vue'
import LcLoadingIcon from '../lc-loading-icon.vue'
import { toG6Data } from '../compossible/data-format-methods.js'

const show = ref(false)
const lcG6 = ref(null)
const currentZoom = ref(1)
const currentLayout = ref('dagre')

const graphData = reactive({
  nodes: [],
  edges: [],
  combos: []
})

const layouts = ['dagre', 'force', 'circular']
let layoutIndex = 0

const g6Options = computed(() => {
  return {
    legend: true,
    minimap: true,
    customBehaviors: ['normal-event'],
    tooltip: { show: true },
    layout: {
      type: currentLayout.value,
      rankdir: 'LR', // Left to Right for App flow
      nodesep: 40,
      ranksep: 60
    },
    defaultNode: {
      type: 'node-icon',
      shape: 'circle',
      size: 50,
      style: {
        lineWidth: 2,
        stroke: '#5B8FF9',
        fill: '#E6F7FF'
      },
      labelCfg: {
        position: 'bottom',
        offset: 10
      }
    },
    defaultEdge: {
      type: 'cubic-horizontal',
      style: {
        stroke: '#A3B1BF',
        lineWidth: 1.5,
        endArrow: true
      }
    },
    fitView: true
  }
})

function loadSampleData() {
  const rawData = {
    props: ['appsysid'],
    nodes: [
      { appsysid: 'gateway', app_name: 'API Gateway', node_type: 'app', data: { status: 'normal', qps: 1200, rt: 20 } },
      { appsysid: 'auth', app_name: 'Auth Service', node_type: 'app', data: { status: 'normal', qps: 800, rt: 15 } },
      { appsysid: 'order', app_name: 'Order Service', node_type: 'app', data: { status: 'warning', qps: 400, rt: 150 } },
      { appsysid: 'product', app_name: 'Product Service', node_type: 'app', data: { status: 'normal', qps: 600, rt: 30 } },
      { appsysid: 'pay', app_name: 'Payment Service', node_type: 'app', data: { status: 'normal', qps: 200, rt: 45 } },
      { appsysid: 'user', app_name: 'User Service', node_type: 'app', data: { status: 'normal', qps: 500, rt: 25 } },
      { appsysid: 'redis', app_name: 'Redis Cluster', node_type: 'db', shape: 'ellipse', data: { status: 'normal', qps: 2000, rt: 2 } },
      { appsysid: 'mysql', app_name: 'MySQL DB', node_type: 'db', shape: 'ellipse', data: { status: 'normal', qps: 1000, rt: 10 } }
    ],
    links: [
      { from: { appsysid: 'gateway' }, to: { appsysid: 'auth' } },
      { from: { appsysid: 'gateway' }, to: { appsysid: 'order' } },
      { from: { appsysid: 'gateway' }, to: { appsysid: 'product' } },
      { from: { appsysid: 'gateway' }, to: { appsysid: 'user' } },
      { from: { appsysid: 'order' }, to: { appsysid: 'pay' } },
      { from: { appsysid: 'order' }, to: { appsysid: 'product' } },
      { from: { appsysid: 'auth' }, to: { appsysid: 'user' } },
      { from: { appsysid: 'user' }, to: { appsysid: 'redis' } },
      { from: { appsysid: 'product' }, to: { appsysid: 'redis' } },
      { from: { appsysid: 'order' }, to: { appsysid: 'mysql' } },
      { from: { appsysid: 'pay' }, to: { appsysid: 'mysql' } }
    ]
  }

  const formatted = toG6Data(rawData)
  console.log('formatted', formatted)
  // Custom styling post-processing
  formatted.nodes.forEach(node => {
    if (node.data.status === 'warning') {
      node.style = node.style || {};
      node.style.fill = '#FFF2E8';
      node.style.stroke = '#FA541C';
    }
  });

  graphData.nodes = formatted.nodes
  graphData.edges = formatted.edges
  
  show.value = true
}

function clearData() {
  graphData.nodes = []
  graphData.edges = []
  show.value = false
}

function changeLayout() {
  layoutIndex = (layoutIndex + 1) % layouts.length
  currentLayout.value = layouts[layoutIndex]
  if (lcG6.value) {
    const g6 = lcG6.value.getGraph()
    if (g6) g6.updateLayout({ type: currentLayout.value, rankdir: 'LR' })
  }
}

function onEvent(type, e) {
  if (type === 'node:click') console.log('App Node Clicked:', e.item.getModel())
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

    .no-data {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      z-index: 10;
    }
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
  min-width: 200px;

  .tooltip-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .tooltip-status {
    margin-bottom: 8px;
    .status-normal { color: #52c41a; }
    .status-warning { color: #faad14; }
    .status-error { color: #ff4d4f; }
  }

  .tooltip-content .tooltip-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: 12px;
    .tooltip-label { color: #888; }
    .tooltip-value { color: #333; }
  }
}
</style>

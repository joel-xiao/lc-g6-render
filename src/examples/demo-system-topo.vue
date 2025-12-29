<template>
  <div class="lc-g6-demo">
    <div class="demo-header">
      <h2>系统拓扑图 (System Infrastructure View)</h2>
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
        <span class="label">系统组件:</span>
        <span class="value">{{ graphData.nodes?.length || 0 }}</span>
      </div>
      <div class="info-item">
        <span class="label">连接关系:</span>
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

const layouts = ['dagre', 'force', 'radial']
let layoutIndex = 0

const g6Options = computed(() => {
  return {
    legend: true,
    minimap: true,
    customBehaviors: ['normal-event'],
    tooltip: { show: true },
    layout: {
      type: currentLayout.value,
      rankdir: 'TB',
      nodesep: 40,
      ranksep: 60
    },
    defaultNode: {
      type: 'node-icon',
      shape: 'hexagonal-polygon',
      size: 70,
      style: {
        lineWidth: 3,
        stroke: '#1890FF',
        fill: '#F0F5FF'
      },
      center: { show: true }
    },
    defaultEdge: {
      type: 'cubic-v-circle-run',
      style: {
        stroke: '#6AC9FF',
        lineWidth: 2,
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
      { appsysid: 'sys-gateway', app_name: 'API Gateway', node_type: 'sys', data: { region: 'CN-North', ip: '10.0.0.1' }, center: { text: '网关' } },
      { appsysid: 'sys-auth', app_name: 'Auth System', node_type: 'sys', data: { region: 'CN-North', ip: '10.0.0.2' }, center: { text: '认证' } },
      { appsysid: 'sys-trade', app_name: 'Trading System', node_type: 'sys', data: { region: 'CN-South', ip: '10.0.1.1' }, center: { text: '交易' } },
      { appsysid: 'sys-risk', app_name: 'Risk Control', node_type: 'sys', data: { region: 'CN-South', ip: '10.0.1.2' }, center: { text: '风控' } },
      { appsysid: 'sys-db', app_name: 'Core DB', node_type: 'sys', data: { region: 'CN-Core', ip: '192.168.1.100' }, center: { text: 'DB' } }
    ],
    links: [
      { from: { appsysid: 'sys-gateway' }, to: { appsysid: 'sys-auth' }, link_type: 'sys' },
      { from: { appsysid: 'sys-gateway' }, to: { appsysid: 'sys-trade' }, link_type: 'sys' },
      { from: { appsysid: 'sys-trade' }, to: { appsysid: 'sys-risk' }, link_type: 'sys' },
      { from: { appsysid: 'sys-trade' }, to: { appsysid: 'sys-db' }, link_type: 'sys' },
      { from: { appsysid: 'sys-auth' }, to: { appsysid: 'sys-db' }, link_type: 'sys' }
    ]
  }

  const formatted = toG6Data(rawData)
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
    if (g6) g6.updateLayout({ type: currentLayout.value })
  }
}

function onEvent(type, e) {
  if (type === 'node:click') console.log('System Node Clicked:', e.item.getModel())
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

  .tooltip-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e8e8e8;
  }

  .tooltip-content .tooltip-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: 12px;
    .tooltip-label { color: #666; }
    .tooltip-value { color: #333; font-weight: 500; }
  }
}
</style>

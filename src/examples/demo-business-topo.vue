<template>
  <div class="lc-g6-demo">
    <div class="demo-header">
      <h2>业务拓扑图 (Business Domain View)</h2>
      <div class="demo-controls">
        <el-button size="small" type="primary" @click="loadSampleData">加载业务数据</el-button>
        <el-button size="small" @click="clearData">清空</el-button>
        <el-button size="small" @click="toggleCombos">
          {{ isCollapsed ? '展开所有分组' : '折叠所有分组' }}
        </el-button>
        <el-button size="small" @click="changeLayout">切换布局</el-button>
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
            <div class="tooltip-title">
               <span v-if="slotProps.model.isCombo">[业务域] </span>
               {{ slotProps.model.label || slotProps.model.id }}
            </div>
            <div class="tooltip-content" v-if="slotProps.model.data">
               <div class="tooltip-item" v-if="slotProps.model.data.description">
                 <span class="tooltip-value">{{ slotProps.model.data.description }}</span>
               </div>
               <div class="tooltip-item" v-if="slotProps.model.data.owner">
                 <span class="tooltip-label">负责人:</span>
                 <span class="tooltip-value">{{ slotProps.model.data.owner }}</span>
               </div>
            </div>
          </div>
        </template>
      </LcG6>

      <div v-if="!show" class="no-data">
        <LcLoadingIcon />
        <div style="font-size: 12px; color: #666; margin-top: 5px">
          点击"加载业务数据"查看领域模型
        </div>
      </div>
    </div>

    <div class="demo-info">
      <div class="info-item">
        <span class="label">当前缩放:</span>
        <span class="value">{{ currentZoom.toFixed(2) }}</span>
      </div>
      <div class="info-item">
        <span class="label">业务节点:</span>
        <span class="value">{{ graphData.nodes?.length || 0 }}</span>
      </div>
       <div class="info-item">
        <span class="label">业务域(分组):</span>
        <span class="value">{{ graphData.combos?.length || 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import LcG6 from '../index.vue'
import LcLoadingIcon from '../lc-loading-icon.vue'
import { toG6Data } from '../compossible/data-format-methods.js'

const show = ref(false)
const lcG6 = ref(null)
const currentZoom = ref(1)
const currentLayout = ref('comboForce')
const isCollapsed = ref(false)

const graphData = reactive({
  nodes: [],
  edges: [],
  combos: []
})

const layouts = ['comboForce', 'dagre']
let layoutIndex = 0

const g6Options = computed(() => {
  return {
    legend: true,
    minimap: true,
    customBehaviors: [
        'normal-event', 
        'drag-combo', 
        'collapse-expand-combo', 
        'drag-node'
    ],
    tooltip: { show: true },
    layout: {
      type: currentLayout.value,
      // specific options for comboForce
      nodeSpacing: 30,
      comboSpacing: 50,
      preventOverlap: true,
      // specific options for dagre
      rankdir: 'TB',
      nodesep: 40,
      ranksep: 40,
      sortByCombo: true
    },
    defaultNode: {
      type: 'node-icon',
      size: 45,
      style: {
        lineWidth: 1,
        stroke: '#5B8FF9',
        fill: '#ffffff'
      },
      labelCfg: {
        position: 'bottom',
        offset: 5,
        style: { fontSize: 12 }
      }
    },
    defaultCombo: {
      type: 'rect',
      style: {
        fill: '#e6f7ff',
        stroke: '#b3e8ff',
        lineWidth: 1
      },
      labelCfg: {
        position: 'top',
        refY: -5,
        style: {
          fontSize: 14,
          fill: '#1890ff'
        }
      }
    },
    defaultEdge: {
      type: 'cubic',
      style: {
        stroke: '#A3B1BF',
        lineWidth: 1,
        endArrow: true
      }
    },
    fitView: true
  }
})

function loadSampleData() {
  // Business Topology requires 'combos'
  const rawData = {
    props: ['appsysid'],
    nodes: [
      // Marketing Domain
      { appsysid: 'campaign', app_name: 'Campaign Mgmt', comboId: 'domain-market', data: { owner: 'Alice', description: 'Manage marketing campaigns' } },
      { appsysid: 'coupon', app_name: 'Coupon System', comboId: 'domain-market', data: { owner: 'Bob', description: 'Coupon distribution' } },
      
      // Sales Domain
      { appsysid: 'order-core', app_name: 'Order Core', comboId: 'domain-sales', data: { owner: 'Charlie', description: 'Order processing' } },
      { appsysid: 'cart-svc', app_name: 'Shopping Cart', comboId: 'domain-sales', data: { owner: 'Dave', description: 'Cart management' } },
      
      // Stock Domain
      { appsysid: 'inventory', app_name: 'Inventory', comboId: 'domain-stock', data: { owner: 'Eve', description: 'Real-time stock' } },
      { appsysid: 'warehouse', app_name: 'Warehouse', comboId: 'domain-stock', data: { owner: 'Frank', description: 'Physical warehouse sync' } },
      
      // Finance Domain
      { appsysid: 'payment', app_name: 'Payment GW', comboId: 'domain-finance', data: { owner: 'Grace', description: 'Payment processing' } },
      { appsysid: 'settlement', app_name: 'Settlement', comboId: 'domain-finance', data: { owner: 'Hank', description: 'Merchant settlement' } }
    ],
    links: [
      { from: { appsysid: 'campaign' }, to: { appsysid: 'coupon' } },
      { from: { appsysid: 'coupon' }, to: { appsysid: 'cart-svc' } },
      { from: { appsysid: 'cart-svc' }, to: { appsysid: 'order-core' } },
      { from: { appsysid: 'order-core' }, to: { appsysid: 'inventory' } },
      { from: { appsysid: 'inventory' }, to: { appsysid: 'warehouse' } },
      { from: { appsysid: 'order-core' }, to: { appsysid: 'payment' } },
      { from: { appsysid: 'payment' }, to: { appsysid: 'settlement' } }
    ],
    combos: [
      { id: 'domain-market', label: 'Marketing Domain' },
      { id: 'domain-sales', label: 'Sales Domain' },
      { id: 'domain-stock', label: 'Inventory Domain' },
      { id: 'domain-finance', label: 'Finance Domain' }
    ]
  }

  const formatted = toG6Data(rawData)
  graphData.nodes = formatted.nodes
  graphData.edges = formatted.edges
  // Note: toG6Data might not handle combos, so we pass them directly if needed, 
  // or assume toG6Data preserves 'comboId' in nodes.
  // We need to explicitly set combos in graphData
  graphData.combos = rawData.combos

  show.value = true
}

function clearData() {
  graphData.nodes = []
  graphData.edges = []
  graphData.combos = []
  show.value = false
}

function toggleCombos() {
  isCollapsed.value = !isCollapsed.value
  const graph = lcG6.value?.getGraph()
  if (graph) {
     graph.getCombos().forEach(combo => {
       if (isCollapsed.value) graph.collapseCombo(combo.getID())
       else graph.expandCombo(combo.getID())
     })
  }
}

function changeLayout() {
  layoutIndex = (layoutIndex + 1) % layouts.length
  currentLayout.value = layouts[layoutIndex]
  if (lcG6.value) {
    const g6 = lcG6.value.getGraph()
    // Layout update often requires re-reading data or just updateLayout
    if (g6) g6.updateLayout({ type: currentLayout.value })
  }
}

function onEvent(type, e) {
  if (type === 'node:click') console.log('Business Node Click:', e.item.getModel())
  if (type === 'combo:click') console.log('Business Combo Click:', e.item.getModel())
}

function onZoom(zoom) {
  currentZoom.value = zoom
}
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
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-width: 300px;

  .tooltip-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 5px;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
    color: #1890ff;
  }

  .tooltip-content {
    font-size: 12px;
    .tooltip-item { margin-bottom: 3px; }
    .tooltip-label { color: #888; margin-right: 5px; }
    .tooltip-value { color: #333; }
  }
}
</style>

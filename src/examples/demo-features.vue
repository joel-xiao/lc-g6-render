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
import { ref, reactive, computed } from 'vue'
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
      width: 600,
      height: 400
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
      type: 'cubic-horizontal',
      style: {
        stroke: '#A3B1BF',
        lineWidth: 2,
        endArrow: true
      }
    },
    fitView: true
  }
})

function loadSampleData() {
  const rawData = {
    props: ['id'], // Explicitly use 'id' for this demo
    nodes: [
      { 
        id: 'basic', 
        label: '基础节点', 
        desc: 'Standard Icon & Label',
        node_type: 'app',
        data: { status: 'normal' }
      },
      { 
        id: 'status-halo', 
        label: '状态光环', 
        desc: 'Status: Abnormal (Red Halo)',
        statusType: 'abnormal', // Triggers 'state-halo'
        node_type: 'app',
        data: { status: 'error' } 
      },
      { 
        id: 'badges', 
        label: '角标展示', 
        desc: 'Right Top/Bottom Badges',
        node_type: 'db',
        prop: 'id',
        data: { 
          status: 'normal',
          right_top_number: 99,
          right_bottom_number: 5
        },
         rightTop: { show: true },
         rightBottom: { show: true }
      },
      { 
        id: 'center-group', 
        label: '中心内容', 
        desc: 'Center Number & Icon Hidden',
        node_type: 'server',
        data: { 
          status: 'normal',
          center_number: 'CORE'
        },
        center: { show: true, showIcon: false } // Hide icon, show text/number
      },
      { 
        id: 'multi-service', 
        label: '多服务图标', 
        desc: 'service_type="mq,db"',
        service_type: 'mq,db', // Triggers multi-icon logic
        node_type: 'app',
        data: { status: 'normal' }
      },
      {
        id: 'arrows',
        label: '上下箭头',
        desc: 'Arrow Shapes (Top/Bottom)',
        node_type: 'app',
        data: { status: 'warning' }
        // getRegisterNode adds 'arrow' shapes by default
      }
    ],
    links: []
  }

  const formatted = toG6Data(rawData)
  
  // Apply specific styles that might be lost in simple toG6Data or need manual override
  formatted.nodes.forEach(node => {
    // Ensure styles are initialized
    node.style = node.style || {};
    
    // Pass high-level props to model for renderers to pick up
    const original = rawData.nodes.find(n => n.id === node.id);
    if (original) {
        Object.assign(node, original); 
    }
  });

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

<template>
  <div class="lc-g6-demo">
    <div class="demo-header">
      <h2>LcG6 组件演示</h2>
      <div class="demo-controls">
        <el-button size="small" @click="loadSampleData">加载示例数据</el-button>
        <el-button size="small" @click="clearData">清空数据</el-button>
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
            <div class="tooltip-title">{{ slotProps.model.label || slotProps.model.title || slotProps.model.id }}</div>
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
          点击"加载示例数据"开始演示
        </div>
      </div>
    </div>

    <div class="demo-info">
      <div class="info-item">
        <span class="label">当前缩放:</span>
        <span class="value">{{ currentZoom.toFixed(2) }}</span>
      </div>
      <div class="info-item">
        <span class="label">节点数量:</span>
        <span class="value">{{ graphData.nodes?.length || 0 }}</span>
      </div>
      <div class="info-item">
        <span class="label">边数量:</span>
        <span class="value">{{ graphData.edges?.length || 0 }}</span>
      </div>
      <div class="info-item">
        <span class="label">布局类型:</span>
        <span class="value">{{ currentLayout }}</span>
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
const currentLayout = ref('dagre-tbt')

const graphData = reactive({
  nodes: [],
  edges: [],
  combos: []
})

const layouts = ['dagre-tbt', 'force', 'circular', 'radial']
let layoutIndex = 0

const g6Options = computed(() => {
  return {
    legend: true,
    minimap: true,
    customBehaviors: ['normal-event'],
    tooltip: {
      show: true,
      width: '300px',
      data(model, tooltip_type) {
        if (tooltip_type === 'node') {
          return {
            width: '300px',
            node: [
              {
                label: model.label || model.id,
                type: 'metric-header',
                prix: false,
                metrics: [
                  { label: '节点ID', key: 'id' },
                  { label: '标签', key: 'label' }
                ]
              }
            ]
          }
        } else if (tooltip_type === 'edge') {
          return {
            width: '256px',
            link: true,
            edge_metrics: [
              { label: '源节点', key: 'source' },
              { label: '目标节点', key: 'target' }
            ]
          }
        }
      },
      events: {
        click(item, e) {
          console.log('Tooltip click:', item, e)
        }
      }
    },
    layout: {
      type: currentLayout.value
    },
    defaultNode: {
      type: 'node-icon',
      shape: 'hexagonal-polygon',
      size: 70,
      style: {
        lineWidth: 3
      },
      center: {
        show: true
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
  // 参考 system-topo-view-v2.vue 的数据格式
  // 使用 { nodes: [], links: [], props: [] } 格式，然后通过 toG6Data 转换
  const rawData = {
    props: ['appsysid', 'appid', 'agentid', 'ip'],
    nodes: [
      // 系统节点
      { 
        appsysid: 'sys-web',
        app_name: 'Web前端系统',
        node_type: 'sys',
        statusType: 'normal',
        shape: 'hexagonal-polygon',
        showIcon: false,
        center: { text: '应用' },
        data: { 
          total: 1250, 
          dur: 120, 
          err: 2,
          slow: 5,
          frustrated: 1,
          fail: 0,
          exception: 0,
          center_number: 2
        },
        depth: 0,
        chain_depth: 0
      },
      { 
        appsysid: 'sys-gateway',
        app_name: 'API网关系统',
        node_type: 'sys',
        statusType: 'normal',
        shape: 'hexagonal-polygon',
        showIcon: false,
        center: { text: '应用' },
        data: { 
          total: 25500, 
          dur: 88, 
          err: 8,
          slow: 12,
          frustrated: 2,
          fail: 0,
          exception: 1,
          center_number: 2
        },
        depth: 0,
        chain_depth: 0
      },
      { 
        appsysid: 'sys-user',
        app_name: '用户服务系统',
        node_type: 'sys',
        statusType: 'normal',
        shape: 'hexagonal-polygon',
        showIcon: false,
        center: { text: '应用' },
        data: { 
          total: 17700, 
          dur: 46, 
          err: 1,
          slow: 8,
          frustrated: 1,
          fail: 0,
          exception: 0,
          center_number: 2
        },
        depth: 0,
        chain_depth: 0
      },
      { 
        appsysid: 'sys-order',
        app_name: '订单服务系统',
        node_type: 'sys',
        statusType: 'warning',
        shape: 'hexagonal-polygon',
        showIcon: false,
        center: { text: '应用' },
        data: { 
          total: 13700, 
          dur: 150, 
          err: 10,
          slow: 23,
          frustrated: 3,
          fail: 1,
          exception: 2,
          center_number: 2
        },
        depth: 0,
        chain_depth: 0
      },
      { 
        appsysid: 'sys-payment',
        app_name: '支付服务系统',
        node_type: 'sys',
        statusType: 'normal',
        shape: 'hexagonal-polygon',
        showIcon: false,
        center: { text: '应用' },
        data: { 
          total: 3200, 
          dur: 95, 
          err: 1,
          slow: 3,
          frustrated: 0,
          fail: 0,
          exception: 0,
          center_number: 1
        },
        depth: 0,
        chain_depth: 0
      },
      { 
        appsysid: 'sys-product',
        app_name: '商品服务系统',
        node_type: 'sys',
        statusType: 'normal',
        shape: 'hexagonal-polygon',
        showIcon: false,
        center: { text: '应用' },
        data: { 
          total: 11200, 
          dur: 65, 
          err: 0,
          slow: 2,
          frustrated: 0,
          fail: 0,
          exception: 0,
          center_number: 1
        },
        depth: 0,
        chain_depth: 0
      },
      { 
        appsysid: 'sys-cache',
        app_name: '缓存系统',
        node_type: 'sys',
        statusType: 'normal',
        shape: 'hexagonal-polygon',
        showIcon: false,
        center: { text: '应用' },
        data: { 
          total: 73000, 
          dur: 2, 
          err: 0,
          slow: 0,
          frustrated: 0,
          fail: 0,
          exception: 0,
          center_number: 2
        },
        depth: 0,
        chain_depth: 0
      },
      { 
        appsysid: 'sys-db',
        app_name: '数据库系统',
        node_type: 'sys',
        statusType: 'normal',
        shape: 'hexagonal-polygon',
        showIcon: false,
        center: { text: '应用' },
        data: { 
          total: 41000, 
          dur: 18, 
          err: 1,
          slow: 5,
          frustrated: 1,
          fail: 0,
          exception: 0,
          center_number: 3
        },
        depth: 0,
        chain_depth: 0
      }
    ],
    links: [
      // Web 到网关
      {
        from: { appsysid: 'sys-web' },
        to: { appsysid: 'sys-gateway' },
        link_type: 'sys',
        data: {
          total: 2630,
          dur: 9,
          err: 0,
          slow: 1,
          frustrated: 0,
          fail: 0,
          exception: 0
        }
      },
      // 网关到服务
      {
        from: { appsysid: 'sys-gateway' },
        to: { appsysid: 'sys-user' },
        link_type: 'sys',
        data: {
          total: 8500,
          dur: 13,
          err: 1,
          slow: 2,
          frustrated: 0,
          fail: 0,
          exception: 0
        }
      },
      {
        from: { appsysid: 'sys-gateway' },
        to: { appsysid: 'sys-order' },
        link_type: 'sys',
        data: {
          total: 7200,
          dur: 19,
          err: 4,
          slow: 5,
          frustrated: 1,
          fail: 0,
          exception: 1
        }
      },
      {
        from: { appsysid: 'sys-gateway' },
        to: { appsysid: 'sys-payment' },
        link_type: 'sys',
        data: {
          total: 1600,
          dur: 25,
          err: 0,
          slow: 1,
          frustrated: 0,
          fail: 0,
          exception: 0
        }
      },
      {
        from: { appsysid: 'sys-gateway' },
        to: { appsysid: 'sys-product' },
        link_type: 'sys',
        data: {
          total: 5600,
          dur: 14,
          err: 0,
          slow: 0,
          frustrated: 0,
          fail: 0,
          exception: 0
        }
      },
      // 服务间调用
      {
        from: { appsysid: 'sys-user' },
        to: { appsysid: 'sys-order' },
        link_type: 'sys',
        data: {
          total: 4400,
          dur: 36,
          err: 1,
          slow: 3,
          frustrated: 0,
          fail: 0,
          exception: 0
        }
      },
      {
        from: { appsysid: 'sys-order' },
        to: { appsysid: 'sys-payment' },
        link_type: 'sys',
        data: {
          total: 3200,
          dur: 46,
          err: 1,
          slow: 2,
          frustrated: 0,
          fail: 0,
          exception: 0
        }
      },
      {
        from: { appsysid: 'sys-order' },
        to: { appsysid: 'sys-product' },
        link_type: 'sys',
        data: {
          total: 2800,
          dur: 28,
          err: 0,
          slow: 1,
          frustrated: 0,
          fail: 0,
          exception: 0
        }
      },
      // 服务到缓存
      {
        from: { appsysid: 'sys-user' },
        to: { appsysid: 'sys-cache' },
        link_type: 'sys',
        data: {
          total: 31000,
          dur: 2,
          err: 0,
          slow: 0,
          frustrated: 0,
          fail: 0,
          exception: 0
        }
      },
      {
        from: { appsysid: 'sys-order' },
        to: { appsysid: 'sys-cache' },
        link_type: 'sys',
        data: {
          total: 17000,
          dur: 2,
          err: 0,
          slow: 0,
          frustrated: 0,
          fail: 0,
          exception: 0
        }
      },
      {
        from: { appsysid: 'sys-product' },
        to: { appsysid: 'sys-cache' },
        link_type: 'sys',
        data: {
          total: 14000,
          dur: 3,
          err: 0,
          slow: 0,
          frustrated: 0,
          fail: 0,
          exception: 0
        }
      },
      // 服务到数据库
      {
        from: { appsysid: 'sys-user' },
        to: { appsysid: 'sys-db' },
        link_type: 'sys',
        data: {
          total: 9000,
          dur: 16,
          err: 1,
          slow: 2,
          frustrated: 0,
          fail: 0,
          exception: 0
        }
      },
      {
        from: { appsysid: 'sys-order' },
        to: { appsysid: 'sys-db' },
        link_type: 'sys',
        data: {
          total: 7200,
          dur: 23,
          err: 2,
          slow: 3,
          frustrated: 1,
          fail: 0,
          exception: 0
        }
      },
      {
        from: { appsysid: 'sys-product' },
        to: { appsysid: 'sys-db' },
        link_type: 'sys',
        data: {
          total: 5600,
          dur: 20,
          err: 0,
          slow: 1,
          frustrated: 0,
          fail: 0,
          exception: 0
        }
      },
      {
        from: { appsysid: 'sys-payment' },
        to: { appsysid: 'sys-db' },
        link_type: 'sys',
        data: {
          total: 3200,
          dur: 30,
          err: 0,
          slow: 1,
          frustrated: 0,
          fail: 0,
          exception: 0
        }
      }
    ]
  }

  // 通过 toG6Data 转换数据格式
  const formattedData = toG6Data(rawData)
  graphData.nodes = formattedData.nodes || []
  graphData.edges = formattedData.edges || []
  graphData.combos = formattedData.combos || []

  show.value = true
}

function clearData() {
  graphData.nodes = []
  graphData.edges = []
  graphData.combos = []
  show.value = false
}

function changeLayout() {
  layoutIndex = (layoutIndex + 1) % layouts.length
  currentLayout.value = layouts[layoutIndex]
  
  if (lcG6.value) {
    const g6 = lcG6.value.getGraph()
    if (g6) {
      g6.updateLayout({
        type: currentLayout.value
      })
    }
  }
}

function onEvent(eventType, e) {
  console.log('G6 Event:', eventType, e)
  
  if (eventType === 'node:click') {
    const model = e.item.getModel()
    console.log('Node clicked:', model)
  } else if (eventType === 'edge:click') {
    const model = e.item.getModel()
    console.log('Edge clicked:', model)
  }
}

function onZoom(zoom) {
  currentZoom.value = zoom
  console.log('Zoom changed:', zoom)
}
</script>

<style lang="scss" scoped>
.lc-g6-demo {
  height: 100vh;
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

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }

    .demo-controls {
      display: flex;
      gap: 10px;
    }
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

      .label {
        color: #666;
      }

      .value {
        color: #333;
        font-weight: 500;
      }
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

  .tooltip-content {
    .tooltip-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 12px;

      .tooltip-label {
        color: #666;
      }

      .tooltip-value {
        color: #333;
        font-weight: 500;
      }
    }
  }
}
</style>

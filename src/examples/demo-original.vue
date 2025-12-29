<template>
  <div class="lc-g6-demo">
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
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import LcG6 from '../index.vue'
import LcLoadingIcon from '../lc-loading-icon.vue'
import { toG6Data, calcTopologyDepth } from '../compossible/data-format-methods.js'

const show = ref(false)
const lcG6 = ref(null)
const currentZoom = ref(1)
const currentLayout = ref('dagre-tbt')
const centerNodeAppsysid = 'sys-gateway' // 中心节点的appsysid
const centerNodeId = ref('sys-gateway') // 中心节点ID（转换后的ID，会在loadSampleData中更新）

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
      type: 'dagre-tbt'
    },
    activeNodes: [centerNodeId.value],
    centerNodes: [centerNodeId.value],
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

// 计算拓扑深度
function calculateTopologyDepth(nodes, links, centerId) {
  // 创建节点映射
  const nodeMap = new Map()
  nodes.forEach(node => {
    nodeMap.set(node.appsysid, node)
    node.depth = undefined
    node.chain_depth = undefined
  })

  // 创建边映射 - 出边和入边
  const outEdgesMap = new Map() // source -> [links]
  const inEdgesMap = new Map()  // target -> [links]
  
  links.forEach(link => {
    const fromId = link.from.appsysid
    const toId = link.to.appsysid
    
    if (!outEdgesMap.has(fromId)) outEdgesMap.set(fromId, [])
    if (!inEdgesMap.has(toId)) inEdgesMap.set(toId, [])
    
    outEdgesMap.get(fromId).push({ target: toId })
    inEdgesMap.get(toId).push({ source: fromId })
  })

  // 设置中心节点
  const centerNode = nodeMap.get(centerId)
  if (centerNode) {
    centerNode.depth = 0
    centerNode.chain_depth = 0
  }

  // BFS 计算调出层（depth > 0）
  const outQueue = [{ id: centerId, depth: 0 }]
  const outVisited = new Set([centerId])
  
  while (outQueue.length > 0) {
    const { id, depth } = outQueue.shift()
    
    if (outEdgesMap.has(id)) {
      outEdgesMap.get(id).forEach(edge => {
        const targetId = edge.target
        if (!outVisited.has(targetId)) {
          outVisited.add(targetId)
          const targetNode = nodeMap.get(targetId)
          if (targetNode) {
            const newDepth = depth + 1
            // 如果节点已经有depth且更小，保留更小的（更靠近中心）
            if (targetNode.depth === undefined || targetNode.depth > newDepth) {
              targetNode.depth = newDepth
              targetNode.chain_depth = newDepth
            }
            outQueue.push({ id: targetId, depth: newDepth })
          }
        }
      })
    }
  }

  // BFS 计算调入层（depth < 0）
  const inQueue = [{ id: centerId, depth: 0 }]
  const inVisited = new Set([centerId])
  
  while (inQueue.length > 0) {
    const { id, depth } = inQueue.shift()
    
    if (inEdgesMap.has(id)) {
      inEdgesMap.get(id).forEach(edge => {
        const sourceId = edge.source
        if (!inVisited.has(sourceId)) {
          inVisited.add(sourceId)
          const sourceNode = nodeMap.get(sourceId)
          if (sourceNode) {
            const newDepth = depth - 1
            // 如果节点已经有depth且更大（绝对值更小），保留更小的
            if (sourceNode.depth === undefined || sourceNode.depth < newDepth) {
              sourceNode.depth = newDepth
              sourceNode.chain_depth = newDepth
            }
            inQueue.push({ id: sourceId, depth: newDepth })
          }
        }
      })
    }
  }

  // 确保所有节点都有 depth
  nodes.forEach(node => {
    if (node.depth === undefined) {
      node.depth = 0
      node.chain_depth = 0
    }
  })
}

function loadSampleData() {
  // 参考 system-topo-view-v2.vue 的数据格式
  // 使用 { nodes: [], links: [], props: [] } 格式，然后通过 toG6Data 转换
  const rawData = {
    props: ['appsysid'],
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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

  // 计算拓扑深度
  calculateTopologyDepth(rawData.nodes, rawData.links, centerNodeAppsysid)
  
  // 确保中心节点在数组顶部
  const centerIndex = rawData.nodes.findIndex(node => node.appsysid === centerNodeAppsysid)
  if (centerIndex > 0) {
    const centerNode = rawData.nodes[centerIndex]
    rawData.nodes.splice(centerIndex, 1)
    rawData.nodes.unshift(centerNode)
  }

  // 计算拓扑深度（处理数组形式的depth）
  calcTopologyDepth(rawData)

  // 保存原始数据，用于后续展开节点
  originalRawData = rawData

  // 通过 toG6Data 转换数据格式
  const formattedData = toG6Data(rawData)
  graphData.nodes = formattedData.nodes || []
  graphData.edges = formattedData.edges || []
  graphData.combos = formattedData.combos || []

  // 找到转换后的中心节点ID（使用getJoinId生成的ID）
  // 对于只有appsysid的情况，ID就是appsysid本身
  const centerNode = formattedData.nodes.find(node => node.id === centerNodeAppsysid || node.props?.appsysid === centerNodeAppsysid)
  if (centerNode) {
    centerNodeId.value = centerNode.id
  }

  show.value = true
  
  // 在下一个tick中激活节点
  nextTick(() => {
    if (lcG6.value) {
      lcG6.value.activeNodes()
    }
  })
}

// 创建 Mock 节点数据
function createMockNodeData(mockNodeId, index, type, node_depth) {
  return {
    total: Math.floor(Math.random() * 5000) + 500,
    dur: Math.floor(Math.random() * 100) + 5,
    err: Math.floor(Math.random() * 5),
    slow: Math.floor(Math.random() * 10),
    frustrated: Math.floor(Math.random() * 3),
    fail: Math.floor(Math.random() * 2),
    exception: Math.floor(Math.random() * 3)
  }
}

// 创建 Mock 节点
function createMockNode(mockNodeId, index, type, node_depth) {
  return {
    appsysid: mockNodeId,
    id: mockNodeId,
    app_name: `Mock节点 ${index + 1} (${type === 'out' ? '调出' : '调入'})`,
    node_type: 'sys',
    statusType: Math.random() > 0.8 ? 'warning' : 'normal',
    shape: 'hexagonal-polygon',
    showIcon: false,
    center: { text: '应用' },
    data: {
      total: Math.floor(Math.random() * 10000) + 1000,
      dur: Math.floor(Math.random() * 200) + 10,
      err: Math.floor(Math.random() * 10),
      slow: Math.floor(Math.random() * 20),
      frustrated: Math.floor(Math.random() * 5),
      fail: Math.floor(Math.random() * 3),
      exception: Math.floor(Math.random() * 5),
      center_number: 0
    },
    depth: type === 'out' ? node_depth : -node_depth,
    chain_depth: type === 'out' ? node_depth : -node_depth
  }
}

// 从原始数据创建节点
function createNodeFromTemplate(templateNode, targetAppsysid, node_depth, type) {
  return {
    ...templateNode,
    appsysid: targetAppsysid,
    id: targetAppsysid,
    depth: type === 'out' ? node_depth : -node_depth,
    chain_depth: type === 'out' ? node_depth : -node_depth
  }
}

// 创建关联链路
function createLink(sourceId, targetId, linkType, linkData) {
  return {
    from: { appsysid: sourceId },
    to: { appsysid: targetId },
    link_type: linkType || 'sys',
    data: linkData || {}
  }
}

// 获取拓扑深度数据（用于展开下一层）- 动态创建和关联
async function getTopologyDepthData(nodeId, type, model) {
  const g6 = lcG6.value?.getGraph()
  if (!g6) return { nodes: [], links: [], props: ['appsysid'] }

  // 获取所有现有的节点ID，避免重复添加
  const existingNodeIds = new Set(g6.getNodes().map(n => n.getModel().id))
  const newNodes = []
  const newLinks = []
  
  // 计算节点深度（参考 business-topo-v2.vue）
  const node_depth = Math.abs(model.chain_depth || model.node_depth || 0) + 1
  
  // 从原始数据中查找相关的链接（如果有原始数据）
  let relevantLinks = []
  if (originalRawData?.links) {
    relevantLinks = originalRawData.links.filter(link => {
      const fromId = link.from.appsysid
      const toId = link.to.appsysid
      
      if (type === 'out') {
        return fromId === nodeId && !existingNodeIds.has(toId)
      } else if (type === 'in') {
        return toId === nodeId && !existingNodeIds.has(fromId)
      }
      return false
    })
  }
  
  // 如果没有找到相关链接，动态创建新的节点和链路
  if (relevantLinks.length === 0) {
    // Mock 创建 1-3 个新节点
    const mockNodeCount = Math.floor(Math.random() * 3) + 1
    
    for (let i = 0; i < mockNodeCount; i++) {
      const mockNodeId = `mock-${nodeId}-${type}-${node_depth}-${i}`
      
      if (!existingNodeIds.has(mockNodeId)) {
        const newNode = createMockNode(mockNodeId, i, type, node_depth)
        newNodes.push(newNode)
        existingNodeIds.add(mockNodeId)
        
        // 创建关联链路
        const linkData = createMockNodeData(mockNodeId, i, type, node_depth)
        const sourceId = type === 'out' ? nodeId : mockNodeId
        const targetId = type === 'out' ? mockNodeId : nodeId
        newLinks.push(createLink(sourceId, targetId, 'sys', linkData))
      }
    }
  } else {
    // 使用原始数据中的链接
    relevantLinks.forEach(link => {
      const targetAppsysid = type === 'out' ? link.to.appsysid : link.from.appsysid
      const sourceAppsysid = type === 'out' ? link.from.appsysid : link.to.appsysid
      
      if (!existingNodeIds.has(targetAppsysid)) {
        const templateNode = originalRawData.nodes.find(n => n.appsysid === targetAppsysid)
        
        if (templateNode) {
          const newNode = createNodeFromTemplate(templateNode, targetAppsysid, node_depth, type)
          newNodes.push(newNode)
          existingNodeIds.add(targetAppsysid)
          
          // 创建关联链路
          newLinks.push(createLink(sourceAppsysid, targetAppsysid, link.link_type, link.data))
        }
      }
    })
  }
  
  // 如果只有一个节点，且是当前节点，清空数据（参考 business-topo-v2.vue）
  if (newLinks.length === 0 && newNodes.length === 1 && newNodes[0].appsysid === nodeId) {
    return { nodes: [], links: [], props: ['appsysid'] }
  }
  
  return {
    nodes: newNodes,
    links: newLinks,
    props: ['appsysid']
  }
}

// 辅助变量：保存原始数据，用于后续展开节点
let originalRawData = null

function onEvent(eventType, e) {
  console.log('G6 Event:', eventType, e)
  
  if (eventType === 'node:click') {
    onNodeClick(e)
  } else if (eventType === 'edge:click') {
    const model = e.item.getModel()
    console.log('Edge clicked:', model)
  }
}

async function onNodeClick(e) {
  const g6 = lcG6.value
  if (!g6) return
  
  const model = e.item.getModel()
  
  // 检查是否是展开/折叠事件
  if (e.target?.get('event-name') === 'node-collapsed') {
    const centerNodes = g6Options.value?.centerNodes || []
    if (centerNodes.some(nodeId => nodeId === model.id)) return // 中心节点直接 return
    
    if (model.disabled_collapse) return
    if (model[e.target.get('disabled-name')]) return
    
    // 参考文件中的逻辑：检查 collapsed-name 是否为 false（展开状态）
    // 注意：此时状态已经被 event.js 翻转了，如果现在是 false（展开状态），说明之前是 true（折叠状态），需要展开
    if (!model[e.target.get('collapsed-name')]) return
    
    const edgeType = e.target.get('node-edge-type')
    
    let data = null
    if (edgeType === 'out-edges' || model.duplex_edge_type === 'out-edges') {
      // 获取调出数据
      data = await getTopologyDepthData(model.id, 'out', model)
    } else if (edgeType === 'in-edges' || model.duplex_edge_type === 'in-edges') {
      // 获取调入数据
      data = await getTopologyDepthData(model.id, 'in', model)
    }

    data = toG6Data(data)
    g6.addData({ e, node_edge_type: edgeType, model }, data)
    
    nextTick(() => {
      g6.activeNodes()
    })
    
    return
  }
  
  // 其他节点点击事件
  console.log('Node clicked:', model)
}

function onZoom(zoom) {
  currentZoom.value = zoom
  console.log('Zoom changed:', zoom)
}

onMounted(() => {
  loadSampleData()
})
</script>

<style lang="scss" scoped>
.lc-g6-demo {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;

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

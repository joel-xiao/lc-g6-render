<template>
  <div class="system-overview-topo-view">
    <div class="system-overview-topo-content" :style="{'opacity': applicationShow ? 0 : 1}" v-if="showView">
      <LcG6
        :options="g6Options"
        ref="lcG6"
        :data="data"
        @event="onAfterEvent"
      >
        <template v-slot:tooltip="slotProps">
          <ApplicationTooltip
            :model="slotProps.model"
            :item="slotProps.item"
            @item-click="onTooltipItemClick"
          />
        </template>
      </LcG6>
    </div>

    <div class="system-topology-view-header" v-show="showView && isBack">
      <el-button size="small" @click="onBack">
        <i class="lc-apptrace-back" />
        <span class="text">&nbsp;返回上一级</span>
      </el-button>
    </div>

    <div>
      <div v-show="insertEdgesLoading" class="insert-edges-loading-mark"></div>

      <div
        v-show="!showView || insertEdgesLoading"
        class="no-data"
        :class="{ 'insert-edges-loading': insertEdgesLoading }"
      >
        <lc-loading-icon></lc-loading-icon>

        <div class="text" style="font-size: 12px; color: #666; margin-top: 5px">
          节点信息获取中
        </div>
      </div>
    </div>

    <ApplicationTopologyView
      @close="onCloseApplicationTopology"
      ref="applicationTopology"
      :appGroups="AppGroups"
      :topologyOption="topologyOption"
    />
  </div>
</template>

<script>
import { debounce } from "lodash";
import LcG6 from "../index.vue";
import AppTopologyEvent from '../compossible/behaviors/app-topology-event/index.js';
import {
  getLayoutData,
  filterSelfNodeData,
} from "../compossible/data/format";
import LcLoadingIcon from "../lc-loading-icon.vue";
// import ApplicationTopologyView from "./application-topology-view.vue";
// import ApplicationTooltip from "./application-tooltip.vue";

function getNodeDisabledCollapse(node) {
  // 组内的节点（应用节点）不应该有展开收起按钮
  // 只有系统节点（不在组内的）才可能有展开收起按钮
  return (
    node.is_user ||
    node.is_external ||
    node.is_deleted ||
    node.node_type === "app" || // 应用节点（组内节点）禁用展开收起
    !!node.comboId // 在组内的节点都禁用展开收起
  );
}


// 临时占位组件 - 使用 render 函数避免模板编译问题
const ApplicationTopologyView = {
  props: ['appGroups', 'topologyOption'],
  methods: {
    open() {},
    hide() {}
  },
  render() {
    return null;
  }
};

const ApplicationTooltip = {
  props: ['model', 'item'],
  emits: ['item-click'],
  render() {
    return null;
  }
};

export default {
  name: "SystemOverviewTopoView",
  emits: ["business-click"],
  components: {
    LcG6,
    LcLoadingIcon,
    ApplicationTopologyView,
    ApplicationTooltip,
  },

  data() {
    return {
      is_activated: true,
      showView: false,
      applicationShow: false,
      insertEdgesLoading: false,
      nodeStatusConfig: null,
      ts: "",
      period: [Date.now() - 3600000, Date.now()], // Mock period: last 1 hour
      serviceType: {},

      appGroups: [],
      data: {
        nodes: [],
        edges: [],
        combos: []
      },

      appTopologyData: {
        nodes: [],
        edges: [],
        combos: []
      },

      edge: false,
      timeout: null,
      old_period: null,

      topologyOption: {
        appsysid: "",
        appid: "",
        external: true,
        outDeep: 3,
        inDeep: 3,
      },
      app_center_id: "",
      is_insert_edges_view: false,
      changeType: false,
      collapsed: true,
      app_data_props: []
    };
  },

  computed: {
    AppGroups() {
      return this.appGroups || [];
    },

    AppList() {
      const result =
        this.AppGroups.find((biz) => biz.id === this.topologyOption.appsysid)
          ?.children || [];
      if (!this.topologyOption.appid) this.topologyOption.appid = result[0]?.id;
      return result.map((r) => {
        return {
          label: r.name,
          value: r.id,
        };
      });
    },

    g6Options() {
      const that = this;
      // Helper functions for tooltip
      const bigNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
      };
      
      const timeFormat = (ms) => {
        if (!ms) return '0ms';
        if (ms >= 1000) return (ms / 1000).toFixed(2) + 's';
        return Math.round(ms) + 'ms';
      };
      
      const calcKpiRate = (total, value) => {
        if (!total || total === 0) return '0.00%';
        return ((value / total) * 100).toFixed(2) + '%';
      };
      
      return {
        legend: true,
        minimap: true,
        customBehaviors: [AppTopologyEvent, 'collapse-expand-combo', 'drag-combo'],
        tooltip: {
          show: true,
          width: "500px",
          data(model, tooltip_type, item) {
            if (tooltip_type === "node" || tooltip_type === "combo") {
              if (model.statusType === "user") return;
              if (model.statusType === "external") {
                return {
                  width: "300px",
                  node: [
                    {
                      label: "外部服务-请求数",
                      type: "metric-header",
                      prix: false,
                      noMetric: true,
                      metrics: [
                        {
                          label: "",
                          key: "",
                        },
                      ],
                    },
                    {
                      label: "调入",
                      bgColor: "#FFFFFF0D",
                      prix: false,
                      width: "100%",
                      node_key: "in",
                      metrics(item, node) {
                        return (node.data.children || []).map((r) => {
                          return {
                            label:
                              r.props.appsysid?.split("EXTERNAL_SERVICE⚊")[1] ||
                              r.props.appid?.split("EXTERNAL_SERVICE⚊")[1] ||
                              r.props.agentid ||
                              r.props.ip ||
                              "--",
                            value: r.data.total,
                          };
                        });
                      },
                    },
                  ],
                };
              } else {
                const sys = model.node_type === "sys";
                const is_permission = model.is_permission && !model.is_deleted;
                const g6_example = that.$refs.lcG6?.getExample();
                if (!g6_example) return;

                const caching_current_model = "outer.event.node-click.current";
                const is_insert_edges = !!g6_example.caching.getCaching(caching_current_model);
                
                const g6 = that.getG6Graph();
                if (!g6) return;
                const edges = g6.getEdges();
                const source_sys = edges.some(
                  (edge) =>
                    edge.getModel().target === model.id &&
                    g6.find(
                      "node",
                      (node) =>
                        node.getModel().id === edge.getModel().source &&
                        node.getModel().node_type === "sys",
                    ),
                );
                const target_sys = edges.some(
                  (edge) =>
                    edge.getModel().source === model.id &&
                    g6.find(
                      "node",
                      (node) =>
                        node.getModel().id === edge.getModel().target &&
                        node.getModel().node_type === "sys",
                    ),
                );
                const node = [
                  {
                    label: model.title,
                    type: "metric-header",
                    prix: false,
                    metrics: [{ label: "问题数：", key: "questions" }],
                  },
                  {
                    label: "调入",
                    bgColor: "#FFFFFF0D",
                    width: "calc(50% - 5px)",
                    mgR: "10px",
                    prix: false,
                    node_key: "in",
                    metrics: [
                      {
                        label: `请求数${ (is_insert_edges || (sys || source_sys)) ? "" : "+外部请求数"}`,
                        key: "total",
                        format(metric, data) {
                          const total = bigNumber(data[metric.key] || 0);
                          const external = (is_insert_edges || (sys || source_sys)) ? "" : "+" + bigNumber(data["external_in_total"] || 0);
                          return total + external;
                        },
                      },
                      {
                        label: "平均响应时间",
                        key: "dur",
                        format(metric, data) {
                          const avgDur = (data[metric.key] || 0) / (data.total || 1);
                          return timeFormat(avgDur);
                        },
                      },
                      {
                        label: "缓慢数(率)",
                        key: "slow",
                        link: is_permission,
                        format(metric, data) {
                          const value = bigNumber(data[metric.key] || 0);
                          const rate = calcKpiRate(data.total, data[metric.key] || 0);
                          return `${value} (${rate})`;
                        },
                      },
                      {
                        label: "极慢数(率)",
                        key: "frustrated",
                        link: is_permission,
                        format(metric, data) {
                          const value = bigNumber(data[metric.key] || 0);
                          const rate = calcKpiRate(data.total, data[metric.key] || 0);
                          return `${value} (${rate})`;
                        },
                      },
                      {
                        label: "错误数(率)",
                        key: "err",
                        link: is_permission,
                        format(metric, data) {
                          const value = bigNumber(data[metric.key] || 0);
                          const rate = calcKpiRate(data.total, data[metric.key] || 0);
                          return `${value} (${rate})`;
                        },
                      },
                      {
                        label: "失败数(率)",
                        key: "fail",
                        link: is_permission,
                        format(metric, data) {
                          const value = bigNumber(data[metric.key] || 0);
                          const rate = calcKpiRate(data.total, data[metric.key] || 0);
                          return `${value} (${rate})`;
                        },
                      },
                      {
                        label: "异常请求数(率)",
                        key: "exception",
                        link: is_permission,
                        format(metric, data) {
                          const value = bigNumber(data[metric.key] || 0);
                          const rate = calcKpiRate(data.total, data[metric.key] || 0);
                          return `${value} (${rate})`;
                        },
                      },
                    ],
                  },
                  {
                    label: "调出",
                    bgColor: "#FFFFFF0D",
                    width: "calc(50% - 5px)",
                    prix: false,
                    node_key: "out",
                    metrics: [
                      {
                        label: `请求数${(is_insert_edges || (sys || target_sys)) ? "" : "+外部请求数"}`,
                        key: "out_total",
                        format(metric, data) {
                          const total = bigNumber(data[metric.key] || 0);
                          const external = (is_insert_edges || (sys || target_sys)) ? "" : "+" + bigNumber(data["external_out_total"] || 0);
                          return total + external;
                        },
                      },
                      {
                        label: "平均响应时间",
                        key: "out_dur",
                        format(metric, data) {
                          const avgDur = (data[metric.key] || 0) / (data.out_total || 1);
                          return timeFormat(avgDur);
                        },
                      },
                      {
                        label: "缓慢数(率)",
                        key: "out_slow",
                        format(metric, data) {
                          const value = bigNumber(data[metric.key] || 0);
                          const rate = calcKpiRate(data.out_total, data[metric.key] || 0);
                          return `${value} (${rate})`;
                        },
                      },
                      {
                        label: "极慢数(率)",
                        key: "out_frustrated",
                        format(metric, data) {
                          const value = bigNumber(data[metric.key] || 0);
                          const rate = calcKpiRate(data.out_total, data[metric.key] || 0);
                          return `${value} (${rate})`;
                        },
                      },
                      {
                        label: "错误数(率)",
                        key: "out_err",
                        format(metric, data) {
                          const value = bigNumber(data[metric.key] || 0);
                          const rate = calcKpiRate(data.out_total, data[metric.key] || 0);
                          return `${value} (${rate})`;
                        },
                      },
                      {
                        label: "失败数(率)",
                        key: "out_fail",
                        format(metric, data) {
                          const value = bigNumber(data[metric.key] || 0);
                          const rate = calcKpiRate(data.out_total, data[metric.key] || 0);
                          return `${value} (${rate})`;
                        },
                      },
                      {
                        label: "异常请求数(率)",
                        key: "out_exception",
                        format(metric, data) {
                          const value = bigNumber(data[metric.key] || 0);
                          const rate = calcKpiRate(data.out_total, data[metric.key] || 0);
                          return `${value} (${rate})`;
                        },
                      },
                    ],
                  },
                ];

                if (!sys) {
                  node.push({
                    label: "业务",
                    mgT: "10px",
                    pdB: "16px",
                    width: "100%",
                    node_key: "biz",
                    maxHeight: '120px',
                    bgColor: "#FFFFFF0D",
                    async metrics(item, node) {
                      let result = await that.getModels(node);
                      return result.map((r) => {
                        return {
                          ...r,
                          label: r.name,
                          link: false,
                          value: r.total,
                        };
                      });
                    },
                  });
                }
                
                const nodes = { [tooltip_type]: node };

                const is_in = edges.some( edge => edge.getModel().target === model.id);
                const is_out = edges.some( edge => edge.getModel().source === model.id);
                
                const is_out_sum = !!model.data.out_total;
                const is_sys_out = is_out_sum && model.node_type === 'sys';
                const is_external_out = !!model.data.external_out_total;
                const is_external_in = !!model.data.external_in_total;

                if (is_external_out && is_external_in || is_in && is_out || is_sys_out) {
  
                } else if (model.is_client) {
                  nodes[tooltip_type] = nodes[tooltip_type].filter(
                    (r) => r.label !== "调入",
                  );
                } else if (!is_external_out && !is_out) {
                  nodes[tooltip_type] = nodes[tooltip_type].filter(
                    (r) => r.label !== "调出",
                  );
                } else if (!is_external_in && !is_in) {
                  nodes[tooltip_type] = nodes[tooltip_type].filter(
                    (r) => r.label !== "调入",
                  );
                }

                return nodes;
              }
            } else if (tooltip_type === "edge") {
              const is_not_link = model.is_not_link;
              return {
                width: "256px",
                edge: [
                  {
                    label: "调入",
                    data_key: "to",
                    link: !is_not_link,
                    metrics: [
                      {
                        label: "请求数",
                        key: "total",
                        format(metric, data) {
                          return bigNumber(data[metric.key] || 0);
                        },
                      },
                      {
                        label: "平均响应时间",
                        key: "dur",
                        format(metric, data) {
                          const avgDur = (data[metric.key] || 0) / (data.total || 1);
                          return timeFormat(avgDur);
                        },
                      },
                    ],
                  },
                  {
                    label: "调出",
                    data_key: "from",
                    link: !is_not_link,
                    metrics: [
                      {
                        label: "请求数",
                        key: "total",
                        format(metric, data) {
                          return bigNumber(data[metric.key] || 0);
                        },
                      },
                      {
                        label: "平均响应时间",
                        key: "dur",
                        format(metric, data) {
                          const avgDur = (data[metric.key] || 0) / (data.total || 1);
                          return timeFormat(avgDur);
                        },
                      },
                    ],
                  },
                ],
              };
            }
          },

          events: {
            async click(item, e) {
              if (item.target === "item-label") {
                that.onEdgeClick(
                  { ...item.model, data_tooltip_key: item.item.data_key },
                  "tooltip-click",
                );
              }

              if (item.target === "metric-label") {
                const metric = item.item.metrics[item.metric_idx];
                if (item.item?.label && item.item?.label === "业务") {
                  // Business click handler
                } else if (metric.link) {
                  // Metric link click handler
                  console.log('Metric clicked:', metric.key, item.model);
                }
              } else if (item.target === "tab-click") {
                that.$refs.lcG6.refresh(item.target_id);
              }
            },
          },
        },
        layout: {
          type: "dagre-tgb",
        },
        activeNodes: [this.topologyOption.appsysid, this.app_center_id],
        centerNodes: [this.topologyOption.appsysid, this.app_center_id],
        defaultEdge: {
          style: {
            cursor: "pointer",
          },
        },
        defaultNode: {
          shape: "hexagonal-polygon",
          center: {
            text: "应用",
          },
        },
        defaultCombo: {
          center: {
            show: true,
            text: "应用",
          },
          header: {
            label: "",
            show: true,
            rights: [
              { label: "应用数", key: "curr_app_total", fill: "#00B42A" },
            ],
          },
        },
        defaultMergeNode: {
          notDataKeys: ["center_number", "app_total"],
        },
      };
    },

    isBack() {
      return false;
    },
  },

  watch: {
    appGroups() {
      this.loadData();
    },
  },

  created() {
    this.getTopology = debounce(
      () => {
        this.loadTopology();
      },
      1000,
      { trailing: true },
    );
  },

  async mounted() {
    await this.getAppGroups();
    await this.loadTopologyStatus();
    await this.fetchServiceType();
    this.loadData();
  },

  activated() {
    this.is_activated = true;
  },

  deactivated() {
    this.is_activated = false;
  },

  methods: {
    async getAppGroups() {
      // Mock data for demo
      this.appGroups = [
        {
          id: "demo-sys",
          name: "Demo System",
          is_permission: true,
          children: [
            { id: "demo-app", name: "Demo App", is_permission: true }
          ]
        },
        {
          id: "sys-level1-out-1",
          name: "Level1 Out System 1",
          is_permission: true,
          children: []
        },
        {
          id: "sys-level1-out-2",
          name: "Level1 Out System 2",
          is_permission: true,
          children: []
        },
        {
          id: "sys-level2-out-1",
          name: "Level2 Out System 1",
          is_permission: true,
          children: []
        },
        {
          id: "sys-level1-in-1",
          name: "Level1 In System 1",
          is_permission: true,
          children: []
        },
        {
          id: "sys-level1-in-2",
          name: "Level1 In System 2",
          is_permission: true,
          children: []
        },
        {
          id: "sys-level2-in-1",
          name: "Level2 In System 1",
          is_permission: true,
          children: []
        }
      ];
      if (this.appGroups.length > 0) {
        this.topologyOption.appsysid = this.appGroups[0].id;
        if (this.appGroups[0].children?.length > 0) {
          this.topologyOption.appid = this.appGroups[0].children[0].id;
        }
      }
    },

    getG6Graph() {
      const g6 = this.$refs.lcG6;
      if (g6) {
        const g6_graph = g6.getGraph();
        return g6_graph;
      }
      return null;
    },

    loadData() {
      this.getTopology();
    },

    async loadTopologyStatus() {
      if (!this.is_activated) return;
      // Mock node status config
      this.nodeStatusConfig = null;
    },

    async fetchServiceType() {
      if (!this.is_activated) return;
      // Mock service type
      this.serviceType = {};
    },

    calcNodeStatus(node) {
      // Mock calc node status
    },

    // 确保所有节点都有边连接
    ensureAllNodesConnected() {
      const nodeMap = new Map();
      const connectedNodeIds = new Set();
      
      // 创建节点映射
      this.data.nodes.forEach(node => {
        nodeMap.set(node.id, node);
      });
      
      // 收集所有已连接的节点ID
      this.data.edges.forEach(edge => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      });
      
      // 找到中心节点（作为连接目标）
      const centerNodeId = `${this.topologyOption.appsysid}-`;
      const centerNode = nodeMap.get(centerNodeId);
      
      // 为所有未连接的节点添加连接到中心节点
      this.data.nodes.forEach(node => {
        if (!connectedNodeIds.has(node.id) && node.id !== centerNodeId) {
          // 根据节点类型决定连接方向
          // 系统节点连接到中心系统节点
          if (node.node_type === 'sys') {
            // 如果是外部服务，从中心节点连接到它
            if (node.is_external) {
              this.data.edges.push({
                source: centerNodeId,
                target: node.id,
                type: "cubic-v-circle-run",
                data: { 
                  pending: { layer: "sys" },
                  ...this.getMockLinkData()
                },
                source_props: centerNode?.props || { appsysid: this.topologyOption.appsysid, appid: "" },
                target_props: node.props || {}
              });
            } else {
              // 其他系统节点，从它们连接到中心节点
              this.data.edges.push({
                source: node.id,
                target: centerNodeId,
                type: "cubic-v-circle-run",
                data: { 
                  pending: { layer: "sys" },
                  ...this.getMockLinkData()
                },
                source_props: node.props || {},
                target_props: centerNode?.props || { appsysid: this.topologyOption.appsysid, appid: "" }
              });
            }
          } 
          // 应用节点连接到中心应用节点
          else if (node.node_type === 'app') {
            const centerAppId = `${this.topologyOption.appsysid}-${this.topologyOption.appid || 'demo-app'}`;
            const centerAppNode = nodeMap.get(centerAppId);
            
            if (centerAppNode) {
              // 从中心应用连接到其他应用
              this.data.edges.push({
                source: centerAppId,
                target: node.id,
                type: "line-circle-run",
                data: { 
                  pending: { layer: "app" },
                  ...this.getMockLinkData()
                },
                source_props: centerAppNode.props || {},
                target_props: node.props || {},
                comboId: node.comboId,
                link_type: "app"
              });
            }
          }
          
          connectedNodeIds.add(node.id);
        }
      });
    },

    // 计算拓扑深度（参考 demo-original.vue）
    calculateTopologyDepth(nodes, edges, centerId) {
      // 创建节点映射
      const nodeMap = new Map();
      nodes.forEach(node => {
        nodeMap.set(node.id, node);
        node.node_depth = undefined;
        node.chain_depth = undefined;
      });

      // 创建边映射 - 出边和入边
      const outEdgesMap = new Map(); // source -> [edges]
      const inEdgesMap = new Map();  // target -> [edges]
      
      edges.forEach(edge => {
        const fromId = edge.source;
        const toId = edge.target;
        
        if (!outEdgesMap.has(fromId)) outEdgesMap.set(fromId, []);
        if (!inEdgesMap.has(toId)) inEdgesMap.set(toId, []);
        
        outEdgesMap.get(fromId).push({ target: toId });
        inEdgesMap.get(toId).push({ source: fromId });
      });

      // 设置中心节点
      const centerNode = nodeMap.get(centerId);
      if (centerNode) {
        centerNode.node_depth = 0;
        centerNode.chain_depth = 0;
      }

      // BFS 计算调出层（depth > 0）
      const outQueue = [{ id: centerId, depth: 0 }];
      const outVisited = new Set([centerId]);
      
      while (outQueue.length > 0) {
        const { id, depth } = outQueue.shift();
        
        if (outEdgesMap.has(id)) {
          outEdgesMap.get(id).forEach(edge => {
            const targetId = edge.target;
            if (!outVisited.has(targetId)) {
              outVisited.add(targetId);
              const targetNode = nodeMap.get(targetId);
              if (targetNode) {
                const newDepth = depth + 1;
                // 如果节点已经有depth且更小，保留更小的（更靠近中心）
                if (targetNode.node_depth === undefined || targetNode.node_depth > newDepth) {
                  targetNode.node_depth = newDepth;
                  targetNode.chain_depth = newDepth;
                }
                outQueue.push({ id: targetId, depth: newDepth });
              }
            }
          });
        }
      }

      // BFS 计算调入层（depth < 0）
      const inQueue = [{ id: centerId, depth: 0 }];
      const inVisited = new Set([centerId]);
      
      while (inQueue.length > 0) {
        const { id, depth } = inQueue.shift();
        
        if (inEdgesMap.has(id)) {
          inEdgesMap.get(id).forEach(edge => {
            const sourceId = edge.source;
            if (!inVisited.has(sourceId)) {
              inVisited.add(sourceId);
              const sourceNode = nodeMap.get(sourceId);
              if (sourceNode) {
                const newDepth = depth - 1;
                // 如果节点已经有depth且更大（绝对值更小），保留更小的
                if (sourceNode.node_depth === undefined || sourceNode.node_depth < newDepth) {
                  sourceNode.node_depth = newDepth;
                  sourceNode.chain_depth = newDepth;
                }
                inQueue.push({ id: sourceId, depth: newDepth });
              }
            }
          });
        }
      }

      // 确保所有节点都有 depth
      nodes.forEach(node => {
        if (node.node_depth === undefined) {
          node.node_depth = 0;
          node.chain_depth = 0;
        }
      });

      // 更新边的 edge_depth 根据目标节点的 node_depth
      edges.forEach(edge => {
        const targetNode = nodeMap.get(edge.target);
        if (targetNode && targetNode.node_depth !== undefined) {
          edge.edge_depth = targetNode.node_depth;
        }
      });
    },

    async loadTopology() {
      clearTimeout(this.timeout);
      if (this.applicationShow) return;
      if (!this.is_activated) return;
      this.old_period = `${this.period[0]},${this.period[1]}`;
      this.showView = false;
      if (
        !this.topologyOption.appsysid ||
        !this.AppGroups ||
        !this.AppGroups.length
      )
        return;

      // 直接获取 G6 格式的拓扑数据
      const mockSysTopo = this.getMockSysTopoData();
      await this.loadAppTopology();
      
      // 合并系统拓扑和应用拓扑数据
      this.data = {
        nodes: [...(mockSysTopo.nodes || []), ...(this.appTopologyData.nodes || [])],
        edges: [...(mockSysTopo.edges || []), ...(this.appTopologyData.edges || [])],
        combos: [...(mockSysTopo.combos || []), ...(this.appTopologyData.combos || [])]
      };
      
      // 计算拓扑深度（使用 BFS 从中心节点计算）
      const centerNodeId = `${this.topologyOption.appsysid}-`;
      this.calculateTopologyDepth(this.data.nodes, this.data.edges, centerNodeId);
      
      // 设置 combo 的 depth（应该和中心节点一致）
      if (this.data.combos && this.data.combos.length > 0) {
        const centerNode = this.data.nodes.find(node => node.id === centerNodeId);
        if (centerNode) {
          this.data.combos.forEach(combo => {
            combo.node_depth = centerNode.node_depth || 0;
            combo.chain_depth = centerNode.chain_depth || 0;
          });
        }
      }
      
      // Mock 数据已经是 G6 格式，不需要转换
      
      // 更新 combo 数据
      if (this.data.combos && this.data.combos.length > 0) {
        const combo = this.data.combos[0];
        const appNodes = this.data.nodes.filter(node => node.comboId === combo.id);
        combo.data.curr_app_total = appNodes.length;
        combo.data.app_total = appNodes.length;
        if (combo.data.curr_app_total !== combo.data.app_total) {
          combo.data.curr_app_total = `${combo.data.curr_app_total || 0} / ${combo.data.app_total}`;
        }
      }

      // 确保所有节点都有边连接
      this.ensureAllNodesConnected();

      for (let node of this.data.nodes) {
        const edges = this.data.edges.filter(
          (edge) => edge.target === node.id || edge.source === node.id,
        );
        node.edges_number = edges.length;

        if (edges.length === 1 && edges[0].target === edges[0].source) {
          node.edges_number = 0.5;
        }
      }

      this.showView = true;
      this.$nextTick(() => {
        this.loadPendingNodes(this.data, true);
      });
    },
    
    getMockSysTopoData() {
      const sysId = this.topologyOption.appsysid || "demo-sys";
      const centerNodeId = `${sysId}-`;
      
      // 直接生成 G6 格式的节点（depth 将由 calculateTopologyDepth 根据边的连接关系计算）
      // 确保所有状态都显示：normal, warning, abnormal, disabled, external, moved, user
      const nodes = [
        // 第一层调出节点 - 普通节点使用 normal 状态
        {
          id: "sys-level1-out-1-",
          title: "Level1 Out System 1",
          node_type: "sys",
          is_permission: true,
          statusType: "normal",
          showIcon: false,
          data: { pending: { layer: "sys" } },
          props: { appsysid: "sys-level1-out-1", appid: "" }
        },
        {
          id: "sys-level1-out-2-",
          title: "Level1 Out System 2",
          node_type: "sys",
          is_permission: true,
          statusType: "normal",
          showIcon: false,
          data: { pending: { layer: "sys" } },
          props: { appsysid: "sys-level1-out-2", appid: "" }
        },
        // 第一层调入节点 - 普通节点使用 normal 状态
        {
          id: "sys-level1-in-1-",
          title: "Level1 In System 1",
          node_type: "sys",
          is_permission: true,
          statusType: "normal",
          showIcon: false,
          data: { pending: { layer: "sys" } },
          props: { appsysid: "sys-level1-in-1", appid: "" }
        },
        {
          id: "sys-level1-in-2-",
          title: "Level1 In System 2",
          node_type: "sys",
          is_permission: true,
          statusType: "normal",
          showIcon: false,
          data: { pending: { layer: "sys" } },
          props: { appsysid: "sys-level1-in-2", appid: "" }
        },
        // 警告状态节点（专门用于展示 warning 状态）
        {
          id: "sys-warning-",
          title: "Warning System",
          node_type: "sys",
          is_permission: true,
          statusType: "warning",
          showIcon: false,
          data: { pending: { layer: "sys" } },
          props: { appsysid: "sys-warning", appid: "" }
        },
        // 异常状态节点（专门用于展示 abnormal 状态）
        {
          id: "sys-abnormal-",
          title: "Abnormal System",
          node_type: "sys",
          is_permission: true,
          statusType: "abnormal",
          showIcon: false,
          data: { pending: { layer: "sys" } },
          props: { appsysid: "sys-abnormal", appid: "" }
        },
        // 已删除状态节点（专门用于展示 disabled 状态，is_deleted 必须配合 deleted.svg 图标使用）
        {
          id: "sys-deleted-",
          title: "Deleted System",
          node_type: "sys",
          is_permission: true,
          statusType: "disabled",
          is_deleted: true, // 只有使用 deleted.svg 图标的节点才设置 is_deleted
          showIcon: true,
          icon: '/g6-icons/deleted.svg', // is_deleted 必须与 deleted.svg 图标匹配
          data: { pending: { layer: "sys" } },
          props: { appsysid: "sys-deleted", appid: "" }
        },
        // 外部服务节点（专门用于展示 external 状态）
        {
          id: "EXTERNAL_SERVICE-",
          title: "External Service",
          node_type: "sys",
          is_permission: true,
          statusType: "external",
          is_external: true,
          showIcon: false,
          data: { pending: { layer: "sys" } },
          props: { appsysid: "EXTERNAL_SERVICE", appid: "" }
        },
        // 已移动状态节点（专门用于展示 moved 状态）
        {
          id: "sys-moved-",
          title: "Moved System",
          node_type: "sys",
          is_permission: true,
          statusType: "moved",
          is_been_moved_to_other: true,
          showIcon: true,
          icon: '/g6-icons/moved.svg',
          data: { pending: { layer: "sys" } },
          props: { appsysid: "sys-moved", appid: "" }
        },
        // 用户状态节点（专门用于展示 user 状态）
        {
          id: "sys-user-",
          title: "User System",
          node_type: "sys",
          is_permission: true,
          statusType: "user",
          is_user: true,
          showIcon: false,
          data: { pending: { layer: "sys" } },
          props: { appsysid: "sys-user", appid: "" }
        }
      ];
      
      // 直接生成 G6 格式的边（edge_depth 将由 calculateTopologyDepth 根据目标节点的 node_depth 设置）
      // 为每条边添加完整的链路 mock 数据
      const edges = [
        // 中心节点调出到第一层
        {
          source: centerNodeId,
          target: "sys-level1-out-1-",
          type: "cubic-v-circle-run",
          data: { 
            pending: { layer: "sys" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: sysId, appid: "" },
          target_props: { appsysid: "sys-level1-out-1", appid: "" }
        },
        {
          source: centerNodeId,
          target: "sys-level1-out-2-",
          type: "cubic-v-circle-run",
          data: { 
            pending: { layer: "sys" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: sysId, appid: "" },
          target_props: { appsysid: "sys-level1-out-2", appid: "" }
        },
        {
          source: centerNodeId,
          target: "EXTERNAL_SERVICE-",
          type: "cubic-v-circle-run",
          data: { 
            pending: { layer: "sys" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: sysId, appid: "" },
          target_props: { appsysid: "EXTERNAL_SERVICE", appid: "" }
        },
        // 第一层调入到中心节点
        {
          source: "sys-level1-in-1-",
          target: centerNodeId,
          type: "cubic-v-circle-run",
          data: { 
            pending: { layer: "sys" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: "sys-level1-in-1", appid: "" },
          target_props: { appsysid: sysId, appid: "" }
        },
        {
          source: "sys-level1-in-2-",
          target: centerNodeId,
          type: "cubic-v-circle-run",
          data: { 
            pending: { layer: "sys" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: "sys-level1-in-2", appid: "" },
          target_props: { appsysid: sysId, appid: "" }
        },
        {
          source: centerNodeId,
          target: "sys-warning-",
          type: "cubic-v-circle-run",
          data: { 
            pending: { layer: "sys" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: sysId, appid: "" },
          target_props: { appsysid: "sys-warning", appid: "" }
        },
        {
          source: centerNodeId,
          target: "sys-abnormal-",
          type: "cubic-v-circle-run",
          data: { 
            pending: { layer: "sys" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: sysId, appid: "" },
          target_props: { appsysid: "sys-abnormal", appid: "" }
        },
        {
          source: centerNodeId,
          target: "sys-deleted-",
          type: "cubic-v-circle-run",
          data: { 
            pending: { layer: "sys" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: sysId, appid: "" },
          target_props: { appsysid: "sys-deleted", appid: "" }
        },
        {
          source: centerNodeId,
          target: "sys-moved-",
          type: "cubic-v-circle-run",
          data: { 
            pending: { layer: "sys" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: sysId, appid: "" },
          target_props: { appsysid: "sys-moved", appid: "" }
        },
        {
          source: "sys-user-",
          target: centerNodeId,
          type: "cubic-v-circle-run",
          data: { 
            pending: { layer: "sys" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: "sys-user", appid: "" },
          target_props: { appsysid: sysId, appid: "" }
        }
      ];
      
      // 直接生成 G6 格式的组合（depth 将由 calculateTopologyDepth 计算）
      // combo 只是一个容器，不应该有 node_type，避免被渲染为系统节点
      const combos = [
        {
          id: centerNodeId,
          title: "Demo System",
          combo: true,
          type: "custom-combo",
          is_permission: true,
          statusType: "normal",
          collapsed: false,
          show_collapsed: true, // 必须设置为 true 才能显示展开收起按钮
          padding: [80, 80, 80, 80],
          style: {
            fill: '#0099ff07',
            stroke: '#09F',
            lineWidth: 2
          },
          data: { 
            pending: { layer: "sys" },
            center_number: 0,
            app_total: 0
          },
          props: { appsysid: sysId, appid: "" }
        }
      ];
      
      return {
        nodes,
        edges,
        combos
      };
    },

    async loadAppTopology() {
      // 直接生成 G6 格式的应用拓扑数据
      const sysId = this.topologyOption.appsysid || "demo-sys";
      const appId = this.topologyOption.appid || "demo-app";
      const comboId = `${sysId}-`;
      const centerAppId = `${sysId}-${appId}`;
      
      // 直接生成 G6 格式的节点（depth 将由 calculateTopologyDepth 根据边的连接关系计算）
      // 确保所有状态都显示：normal, warning, abnormal, disabled, external, moved, user
      const nodes = [
        {
          id: centerAppId,
          title: "Demo App",
          node_type: "app",
          service_type: 10,
          is_permission: true,
          statusType: "normal",
          showIcon: true,
          shape: "circle",
          comboId: comboId,
          disabled_collapse: true, // 组内节点禁用展开收起按钮
          data: { pending: { layer: "app" } },
          props: { appsysid: sysId, appid: appId },
          center: { text: "" },
          is_client: true
        },
        // 第一层调出应用 - 普通节点使用 normal 状态
        {
          id: `${sysId}-app-level1-out-1`,
          title: "Level1 Out App 1",
          node_type: "app",
          service_type: 20,
          is_permission: true,
          statusType: "normal",
          showIcon: true,
          shape: "circle",
          comboId: comboId,
          disabled_collapse: true, // 组内节点禁用展开收起按钮
          data: { pending: { layer: "app" } },
          props: { appsysid: sysId, appid: "app-level1-out-1" },
          center: { text: "" },
          is_client: true
        },
        {
          id: `${sysId}-app-level1-out-2`,
          title: "Level1 Out App 2",
          node_type: "app",
          service_type: 10,
          is_permission: true,
          statusType: "normal",
          showIcon: true,
          shape: "circle",
          comboId: comboId,
          disabled_collapse: true, // 组内节点禁用展开收起按钮
          data: { pending: { layer: "app" } },
          props: { appsysid: sysId, appid: "app-level1-out-2" },
          center: { text: "" },
          is_client: true
        },
        // 第一层调入应用 - 普通节点使用 normal 状态
        {
          id: `${sysId}-app-level1-in-1`,
          title: "Level1 In App 1",
          node_type: "app",
          service_type: 30,
          is_permission: true,
          statusType: "normal",
          showIcon: true,
          shape: "circle",
          comboId: comboId,
          disabled_collapse: true, // 组内节点禁用展开收起按钮
          data: { pending: { layer: "app" } },
          props: { appsysid: sysId, appid: "app-level1-in-1" },
          center: { text: "" },
          is_client: true
        },
        {
          id: `${sysId}-app-level1-in-2`,
          title: "Level1 In App 2",
          node_type: "app",
          service_type: 10,
          is_permission: true,
          statusType: "normal",
          showIcon: true,
          shape: "circle",
          comboId: comboId,
          disabled_collapse: true, // 组内节点禁用展开收起按钮
          data: { pending: { layer: "app" } },
          props: { appsysid: sysId, appid: "app-level1-in-2" },
          center: { text: "" },
          is_client: true
        },
        // 警告状态应用（专门用于展示 warning 状态）
        {
          id: `${sysId}-app-warning`,
          title: "Warning App",
          node_type: "app",
          service_type: 10,
          is_permission: true,
          statusType: "warning",
          showIcon: true,
          shape: "circle",
          comboId: comboId,
          disabled_collapse: true, // 组内节点禁用展开收起按钮
          data: { pending: { layer: "app" } },
          props: { appsysid: sysId, appid: "app-warning" },
          center: { text: "" },
          is_client: true
        },
        // 异常状态应用（专门用于展示 abnormal 状态）
        {
          id: `${sysId}-app-abnormal`,
          title: "Abnormal App",
          node_type: "app",
          service_type: 10,
          is_permission: true,
          statusType: "abnormal",
          showIcon: true,
          shape: "circle",
          comboId: comboId,
          disabled_collapse: true, // 组内节点禁用展开收起按钮
          data: { pending: { layer: "app" } },
          props: { appsysid: sysId, appid: "app-abnormal" },
          center: { text: "" },
          is_client: true
        },
        // 已删除状态应用（专门用于展示 disabled 状态，is_deleted 必须配合 deleted.svg 图标使用）
        {
          id: `${sysId}-app-deleted`,
          title: "Deleted App",
          node_type: "app",
          service_type: 10,
          is_permission: true,
          statusType: "disabled",
          is_deleted: true, // 只有使用 deleted.svg 图标的节点才设置 is_deleted
          showIcon: true,
          icon: '/g6-icons/deleted.svg', // is_deleted 必须与 deleted.svg 图标匹配
          shape: "circle",
          comboId: comboId,
          disabled_collapse: true, // 组内节点禁用展开收起按钮
          data: { pending: { layer: "app" } },
          props: { appsysid: sysId, appid: "app-deleted" },
          center: { text: "" },
          is_client: true
        },
        // 已移动状态应用（专门用于展示 moved 状态）
        {
          id: `${sysId}-app-moved`,
          title: "Moved App",
          node_type: "app",
          service_type: 10,
          is_permission: true,
          statusType: "moved",
          is_been_moved_to_other: true,
          showIcon: true,
          icon: '/g6-icons/moved.svg',
          shape: "circle",
          comboId: comboId,
          disabled_collapse: true, // 组内节点禁用展开收起按钮
          data: { pending: { layer: "app" } },
          props: { appsysid: sysId, appid: "app-moved" },
          center: { text: "" },
          is_client: true
        },
        // 用户状态应用（专门用于展示 user 状态）
        {
          id: `${sysId}-app-user`,
          title: "User App",
          node_type: "app",
          service_type: 10,
          is_permission: true,
          statusType: "user",
          is_user: true,
          showIcon: true,
          shape: "circle",
          comboId: comboId,
          disabled_collapse: true, // 组内节点禁用展开收起按钮
          data: { pending: { layer: "app" } },
          props: { appsysid: sysId, appid: "app-user" },
          center: { text: "" },
          is_client: true
        }
      ];
      
      // 直接生成 G6 格式的边（edge_depth 将由 calculateTopologyDepth 根据目标节点的 node_depth 设置）
      // 为每条边添加完整的链路 mock 数据
      const edges = [
        {
          source: centerAppId,
          target: `${sysId}-app-level1-out-1`,
          type: "line-circle-run",
          data: { 
            pending: { layer: "app" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: sysId, appid: appId },
          target_props: { appsysid: sysId, appid: "app-level1-out-1" },
          comboId: comboId,
          link_type: "app"
        },
        {
          source: centerAppId,
          target: `${sysId}-app-level1-out-2`,
          type: "line-circle-run",
          data: { 
            pending: { layer: "app" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: sysId, appid: appId },
          target_props: { appsysid: sysId, appid: "app-level1-out-2" },
          comboId: comboId,
          link_type: "app"
        },
        {
          source: `${sysId}-app-level1-in-1`,
          target: centerAppId,
          type: "line-circle-run",
          data: { 
            pending: { layer: "app" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: sysId, appid: "app-level1-in-1" },
          target_props: { appsysid: sysId, appid: appId },
          comboId: comboId,
          link_type: "app"
        },
        {
          source: `${sysId}-app-level1-in-2`,
          target: centerAppId,
          type: "line-circle-run",
          data: { 
            pending: { layer: "app" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: sysId, appid: "app-level1-in-2" },
          target_props: { appsysid: sysId, appid: appId },
          comboId: comboId,
          link_type: "app"
        },
        {
          source: centerAppId,
          target: `${sysId}-app-warning`,
          type: "line-circle-run",
          data: { 
            pending: { layer: "app" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: sysId, appid: appId },
          target_props: { appsysid: sysId, appid: "app-warning" },
          comboId: comboId,
          link_type: "app"
        },
        {
          source: centerAppId,
          target: `${sysId}-app-abnormal`,
          type: "line-circle-run",
          data: { 
            pending: { layer: "app" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: sysId, appid: appId },
          target_props: { appsysid: sysId, appid: "app-abnormal" },
          comboId: comboId,
          link_type: "app"
        },
        {
          source: centerAppId,
          target: `${sysId}-app-deleted`,
          type: "line-circle-run",
          data: { 
            pending: { layer: "app" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: sysId, appid: appId },
          target_props: { appsysid: sysId, appid: "app-deleted" },
          comboId: comboId,
          link_type: "app"
        },
        {
          source: centerAppId,
          target: `${sysId}-app-moved`,
          type: "line-circle-run",
          data: { 
            pending: { layer: "app" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: sysId, appid: appId },
          target_props: { appsysid: sysId, appid: "app-moved" },
          comboId: comboId,
          link_type: "app"
        },
        {
          source: `${sysId}-app-user`,
          target: centerAppId,
          type: "line-circle-run",
          data: { 
            pending: { layer: "app" },
            ...this.getMockLinkData()
          },
          source_props: { appsysid: sysId, appid: "app-user" },
          target_props: { appsysid: sysId, appid: appId },
          comboId: comboId,
          link_type: "app"
        }
      ];
      
      this.appTopologyData = {
        nodes,
        edges,
        combos: []
      };
      
      this.app_center_id = centerAppId;
      return this.appTopologyData;
    },

    // 已删除：scaleAppTopologyOutter - Mock 数据不需要此方法


    // 已删除：formatTopologyData - Mock 数据已经是 G6 格式，不需要转换
    // 已删除：assignTopology - 数据已经在 loadTopology 中合并
    // 已删除：preLoadDataStats - Mock 数据已经包含 data.pending


    getNodeFilter(that, nodeModel) {
      const g6_graph = that.getG6Graph();
      const nodeItem = g6_graph.findById(nodeModel.id);
      let edges = nodeItem.getInEdges();
      this.changeType = false;
      let edge_data = {};

      if (edges.length > 0) {
        edges = edges.map(r => r.getModel());
        edge_data = {...edges[0].data};
        edges.forEach(edge => {
          for( let key of Object.keys(edge_data)) {
            edge_data[key] += edge.data[key] || 0;
          }
        });
      }

      return edge_data;
    },

    loadPendingNodes(data, is_layout) {
      const fetchNodeData = async (pending, node) => {
        if (node.node_self_stats !== false) {
          // Mock stats data
          const ret = this.getMockStatsData();
          node.data = Object.assign(node.data || {}, ret);
          
          // Mock out stats
          const outRet = this.getMockStatsData();
          for (let key of Object.keys(outRet)) {
            node.data["out_" + key] = outRet[key] || 0;
          }
        }

        // Mock external stats
        node.data.external_out_total = Math.floor(Math.random() * 500);
        node.data.external_in_total = Math.floor(Math.random() * 500);
      };

      const nodes = [...(data.nodes || []), ...(data.combos || [])];
      nodes.forEach(async (node) => {
        if (!node) return;

        if (node.is_external && node.data.children) {
          // Handle external service nodes
        } else {
          if (node.data.pending) {
            const pending = node.data.pending;
            node.node_self_stats = !data?.edges.find(
              (edge) => edge.target === node.id || edge.source === node.id,
            );
            await fetchNodeData(pending, node);
          }

          const g6 = this.$refs.lcG6;
          if (g6) {
            const g6_graph = g6.getGraph();
            const nodeItem = g6_graph?.find(
              node.combo ? "combo" : "node",
              (item) => item.getModel().id === node.id,
            );
            if (nodeItem) g6.mergeModel(nodeItem, node);
          }
        }
      });

      data?.edges?.forEach(async (link) => {
        if (link.children) {
          for (let edge of link.children) {
            if (edge.data.pending) {
              const isSelfCallIn = edge?.source === edge?.target;
              const ret = this.getMockStatsData("link");
              edge.data = Object.assign(edge.data || {}, ret);
            }
          }
        } else {
          if (link.data.pending) {
            const isSelfCallIn = link?.source === link?.target;
            const ret = this.getMockStatsData("link");
            link.data = Object.assign(link.data || {}, ret);
          }
        }

        const g6 = this.$refs.lcG6;
        if (g6) {
          const g6_graph = g6.getGraph();
          const edgeItem = g6_graph?.find(
            "edge",
            (item) =>
              item.getModel().target === link.target &&
              item.getModel().source === link.source,
          );
          if (edgeItem) g6.mergeModel(edgeItem, link);
        }
      });
    },


    onAfterEvent(event_type, e) {
      const event = {
        "edge:click": (e) => this.onEdgeClick(e.item.getModel()),
        "node:click": this.onNodeClick,
        "combo:click": this.onComboClick,
        "canvas:click": (e) => {
          this.restoreAllNodes();
          this.cancelInsertEdges(e);
        },
      };

      event[event_type]?.(e);
    },

    onEdgeClick(model, type) {
      const that = this;
      if (model.is_not_link) return;
      console.log('Edge clicked:', model);
    },

    async onNodeClick(e) {
      const g6 = this.$refs.lcG6;
      if (!g6) return;
      const g6_example = g6.getExample();
      const model = e.item.getModel();
      const g6_graph = this.getG6Graph();

      console.log('onNodeClick - model:', model.id, model.node_type, model.comboId);

      if (
        e.target.get("event-name") === "node-collapsed" &&
        model.statusType !== "external" &&
        model.statusType !== "user"
      ) {
        const result = g6.onG6Event(
          ["node-collapsed"],
          "isNotCollapsed",
          e,
          g6_graph,
          { g6_example: g6_example },
        );

        if (!result[0]) {
          this.onNodeClickGetDepthTopology(e);
          g6_example.caching.delCaching("outer.insertTopologyData");
          g6_example.caching.delCaching("outer.topologyData");
          return;
        } else if (!model.disabled_collapse) {
          g6_example.caching.delCaching("outer.insertTopologyData");
          g6_example.caching.delCaching("outer.topologyData");
          return;
        }
      }

      // 检查是否是取消点击（点击已选中的节点）
      if (this.selectedNodeId === model.id) {
        this.restoreAllNodes();
        return;
      }

      if (model.is_external || model.is_deleted) {
        console.log('onNodeClick - node is external or deleted, skipping');
        return;
      }
      
      // 显示组内节点和系统节点，隐藏其他节点
      this.showRelatedNodes(model.id);
      
      console.log('onNodeClick - calling onNodeClickInsertEdges');
      this.onNodeClickInsertEdges(e);
    },

    // 显示相关节点（组内节点和系统节点），隐藏其他节点
    showRelatedNodes(nodeId) {
      const g6_graph = this.getG6Graph();
      if (!g6_graph) return;

      const model = g6_graph.findById(nodeId)?.getModel();
      if (!model) return;

      // 保存当前选中的节点
      this.selectedNodeId = nodeId;
      this.hiddenNodeIds = [];

      // 找到需要显示的节点ID集合
      const visibleNodeIds = new Set();
      visibleNodeIds.add(nodeId); // 当前节点始终显示

      // 如果是应用节点，显示同组内的所有应用节点
      if (model.node_type === 'app' && model.comboId) {
        const allNodes = g6_graph.getNodes();
        allNodes.forEach(node => {
          const nodeModel = node.getModel();
          if (nodeModel.comboId === model.comboId && nodeModel.node_type === 'app') {
            visibleNodeIds.add(nodeModel.id);
          }
        });
      }

      // 显示所有系统节点
      const allNodes = g6_graph.getNodes();
      allNodes.forEach(node => {
        const nodeModel = node.getModel();
        if (nodeModel.node_type === 'sys') {
          visibleNodeIds.add(nodeModel.id);
        }
      });

      // 隐藏不在可见列表中的节点
      allNodes.forEach(node => {
        const nodeModel = node.getModel();
        if (!visibleNodeIds.has(nodeModel.id)) {
          g6_graph.hideItem(node);
          this.hiddenNodeIds.push(nodeModel.id);
        } else {
          g6_graph.showItem(node);
        }
      });

      // 隐藏相关的边（连接到隐藏节点的边）
      const allEdges = g6_graph.getEdges();
      allEdges.forEach(edge => {
        const edgeModel = edge.getModel();
        const sourceVisible = visibleNodeIds.has(edgeModel.source);
        const targetVisible = visibleNodeIds.has(edgeModel.target);
        
        if (!sourceVisible || !targetVisible) {
          g6_graph.hideItem(edge);
        } else {
          g6_graph.showItem(edge);
        }
      });
    },

    // 恢复所有节点的显示
    restoreAllNodes() {
      const g6_graph = this.getG6Graph();
      if (!g6_graph) return;

      // 显示所有节点
      const allNodes = g6_graph.getNodes();
      allNodes.forEach(node => {
        g6_graph.showItem(node);
      });

      // 显示所有边
      const allEdges = g6_graph.getEdges();
      allEdges.forEach(edge => {
        g6_graph.showItem(edge);
      });

      // 清除选中状态
      this.selectedNodeId = null;
      this.hiddenNodeIds = [];
    },

    async onNodeClickGetDepthTopology(e) {
      const g6 = this.$refs.lcG6;
      if (!g6) return;
      
      const g6_graph = this.getG6Graph();
      if (!g6_graph) return;
      
      const model = e.item.getModel();
      const eventName = e.target?.get("event-name");
      
      if (eventName !== "node-collapsed") return;
      
      // 获取所有现有的节点ID，避免重复添加
      const existingNodeIds = new Set(g6_graph.getNodes().map(n => n.getModel().id));
      
      // 获取边的类型（调出或调入）
      const edgeType = e.target.get('node-edge-type');
      const type = edgeType === 'out-edges' ? 'out' : 'in';
      
      // 计算节点深度
      const node_depth = Math.abs(model.chain_depth || model.node_depth || 0) + 1;
      
      // 根据节点类型创建下一层节点
      const newNodes = [];
      const newEdges = [];
      
      if (model.node_type === 'sys') {
        // 系统节点：创建下一层系统节点
        const mockNodeCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < mockNodeCount; i++) {
          const mockNodeId = `sys-level${node_depth}-${type}-${i}-`;
          
          if (!existingNodeIds.has(mockNodeId)) {
            const newNode = {
              id: mockNodeId,
              title: `Level${node_depth} ${type === 'out' ? 'Out' : 'In'} System ${i + 1}`,
              node_type: "sys",
              is_permission: true,
              statusType: Math.random() > 0.8 ? 'warning' : 'normal',
              showIcon: false,
              data: { 
                pending: { layer: "sys" },
                ...this.getMockStatsData()
              },
              props: { appsysid: `sys-level${node_depth}-${type}-${i}`, appid: "" },
              node_depth: type === 'out' ? node_depth : -node_depth,
              chain_depth: type === 'out' ? node_depth : -node_depth
            };
            newNodes.push(newNode);
            existingNodeIds.add(mockNodeId);
            
            // 创建关联边
            const sourceId = type === 'out' ? model.id : mockNodeId;
            const targetId = type === 'out' ? mockNodeId : model.id;
            const newEdge = {
              source: sourceId,
              target: targetId,
              type: "cubic-v-circle-run",
              data: { 
                pending: { layer: "sys" },
                ...this.getMockLinkData()
              },
              source_props: type === 'out' ? model.props : newNode.props,
              target_props: type === 'out' ? newNode.props : model.props
            };
            newEdges.push(newEdge);
          }
        }
      } else if (model.node_type === 'app') {
        // 应用节点：创建下一层应用节点（在同一组内）
        const comboId = model.comboId;
        const sysId = model.props?.appsysid || this.topologyOption.appsysid;
        const mockNodeCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < mockNodeCount; i++) {
          const mockNodeId = `${sysId}-app-level${node_depth}-${type}-${i}`;
          
          if (!existingNodeIds.has(mockNodeId)) {
            const newNode = {
              id: mockNodeId,
              title: `Level${node_depth} ${type === 'out' ? 'Out' : 'In'} App ${i + 1}`,
              node_type: "app",
              service_type: [10, 20, 30][Math.floor(Math.random() * 3)],
              is_permission: true,
              statusType: Math.random() > 0.8 ? 'warning' : 'normal',
              showIcon: true,
              shape: "circle",
              comboId: comboId,
              disabled_collapse: true, // 组内节点禁用展开收起按钮
              data: { 
                pending: { layer: "app" },
                ...this.getMockStatsData()
              },
              props: { appsysid: sysId, appid: `app-level${node_depth}-${type}-${i}` },
              center: { text: "" },
              is_client: true,
              node_depth: type === 'out' ? node_depth : -node_depth,
              chain_depth: type === 'out' ? node_depth : -node_depth
            };
            newNodes.push(newNode);
            existingNodeIds.add(mockNodeId);
            
            // 创建关联边
            const sourceId = type === 'out' ? model.id : mockNodeId;
            const targetId = type === 'out' ? mockNodeId : model.id;
            const newEdge = {
              source: sourceId,
              target: targetId,
              type: "line-circle-run",
              data: { 
                pending: { layer: "app" },
                ...this.getMockLinkData()
              },
              source_props: type === 'out' ? model.props : newNode.props,
              target_props: type === 'out' ? newNode.props : model.props,
              comboId: comboId,
              link_type: "app"
            };
            newEdges.push(newEdge);
          }
        }
      }
      
      // 如果没有新节点，直接返回
      if (newNodes.length === 0) {
        return;
      }
      
      // 使用 addData 添加新节点和边
      const newData = {
        nodes: newNodes,
        edges: newEdges,
        combos: []
      };
      
      // 重新计算拓扑深度
      this.calculateTopologyDepth(
        [...this.data.nodes, ...newNodes],
        [...this.data.edges, ...newEdges],
        this.data.nodes.find(n => n.id === `${this.topologyOption.appsysid}-`)?.id || model.id
      );
      
      // 更新数据
      this.data.nodes.push(...newNodes);
      this.data.edges.push(...newEdges);
      
      // 使用 addData 添加到 G6 图
      g6.addData({ e, node_edge_type: edgeType, model }, newData);
      
      // 加载待处理节点数据
      this.$nextTick(() => {
        this.loadPendingNodes(newData, false);
        g6.activeNodes();
      });
    },

    async onNodeClickInsertEdges(e) {
      const combo = this.data.combos[0];
      // 移除 combo.collapsed 的检查，允许在折叠状态下也能创建边
      // if (combo && combo.collapsed) return;
      
      this.cancelInsertEdges(e);

      const item = e.item;
      const model = e.item.getModel();
      const g6 = this.$refs.lcG6;
      const g6_example = g6.getExample();
      const g6_graph = this.getG6Graph();

      console.log('onNodeClickInsertEdges - model:', model.id, model);

      g6.onG6Event(["node-collapsed"], "leave", e, g6_graph, {
        g6_example: g6_example,
      });
      model.disabled_collapse = true;
      g6.onG6ComponentEvent("disabled", e, { disabled: true });

      const caching_current_model = "outer.event.node-click.current";
      const caching_model_id = model.id;
      const caching_insert_id = "outer.insertTopologyData." + caching_model_id;
      const caching_id = "outer.topologyData." + caching_model_id;
      g6_example.caching.setCaching(caching_current_model, model);

      const is_not_insert_caching = !g6_example.caching.hasCaching(caching_insert_id);
      if (is_not_insert_caching) {
        // 直接使用 model.id 来获取拓扑数据，而不是构建节点ID
        let data = await this.getAppTopologyData(
          model.props?.appsysid || "",
          model.props?.appid || "",
          model.id
        );
        // 数据已经是 G6 格式，不需要转换
        // 直接使用新创建的边，不经过 filterSelfNodeData 过滤
        // 因为 filterSelfNodeData 会过滤掉新创建的边（它们不在现有的 g6_edges 中）
        const edges = data.edges || [];
        
        console.log('onNodeClickInsertEdges - getAppTopologyData returned edges:', edges.length, edges);
        
        data.edges = edges;

        const insertEdgeMap = {};
        const insertEdgeSet = {};
        const removeEdgeMap = {};

        for (let edge of data.edges) { 
          insertEdgeMap[edge.target] = edge; 
          insertEdgeMap[edge.source] = edge; 
          insertEdgeSet[edge.target + "--edge--" + edge.source] = edge; 
        }

        let g6_graph_edges = g6_graph.getEdges();
        for (const edge of g6_graph_edges) {
          const edgeModel = edge.getModel();
          removeEdgeMap[edgeModel.id] = edgeModel;
        }

        const insertEdges = Object.values(insertEdgeSet);
        const insertNodeIds = Object.keys(insertEdgeMap);
        g6_example.caching.setCaching(caching_insert_id, {
          nodeIds: insertNodeIds,
          edges: insertEdges,
        });

        if (!g6_example.caching.hasCaching(caching_id)) {
          g6_example.caching.setCaching(caching_id, {
            edges: Object.values(removeEdgeMap),
          });
        }
      }

      const cachedData = g6_example.caching.getCaching(caching_id);
      if (cachedData && cachedData.edges) {
        const { edges: removeEdges } = cachedData;
        for (let edgeModel of removeEdges) {
          const edgeItem = g6_graph.findById(edgeModel.id);
          if (edgeItem) {
            g6_graph.removeItem(edgeItem);
          }
        }
      }

      const cachedInsertData = g6_example.caching.getCaching(caching_insert_id);
      if (!cachedInsertData) {
        console.warn('onNodeClickInsertEdges - no cached insert data for:', caching_insert_id);
        this.insertEdgesLoading = false;
        return;
      }
      
      const { edges: insertEdges, nodeIds: insertNodeIds } = cachedInsertData;
      console.log('onNodeClickInsertEdges - insertEdges:', insertEdges?.length || 0, insertEdges);
      
      if (insertEdges && insertEdges.length > 0) {
        for (let edgeModel of insertEdges) {
          // 检查边是否已存在
          const existingEdge = g6_graph.getEdges().find(edge => {
            const model = edge.getModel();
            return model.source === edgeModel.source && model.target === edgeModel.target;
          });
          
          if (!existingEdge) {
            // 为边生成唯一ID
            if (!edgeModel.id) {
              edgeModel.id = `edge-${edgeModel.source}-${edgeModel.target}-${Date.now()}-${Math.random()}`;
            }
            console.log('onNodeClickInsertEdges - adding edge:', edgeModel.id, edgeModel.source, '->', edgeModel.target);
            try {
              g6_graph.addItem("edge", edgeModel);
            } catch (error) {
              console.error('onNodeClickInsertEdges - error adding edge:', error, edgeModel);
            }
          } else {
            console.log('onNodeClickInsertEdges - edge already exists:', edgeModel.source, '->', edgeModel.target);
          }
        }
      } else {
        console.warn('onNodeClickInsertEdges - no edges to insert');
      }

      const nodes = g6_graph.getNodes();
      for( const node of nodes) {
        const data = node.getModel()?.data;
        if (data) delete data.business;
      }

      g6.layoutEdges();
      g6.layoutQuadraticEdges();

      g6.onG6Event(["edge-running"], "setState", e, g6_graph, {
        edges: insertEdges,
      });

      g6.onG6Event(["disabled"], "setState", e, g6_graph, {
        not_nodes: [model.id, ...insertNodeIds],
        not_edges: insertEdges,
        g6_example
      });
      g6_example.calcTopologyData();

      if (is_not_insert_caching) {
        this.$nextTick(() => {
          this.loadPendingNodes({ edges: insertEdges, nodes: [] });
        });
      }

      this.is_insert_edges_view = true;
    },

    onComboClick(evt) {
      this.cancelInsertEdges(evt);
      
      const eventName = evt?.target?.get("event-name");
      const g6 = this.$refs.lcG6;
      const g6_example = g6.getExample();

      if (eventName === 'combo-collapsed') {
        this.collapsed = !this.collapsed;
        g6.onG6Event(["combo-collapsed"], "click", evt, g6_example.g6_graph, {
            g6_example: g6_example,
        });
      }
    },

    async cancelInsertEdges(e) {
      const combo = this.data.combos[0];
      if (combo && combo.collapsed) return;      

      const g6 = this.$refs.lcG6;
      if (!g6) return;
      const g6_example = g6.getExample();
      const g6_graph = this.getG6Graph();

      g6.onG6ComponentEvent("disabled", e, { disabled: false });

      const caching_current_model = "outer.event.node-click.current";
      if (!g6_example.caching.hasCaching(caching_current_model)) return;

      const model = g6_example.caching.getCaching(caching_current_model);
      g6_example.caching.delCaching(caching_current_model);

      const caching_model_id = model.id;
      const caching_insert_id = "outer.insertTopologyData." + caching_model_id;
      const caching_id = "outer.topologyData." + caching_model_id;

      if (g6_example.caching.hasCaching(caching_insert_id)) {
        const data = g6_example.caching.getCaching(caching_insert_id);
        for (let edgeModel of data.edges) {
          g6_graph.removeItem(edgeModel.id);
        }
      }

      if (g6_example.caching.hasCaching(caching_id)) {
        const data = g6_example.caching.getCaching(caching_id);
        for (let edgeModel of data.edges) {
          g6_graph.addItem("edge", edgeModel);
        }
      }
      g6_example.calcTopologyData();

      const nodes = g6_graph.getNodes();
      for( const node of nodes) {
        delete node.getModel().business;
      }

      this.is_insert_edges_view = false;
    },

    async getModels(node) {
      if (this.old_period !== node.data.old_period) {
        delete node.data.business;
        node.data.old_period = this.old_period;
      }

      if (node.data.business) return node.data.business;
      if (!node.data.business) node.data.business = [];

      // Mock models data
      node.data.business = [
        { name: "业务模型1", id: "model1", total: 100 },
        { name: "业务模型2", id: "model2", total: 200 }
      ];

      return node.data.business;
    },
    
    getMockStatsData(type = "node") {
      return {
        total: Math.floor(Math.random() * 1000) + 100,
        dur: Math.floor(Math.random() * 100000) + 10000,
        slow: Math.floor(Math.random() * 50),
        frustrated: Math.floor(Math.random() * 20),
        err: Math.floor(Math.random() * 10),
        fail: Math.floor(Math.random() * 5),
        exception: Math.floor(Math.random() * 8),
        out_total: Math.floor(Math.random() * 800) + 80,
        out_dur: Math.floor(Math.random() * 80000) + 8000,
        out_slow: Math.floor(Math.random() * 40),
        out_frustrated: Math.floor(Math.random() * 15),
        out_err: Math.floor(Math.random() * 8),
        out_fail: Math.floor(Math.random() * 4),
        out_exception: Math.floor(Math.random() * 6)
      };
    },

    // 生成链路 mock 数据
    getMockLinkData() {
      const baseTotal = Math.floor(Math.random() * 5000) + 500;
      const avgDur = Math.floor(Math.random() * 200) + 10;
      const totalDur = baseTotal * avgDur;
      
      return {
        total: baseTotal,
        dur: totalDur,
        slow: Math.floor(baseTotal * 0.05) + Math.floor(Math.random() * 10),
        frustrated: Math.floor(baseTotal * 0.02) + Math.floor(Math.random() * 5),
        err: Math.floor(baseTotal * 0.01) + Math.floor(Math.random() * 5),
        fail: Math.floor(baseTotal * 0.005) + Math.floor(Math.random() * 3),
        exception: Math.floor(baseTotal * 0.003) + Math.floor(Math.random() * 3)
      };
    },

    async getAppTopologyData(appsysid, appid, nodeId) {
      clearTimeout(this.insertEdgesTimer);
      this.insertEdgesLoading = true;

      const g6 = this.$refs.lcG6;
      if (!g6) {
        this.insertEdgesLoading = false;
        return { nodes: [], edges: [], combos: [] };
      }
      
      const g6_graph = g6.getGraph();
      const currentNodeId = nodeId || (appid ? `${appsysid}-${appid}` : `${appsysid}-`);
      const currentNode = g6_graph?.findById(currentNodeId)?.getModel();
      
      if (!currentNode) {
        this.insertEdgesLoading = false;
        return { nodes: [], edges: [], combos: [] };
      }

      // 直接返回写死的 mock 边数据（演示用）
      const sysId = this.topologyOption.appsysid || "demo-sys";
      const comboId = `${sysId}-`;
      const centerAppId = `${sysId}-${appid || "demo-app"}`;
      
      // 根据节点类型返回不同的 mock 边
      const mockEdges = [];
      
      if (currentNode.node_type === 'app') {
        // 应用节点：连接到其他应用节点、系统节点、外部系统
        mockEdges.push(
          // 连接到其他应用节点
          {
            source: currentNodeId,
            target: `${sysId}-app-level1-out-1`,
            type: "line-circle-run",
            data: { pending: { layer: "app" }, ...this.getMockLinkData() },
            source_props: currentNode.props || {},
            target_props: { appsysid: sysId, appid: "app-level1-out-1" },
            comboId: comboId,
            link_type: "app"
          },
          {
            source: currentNodeId,
            target: `${sysId}-app-level1-out-2`,
            type: "line-circle-run",
            data: { pending: { layer: "app" }, ...this.getMockLinkData() },
            source_props: currentNode.props || {},
            target_props: { appsysid: sysId, appid: "app-level1-out-2" },
            comboId: comboId,
            link_type: "app"
          },
          // 连接到系统节点
          {
            source: currentNodeId,
            target: `${sysId}-`,
            type: "cubic-v-circle-run",
            data: { pending: { layer: "sys" }, ...this.getMockLinkData() },
            source_props: currentNode.props || {},
            target_props: { appsysid: sysId, appid: "" }
          },
          // 连接到外部系统
          {
            source: currentNodeId,
            target: "EXTERNAL_SERVICE-",
            type: "cubic-v-circle-run",
            data: { pending: { layer: "sys" }, ...this.getMockLinkData() },
            source_props: currentNode.props || {},
            target_props: { appsysid: "EXTERNAL_SERVICE", appid: "" },
            is_external: true
          }
        );
      } else if (currentNode.node_type === 'sys') {
        // 系统节点：连接到其他系统节点、应用节点、外部系统
        mockEdges.push(
          // 连接到其他系统节点
          {
            source: currentNodeId,
            target: "sys-level1-out-1-",
            type: "cubic-v-circle-run",
            data: { pending: { layer: "sys" }, ...this.getMockLinkData() },
            source_props: currentNode.props || {},
            target_props: { appsysid: "sys-level1-out-1", appid: "" }
          },
          {
            source: currentNodeId,
            target: "sys-level1-in-1-",
            type: "cubic-v-circle-run",
            data: { pending: { layer: "sys" }, ...this.getMockLinkData() },
            source_props: currentNode.props || {},
            target_props: { appsysid: "sys-level1-in-1", appid: "" }
          },
          // 连接到应用节点
          {
            source: currentNodeId,
            target: centerAppId,
            type: "cubic-v-circle-run",
            data: { pending: { layer: "sys" }, ...this.getMockLinkData() },
            source_props: currentNode.props || {},
            target_props: { appsysid: sysId, appid: appid || "demo-app" },
            comboId: comboId,
            link_type: "app"
          },
          // 连接到外部系统
          {
            source: currentNodeId,
            target: "EXTERNAL_SERVICE-",
            type: "cubic-v-circle-run",
            data: { pending: { layer: "sys" }, ...this.getMockLinkData() },
            source_props: currentNode.props || {},
            target_props: { appsysid: "EXTERNAL_SERVICE", appid: "" },
            is_external: true
          }
        );
      }

      this.insertEdgesTimer = setTimeout(() => {
        this.insertEdgesLoading = false;
      }, 500);

      return {
        nodes: [],
        edges: mockEdges,
        combos: []
      };
    },

    onTooltipItemClick(model, item) {
      this.$refs.applicationTopology.open(
        {
          ...model,
          source: model.source_props?.appsysid,
          target: model.target_props?.appsysid,
          data_key: "from",
        },
        {
          appid: item?.appid || item.props?.appid,
          service_type: item.service_type,
          combo: true,
          is_external: true,
        },
      );
      this.applicationShow = true;
      console.log('Tooltip item clicked:', model, item);
    },

    onCloseApplicationTopology() {
      this.applicationShow = false;
      if (!this.data.nodes.length) {
        this.getTopology();
      }
    },

    onBack() {
      const g6 = this.$refs.lcG6;
      g6.clearEvents();
      console.log('Back clicked');
    },
  },
};
</script>

<style lang="scss" scoped>
.system-overview-topo-view {
  height: 100%;
  box-sizing: border-box;

  .system-overview-topo-content {
    height: 100%;
  }

  .app-business_no-data {
    position: relative;
    min-height: 110px;
    .no-data {
      margin-top: -10px;
      .lc-loading-icon {
        margin-top: 30px;
      }
    }
  }

  .system-topology-view-header {
    position: absolute;
    left: 20px;
    top: 20px;

    .el-button {
      height: 24px !important;
      min-height: 24px;
      box-sizing: border-box;
      padding: 0px 14px;
      display: flex;
      align-items: center;
      &:hover {
        background: #fff !important;
        color: #09f;
        border: 1.2px solid #09f;
      }
      .lc-apptrace-back {
        font-size: 16px;
        display: inline-block;
        transform: translateY(1px);
      }

      span {
        display: inline-block;
        transform: translateY(-1px);
      }
    }
  }

  .insert-edges-loading-mark {
    position: absolute;
    left: 0;
    top: 0;
    background-color: rgba(0, 0, 0, 0.15);
    width: 100%;
    height: 100%;
  }

  .insert-edges-loading {
    .text {
      color: rgba(0, 0, 0, 0.6) !important;
    }
  }

  .no-data {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 10;
  }
}
</style>

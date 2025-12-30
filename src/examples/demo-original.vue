<template>
  <div class="demo-topo-view">
    <div class="demo-topo-content" v-if="showView">
      <LcG6
        :options="g6Options"
        ref="lcG6"
        :data="data"
      />
    </div>
    <div v-else class="loading">
      <lc-loading-icon />
      <div class="text">加载中...</div>
    </div>
  </div>
</template>

<script>
import LcG6 from "../index.vue";
import LcLoadingIcon from "../lc-loading-icon.vue";

export default {
  name: "DemoOriginal",
  components: { LcG6, LcLoadingIcon },

  data() {
    return {
      showView: false,
      centerId: "sys-gateway",
      data: { nodes: [], edges: [] },
    };
  },

  computed: {
    g6Options() {
      return {
        legend: true,
        minimap: true,
        customBehaviors: ["expand-link-event"],
        layout: { type: "dagre-tbt" },
        activeNodes: [this.centerId],
        centerNodes: [this.centerId],
        tooltip: {
          show: true,
          width: "300px",
          data: (model, tooltipType) => this.getTooltipData(model, tooltipType),
        },
        defaultEdge: {
          type: "cubic-v-circle-run",
          style: { cursor: "pointer" },
        },
        defaultNode: {
          type: "node-icon",
          shape: "hexagonal-polygon",
          center: { text: "应用" },
        },
        getExpandData: this.getExpandData,
        getInsertEdges: this.getInsertEdges,
      };
    },
  },

  mounted() {
    this.loadData();
  },

  methods: {
    // ========== Tooltip 配置 ==========
    getTooltipData(model, tooltipType) {
      if (tooltipType === "node") {
        return {
          node: [
            { label: model.title || model.id, type: "metric-header", metrics: [] },
            {
              label: "节点信息",
              bgColor: "#FFFFFF0D",
              width: "100%",
              metrics: [
                { label: "状态", value: model.statusType },
                { label: "类型", value: model.node_type },
                { label: "请求数", value: model.data?.total },
              ],
            },
          ],
        };
      } else if (tooltipType === "edge") {
        return {
          width: "250px",
          edge: [
            {
              label: "边信息",
              metrics: [
                { label: "源节点", value: model.source },
                { label: "目标节点", value: model.target },
                { label: "请求数", value: model.data?.total },
              ],
            },
          ],
        };
      }
    },

    // ========== 数据加载 ==========
    loadData() {
      this.data = this.getMockData();
      this.showView = true;
    },

    getMockData() {
      const nodes = [
        { id: "sys-web", title: "Web前端系统", type: "node-icon", node_type: "sys", statusType: "normal", showIcon: true, data: { total: 1250 }, props: { appsysid: "sys-web" } },
        { id: "sys-gateway", title: "API网关系统", type: "node-icon", node_type: "sys", statusType: "normal", showIcon: true, data: { total: 25500 }, props: { appsysid: "sys-gateway" } },
        { id: "sys-user", title: "用户服务系统", type: "node-icon", node_type: "sys", statusType: "normal", showIcon: true, data: { total: 17700 }, props: { appsysid: "sys-user" } },
        { id: "sys-order", title: "订单服务系统", type: "node-icon", node_type: "sys", statusType: "warning", showIcon: true, data: { total: 13700 }, props: { appsysid: "sys-order" } },
        { id: "sys-payment", title: "支付服务系统", type: "node-icon", node_type: "sys", statusType: "normal", showIcon: true, data: { total: 3200 }, props: { appsysid: "sys-payment" } },
        { id: "sys-product", title: "商品服务系统", type: "node-icon", node_type: "sys", statusType: "normal", showIcon: true, data: { total: 11200 }, props: { appsysid: "sys-product" } },
        { id: "sys-cache", title: "缓存系统", type: "node-icon", node_type: "sys", statusType: "normal", showIcon: true, data: { total: 73000 }, props: { appsysid: "sys-cache" } },
        { id: "sys-db", title: "数据库系统", type: "node-icon", node_type: "sys", statusType: "normal", showIcon: true, data: { total: 41000 }, props: { appsysid: "sys-db" } },
      ];

      const edges = [
        { source: "sys-web", target: "sys-gateway", type: "cubic-v-circle-run", data: { total: 2630 } },
        { source: "sys-gateway", target: "sys-user", type: "cubic-v-circle-run", data: { total: 8500 } },
        { source: "sys-gateway", target: "sys-order", type: "cubic-v-circle-run", data: { total: 7200 } },
        { source: "sys-gateway", target: "sys-payment", type: "cubic-v-circle-run", data: { total: 1600 } },
        { source: "sys-gateway", target: "sys-product", type: "cubic-v-circle-run", data: { total: 5600 } },
        { source: "sys-user", target: "sys-order", type: "cubic-v-circle-run", data: { total: 4400 } },
        { source: "sys-order", target: "sys-payment", type: "cubic-v-circle-run", data: { total: 3200 } },
        { source: "sys-order", target: "sys-product", type: "cubic-v-circle-run", data: { total: 2800 } },
        { source: "sys-user", target: "sys-cache", type: "cubic-v-circle-run", data: { total: 31000 } },
        { source: "sys-order", target: "sys-cache", type: "cubic-v-circle-run", data: { total: 17000 } },
        { source: "sys-product", target: "sys-cache", type: "cubic-v-circle-run", data: { total: 14000 } },
        { source: "sys-user", target: "sys-db", type: "cubic-v-circle-run", data: { total: 9000 } },
        { source: "sys-order", target: "sys-db", type: "cubic-v-circle-run", data: { total: 7200 } },
        { source: "sys-product", target: "sys-db", type: "cubic-v-circle-run", data: { total: 5600 } },
        { source: "sys-payment", target: "sys-db", type: "cubic-v-circle-run", data: { total: 3200 } },
      ];

      return { nodes, edges };
    },

    // ========== 数据获取回调（提供给 behavior） ==========
    
    getExpandData(model, edgeType, depth) {
      const isOut = edgeType === "out-edges";
      const type = isOut ? "out" : "in";
      const count = Math.floor(Math.random() * 2) + 1;
      const newNodes = [];
      const newEdges = [];

      for (let i = 0; i < count; i++) {
        const newId = `${model.id}-${type}-${depth}-${i}`;
        const newNode = {
          id: newId,
          title: `L${depth} ${isOut ? "调出" : "调入"}系统 ${i + 1}`,
          type: "node-icon",
          node_type: "sys",
          statusType: Math.random() > 0.8 ? "warning" : "normal",
          showIcon: true,
          data: { total: Math.floor(Math.random() * 10000) + 1000 },
          props: { appsysid: newId },
          node_depth: isOut ? depth : -depth,
          chain_depth: isOut ? depth : -depth,
        };
        newNodes.push(newNode);

        newEdges.push({
          source: isOut ? model.id : newId,
          target: isOut ? newId : model.id,
          type: "cubic-v-circle-run",
          edge_depth: newNode.node_depth,
          data: { total: Math.floor(Math.random() * 5000) + 500 },
        });
      }

      // 添加到本地数据
      if (newNodes.length > 0) {
        this.data.nodes.push(...newNodes);
        this.data.edges.push(...newEdges);
      }

      return { nodes: newNodes, edges: newEdges, combos: [] };
    },

    getInsertEdges(model) {
      // 这个 demo 不需要插入边功能
      return null;
    },
  },
};
</script>

<style scoped>
.demo-topo-view {
  width: 100%;
  height: 100%;
  position: relative;
}
.demo-topo-content {
  width: 100%;
  height: 100%;
}
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.loading .text {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}
</style>

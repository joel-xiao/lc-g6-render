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
import { getMockSysTopoData, getMockAppTopoData, getMockExpandData, getMockInsertEdges } from "./utils/mock-data.js";

export default {
  name: "DemoTopoView",
  components: { LcG6, LcLoadingIcon },

  data() {
    return {
      showView: false,
      sysId: "demo-sys",
      appId: "demo-app",
      app_center_id: "",
      data: { nodes: [], edges: [], combos: [] },
    };
  },

  computed: {
    centerId() {
      return `${this.sysId}-`;
    },

    g6Options() {
      return {
        legend: true,
        minimap: true,
        // 使用 expand-link-event behavior 处理所有交互
        customBehaviors: ["expand-link-event"],
        layout: { type: "dagre-tgb" },
        activeNodes: [this.centerId, this.app_center_id],
        centerNodes: [this.centerId, this.app_center_id],
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
        defaultCombo: {
          type: "custom-combo",
          center: { show: true, text: "应用" },
          header: {
            label: "",
            show: true,
            rights: [{ label: "应用数", key: "curr_app_total", fill: "#00B42A" }],
          },
        },
        // 提供数据获取回调给 behavior
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
      if (tooltipType === "node" || tooltipType === "combo") {
        if (model.statusType === "user") return;
        return {
          [tooltipType]: [
            { label: model.title || "--", type: "metric-header", metrics: [] },
            {
              label: "节点信息",
              bgColor: "#FFFFFF0D",
              width: "100%",
              metrics: [
                { label: "状态", value: model.statusType },
                { label: "类型", value: model.node_type },
                { label: "ID", value: model.id },
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
              ],
            },
          ],
        };
      }
    },

    // ========== 数据加载 ==========
    loadData() {
      const sysTopo = getMockSysTopoData(this.sysId);
      const appTopo = getMockAppTopoData(this.sysId, this.appId);

      this.app_center_id = appTopo.centerAppId;
      this.data = {
        nodes: [...sysTopo.nodes, ...appTopo.nodes],
        edges: [...sysTopo.edges, ...appTopo.edges],
        combos: [...sysTopo.combos],
      };

      // 更新 combo 应用数
      if (this.data.combos.length > 0) {
        const combo = this.data.combos[0];
        const appCount = this.data.nodes.filter((n) => n.comboId === combo.id).length;
        combo.data.curr_app_total = appCount;
        combo.data.app_total = appCount;
      }

      this.showView = true;
    },

    // ========== 数据获取回调（提供给 behavior） ==========
    
    // 展开节点时获取数据
    getExpandData(model, edgeType, depth) {
      const newData = getMockExpandData(model, edgeType, depth);
      
      // 添加到本地数据
      if (newData.nodes.length > 0) {
        this.data.nodes.push(...newData.nodes);
        this.data.edges.push(...newData.edges);
      }
      
      return newData;
    },

    // 点击节点时获取插入边数据
    getInsertEdges(model) {
      return getMockInsertEdges(model, this.sysId, this.appId);
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

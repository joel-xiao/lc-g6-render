<template>
  <div class="lc-g6-container" :id="elId" />
  <!-- <LcButtons @select="onSelectLayout" /> -->

  <LcTextTooltip ref="textTooltipRef"/>
  <LcTooltip ref="tooltipRef" :options="options?.tooltip" @hide="onTooltipHide" :elId="elId">
    <template v-slot:tooltip="slotProps">
      <slot name="tooltip" :model="slotProps.model"></slot>
    </template>
  </LcTooltip>
  <LcLegend ref="legendRef" v-if="options?.legend" @item-check="onCheckLegend"/>
  <LcZoom size="mini" class="lc-g6-zoom" ref="zoomRef" :max="zoom.max" :min="zoom.min" @zoom="onZoom" />
  <LcG6Loading ref="loadingRef"/>
  
  <div v-if="!render" class="no-data">
    <LcLoadingIcon/>
    <div style="font-size: 12px; color: #666; margin-top: 5px">
      节点布局计算中
    </div>
  </div>
  <div v-else-if="render && !data?.nodes?.length && !data?.combos?.length" class="no-data">
    <i class="lc-ico-empty"></i>
    <div style="letter-spacing: 2px; margin-top: 5px; font-size: 12px">
      暂无数据
    </div>
  </div>
</template>

<script setup>
import LcLoadingIcon from "./lc-loading-icon.vue";
import LcButtons from './lc-g6-buttons.vue'
import LcTooltip from './lc-g6-tooltip.vue'
import LcTextTooltip from './lc-g6-text-tooltip.vue'
import LcLegend from './lc-g6-legend.vue'
import LcG6Loading from './lc-g6-loading.vue'
import LcZoom from "./lc-zoom.vue";
import { onMounted, ref, reactive ,watch, onBeforeUnmount, nextTick  } from 'vue'
import { G6Graph } from './compossible/g6'
import { getUuid } from './compossible/utils/common.js'
import { noLogicStatusType } from './compossible/utils/health.js'
import { toG6Data } from './compossible/data/format.js'
import { onEvent as onG6Event, isEvent as isG6Event } from './compossible/behaviors/events/index.js'
import { onComponentEvent } from './compossible/behaviors/components/index.js'

const emits = defineEmits(['event', 'zoom']);
const props = defineProps({
  data: {
    type: [Object, undefined],
    default: undefined
  },

  options: {
    type: [Object, undefined],
    default: () => ({})
  }
});

const textTooltipRef = ref();
const tooltipRef = ref();
const loadingRef = ref();
const render = ref();
const elId = ref('lc-g6-container-' + getUuid());

function getOptions() {
  return {
    option: {
      'container': elId.value,
      defaultNode: props.options.defaultNode,
      defaultEdge: props.options.defaultEdge,
      defaultCombo: props.options.defaultCombo,
      layout: props.options.layout,
      fitView: props.options.fitView,
    },
    vmOption: {
      ...props.options,
      setZoom,
      onEvent,
    }
  };
}
let g6_graph = new G6Graph(getOptions());

  g6_graph.updateOptions(getOptions());
  g6_graph.render();
})

watch(() => props.data, (newData) => {
  if (newData) {
    setData(newData);
  }
}, { deep: true })

function onSelectLayout(layout) {
  g6_graph.updateLayout(layout.value);
}

onMounted(() => {
  setTimeout(() => {
    if (props.data) {
      setData(props.data);
    }
  })
});

onBeforeUnmount(() => {
  g6_graph.destroy();
});

function setData(data) {
  g6_graph.setData(data);
}

function getGraph() {
  return g6_graph.getGraph();
}

function addData(option, data, ...args) {
  option = option || {};
  if (option.e) {
    onComponentEvent(['custom-loading'], 'hide', option.e, g6_graph.getGraph(), loadingRef.value, 
    { text: !data?.nodes?.length ? '暂无数据': ''},
    () => {
      g6_graph.addData(option, data, ...args);
    });
  } else {
      g6_graph.addData(option, data, ...args);
  }
}

function addItem(...args) {
  g6_graph.addData(...args);
}

const zoom = reactive({
  max: 1.8,
  min: 0.3
});
const zoomRef = ref();

onMounted(() => {
  g6_graph.setOptionZoom(zoom);
});

function onZoom(zoom) {
  g6_graph.setZoom(zoom);
  emits('zoom', zoom)
}

function setZoom(zoom) {
  zoomRef.value.setZoom(zoom);
  emits('zoom', zoom)
}

function refresh(id) {
  tooltipRef.value && tooltipRef.value.refresh(id);
}

function onG6ComponentEvent(event_type, e, options) {
  onComponentEvent(['custom-text-tooltip'], event_type, e, g6_graph.getGraph(), textTooltipRef.value, {...options, g6_example: g6_graph});
  onComponentEvent(['custom-tooltip'], event_type, e, g6_graph.getGraph(), tooltipRef.value, {...options, g6_example: g6_graph});
  onComponentEvent(['custom-loading'], event_type, e, g6_graph.getGraph(), loadingRef.value, {...options, g6_example: g6_graph});
  onComponentEvent(['custom-legend'], event_type, e, g6_graph.getGraph(), legendRef.value, {...options, g6_example: g6_graph});
}

defineExpose({
  setData, 
  addData,
  mergeModel: g6_graph.mergeModel.bind(g6_graph),
  updateItemState: g6_graph.updateItemState.bind(g6_graph),
  layoutQuadraticEdges: g6_graph.layoutQuadraticEdges.bind(g6_graph),
  layoutEdges: g6_graph.layoutEdges.bind(g6_graph),
  getGraph: getGraph, 
  addComboChild: g6_graph.addComboChild,
  addItem,
  removeItem: g6_graph.removeItem,
  updateItem: g6_graph.updateItem,
  changeData: g6_graph.updateItem,
  toG6Data,
  refresh,
  onG6Event,
  onG6ComponentEvent,
  getExample: () => g6_graph,
  stopAnimate: g6_graph.stopAnimate.bind(g6_graph),
  clearEvents: g6_graph.clearEvents.bind(g6_graph),
  activeNodes: g6_graph.activeNode.bind(g6_graph),
  noLogicStatusType: noLogicStatusType
});

function onEvent(event_type, e, ...args) {
  if (event_type === 'afterrender') {
    render.value = true;
  }

  onG6ComponentEvent(event_type, e);

  if (e && isG6Event(e)) return;
  emits('event', event_type, e, ...args);
}

function onTooltipHide() {
  return onG6Event(['edge-focus'], 'clear', null, g6_graph.getGraph());
}

const legendRef = ref();
function onCheckLegend(item) {
  onComponentEvent(['custom-legend'], 'check', null, g6_graph.getGraph(), legendRef.value, {g6_example: g6_graph});
}


</script>

<style lang="scss">
@import "./scss/plugins.scss";
.lc-g6-container {
  position: relative;
  height: 100%;
  
  .g6-minimap {
    position: absolute !important;
    left: 20px;
    bottom: 24px;
    border-radius: 3px;
    overflow: hidden;
    box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.10), 0px 1px 5px 0px rgba(0, 0, 0, 0.05);
    border: 1px solid #E8E8E8;
    
    .g6-minimap-viewport {
      overflow: hidden;
      outline: 1px solid #979797 !important;
      background: rgba(218, 218, 218, 0.50);
      border: none !important;
    }
  }

  .g6-legend-container {
    border-radius: 3px;
    overflow: hidden;
    box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.10), 0px 1px 5px 0px rgba(0, 0, 0, 0.05);
  }

  .g6-component-tooltip {
    border-radius: 6px;
    background: none;
    box-shadow: none;
    padding: 0px;
    font-size: 12px;
    border: none;
  }
}

.lc-g6-zoom {
  position: absolute;
  right: 20px;
  bottom: 0px;
}
</style>

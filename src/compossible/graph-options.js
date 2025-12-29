import { cloneDeep } from 'lodash';
import G6 from "@antv/g6";
import { getAnchorPoints } from './register-shape-methods'
import { getMinimap } from './plugins'

const width = 500, height = 500;
export const graph_default_option = {
  container: undefined,
  width,
  height,
  fitCenter: true,
  fitView: false,
  fitViewPadding: [20, 40, 50, 20],
  animate: false,
  renderer: 'canvas',

  // 必须将 groupByTypes 设置为 false，带有 combo 的图中元素的视觉层级才能合理
  //  groupByTypes: false,

  modes: {
    default: getModels(),  // 'activate-relations'
  },

  layout: getLayout(),
  defaultNode: getDefaultNode(),
  defaultEdge: getDefaultEdge(),
  defaultCombo: getDefaultCombo(),
};

export function getModels() {
  return [
    'drag-canvas',
    // 'drag-combo',
    'zoom-canvas',
    // {
    //   type: 'drag-node',
    //   // enableDelegate: true,
    //   shouldBegin: (e, self) => {
    //     const model = e?.item?.getModel();
    //     // 不允许拖拽有comboId的节点
    //     if (model?.comboId || model.disabled_event) return false;
    //     return true;
    //   },
    // }
  ];
}

export function getLayout(layout, options) {
  const data = {
    'dagre': {
      type: 'comboCombined',
      outerLayout: new G6.Layout['dagre']({
        rankdir: 'TB',
        nodesep: 70,
        ranksep: 80,
        sortByCombo: true,
        ...options?.outerLayout,
      }),

      innerLayout: new G6.Layout['dagre']({
        rankdir: 'TB',
        nodesep: 70,
        ranksep: 50,
        ...options?.innerLayout,
      }),
    },

    'dagre-grid': {
      type: 'comboCombined',
      begin: [0, 0],
      outerLayout: new G6.Layout['dagre']({
        rankdir: 'LR',
        nodesep: 90,
        ranksep: 90,
        sortByCombo: true,
        ...options?.outerLayout,
      }),

      innerLayout: new G6.Layout['grid']({
        preventOverlap: true,
        condense: true,
        nodeSize: 70 * 2.3,
        sortBy: 'comboId',
        // ...options?.innerLayout,
      }),
    },

    'grid': {
      type: 'grid',
      // begin: [20, 20],
    },

    'random': {
      type: 'random',
    },

    'dagre-tbt': {
      type: 'dagre-tbt',
      nodesep: 70,
      ranksep: 80,
    },

    'dagre-tgb': {
      type: 'dagre-tgb',
      nodesep: 70,
      ranksep: 80,
    }
  };
  return data[layout] || data['dagre'];
}

export function getDefaultEdge(type) {
  // const point = getAnchorPoints('center').getEdgeAnchorPoints({
  //   size: 70,
  //   lineWidth: 2,
  //   offset: 8,
  // });

  const baseStyle = {
    loopCfg: {
      position: 'left',
      dist: 100,
      clockwise: false,
      pointPadding: 15,
    },

    lineWidth: 2,
    stroke: "#6AC9FF",
    startArrow: {
      path: G6.Arrow.triangle(0, 0, 4),
      d: 4,
    },
    endArrow: {
      path: G6.Arrow.triangle(5, 5, 4),
      d: 4,
      fill: "#6AC9FF",
    },

    active: {
      stroke: "#0066FF",
      endArrow: {
        fill: '#0066FF'
      }
    },

    selected: {
      stroke: "#0066FF",
      endArrow: {
        fill: '#0066FF'
      }
    },

    running: {
      stroke: "#0066FF",
      endArrow: {
        fill: '#0066FF'
      },
    }
  };

  const defaultData = {
    'cubic-circle-run': {
      type: 'cubic-circle-run',
      style: {
        ...baseStyle,
      }
    },

    'cubic-v-circle-run': {
      type: 'cubic-v-circle-run',
      style: {
        ...baseStyle,
      }
    },

    'arc-circle-run': {
      type: 'arc-circle-run',
      style: {
        ...baseStyle,
      }
    },

    'line-circle-run': {
      type: 'line-circle-run',
      style: {
        ...baseStyle,
      }
    },

    'loop-circle-run': {
      type: 'loop-circle-run',
      style: {
        ...baseStyle,
      }
    }
  };

  return defaultData[type] || defaultData['cubic-v-circle-run'];
}

export function getDefaultNode(type) {
  const defaultData = {
    'node-icon': {
      type: "node-icon",
      statusType: 'normal',
      shape: 'hexagonal-polygon',
      size: 70,
      style: {
        lineWidth: 3
      },
      center: {
        show: true,
        text: undefined
      },

      rightTop: {
        show: true,
      },

      rightBottom: {
        show: true,
      }
    },
  }
  return defaultData[type || 'node-icon'];
}

export function getDefaultCombo(type) {
  const defaultData = {
    'custom-combo': {
      type: "custom-combo",
      title: '--',
      size: 70,
      padding: [120, 120, 120, 120],
      fill: '#0099ff07',
      stroke: '#09F',
      center: {
        show: true,
        text: undefined
      },
      header: {
        show: true,

        style: {
          fill: '#0099ff20',
          stroke: '#09F',
        }
      }
    },
  }
  return defaultData[type || 'custom-combo'];
}

const dataMerge = function (data, props) {
  Object.keys(props).forEach((key) => {
    if (!Array.isArray(data[key]) && typeof data[key] === "object") {
      if (typeof props[key] === "object") {
        dataMerge(data[key], props[key]);
      } else {
        // Allow overwrite if types differ (e.g. endArrow object vs boolean)
        data[key] = props[key];
      }
    } else {
      data[key] = props[key];
    }
  });
}

export function assignOptions(option, vmOption) {
  const assign_option = cloneDeep(graph_default_option);

  if (option.defaultNode) {
    if (option.defaultNode.type) assign_option.defaultNode = getDefaultNode(option.defaultNode.type);
  }

  if (option.defaultEdge) {
    if (option.defaultEdge.type) assign_option.defaultEdge = getDefaultEdge(option.defaultEdge.type);
  }

  if (option.defaultCombo) {
    if (option.defaultCombo.type) assign_option.defaultCombo = getDefaultCombo(option.defaultCombo.type);
  }

  dataMerge(assign_option, option);

  if (option.layout) {
    if (option.layout.type) assign_option.layout = getLayout(option.layout.type, option.layout);
  }

  assign_option.width = assign_option.width || graph_default_option.width;
  assign_option.height = assign_option.height || graph_default_option.height;

  assign_option.plugins = [];
  let minimap;
  if (vmOption.minimap) {
    minimap = getMinimap(G6);
    assign_option.plugins.push(minimap);
  }

  return {
    option: assign_option,
    minimap
  };
}

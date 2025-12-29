import G6 from "@antv/g6";
import { getTooltipStatus, fittingString, getHealthSetting } from './util'
import { getAnchorPoints, getShape } from './register-shape-methods'

export function getRegisterNode(g6_example) {
  const g6_graph = g6_example.g6_graph;

  const registerNode = {
    'node-icon': {
      node: {
        getAnchorPoints: function (...args) {
          getAnchorPoints('center').getNodeAnchorPoints(...args, g6_graph);
        },
        drawShape: function drawShape(cfg, group) {
          const status = getHealthSetting(cfg.statusType) || cfg;
          const shape_type = cfg.shape || 'hexagonal-polygon';

          // Add Halo
          getShape('state-halo').add(shape_type, {cfg, group, style: status});

          // Main Shape
          const shape = getShape('main-shape').add(shape_type, {cfg, group, style: status});
  
          // Icon
          getShape('node-icon').add({cfg, group, style: status});

          // Center Number
          getShape('node-center-group').add(G6, {cfg, group, style: status});

          // Right Top Number
          if (cfg?.rightTop?.show && cfg?.data?.right_top_number) {
            const status = getHealthSetting('abnormal') || cfg;
            getShape('text-number').add(G6, {
              cfg,
              group,
              position: 'right-top',
              style: {
                stroke: status.stroke,
                fill: status.fill,
                ...cfg?.rightTop,
                ...status?.rightTop
              },
              data: {
                number: cfg?.data?.right_top_number,
              }
            });
          }

          // Right Bottom Number
          if (cfg?.rightBottom?.show && cfg?.data?.right_bottom_number) {
            getShape('text-number').add(G6, {
              cfg,
              group,
              position: 'right-bottom',
              style: {
                stroke: status.stroke,
                fill: status.fill,
                ...cfg?.rightBottom,
                ...status?.rightBottom
              },
              data: {
                number: cfg?.data?.right_bottom_number,
              }
            });
          }

          // Title
          getShape('node-title').add(G6, {cfg, group, style: status});
  
          // Arrow
          getShape('arrow').add('rect', {cfg, group, style: status, position: 'top'});
          getShape('arrow').add('rect', {cfg, group, style: status, position: 'bottom'});
  
          // Node Status
          const nodeStatus = getTooltipStatus(cfg);
          getShape('node-status').add(G6, {cfg, group, status: nodeStatus});

          return shape;
        },

        afterUpdate(cfg, item) {
          // 注: 使用 updateItem 时，不会触发 afterUpdate 它会重绘制整个节点，并导致节点闪烁
        },

        setState(name, value, item) {
          const model = item.getModel();
          if (name === 'statusType') {
            const status = getHealthSetting(model.statusType) || model;
            getShape('state-halo').update(item, model, status);
            getShape('main-shape').update(item, model, status);
            getShape('node-center-group').update(G6, item, model, status);
            // Icon
            getShape('node-icon').update(item, model, status);
          }
  
          // 展开 or 收起
          if (name === 'node-collapsed') {
            getShape('arrow').setState(item, {value});
          }

          // 置灰 or 非置灰
          getShape('group').disabled(g6_example, item, name, value);

          if (name === 'node-active') {
            getShape('state-halo').setState(item, {name,value});
          }
        },
      }
    },
  }

  return registerNode;
}


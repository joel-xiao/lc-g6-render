import { getG6TooltipPos, joinDataMapKey } from './util'
import { getShape } from './register-shape-methods'

export function getEvent(event) {
  const data = {
    'node-collapsed': {
      // 
      click: (g6_graph, e, that, option) => {
        const model = e.item.getModel();
        const disabled_name = e.target.get('disabled-name');
        const collapsed_name = e.target.get('collapsed-name');
        let node_edge_type = e?.target.get('node-edge-type');

        const centerNodes = option.g6_example.vmOption.centerNodes || [];
        if (centerNodes.some(nodeId => nodeId === model.id)) return; // 中心节点直接 return;
        if (e.target.get('event-name') !== 'node-collapsed') return;
        if (model.disabled_collapse) return;
        if (model[disabled_name]) return;

        if (model.duplex_edge_type === 'out-edges') {
          const shape_base_data = getShape('arrow').getCfg(model, 'bottom').base_data;
          node_edge_type = shape_base_data['node-edge-type'];

          model[shape_base_data['collapsed-name']] = !model[shape_base_data['collapsed-name']];
          model[collapsed_name] = model[shape_base_data['collapsed-name']];

        } else {
          model[collapsed_name] = !model[collapsed_name];
        }

        g6_graph.setItemState(e.item, 'node-collapsed', {
          name: collapsed_name,
          value: model[collapsed_name]
        });

        if (!model[collapsed_name]) {
          const is_out = node_edge_type === 'out-edges';
          const edges = is_out ? e.item.getOutEdges() : e.item.getInEdges();
          const removeNodes = new Map();
          const removeEdges = new Map();
          const removeCaching = [joinDataMapKey(node_edge_type, model.id)];
          const caching_data = option.g6_example.mapData.get(removeCaching[0]);
          collapsed(e.item, edges, is_out, undefined, 0);

          setTimeout(() => {
            const data = option.g6_example.data;
            for (let value of removeNodes.values()) {
              if (value._cfg) {
                const nodeFindIndex = data.nodes.findIndex(node => node.id === value._cfg.model.id);
                if (nodeFindIndex !== -1) data.nodes.splice(nodeFindIndex, 1);
                g6_graph.removeItem(value);
              }
            }

            for (let value of removeEdges.values()) {
              if (value._cfg) {
                const edgeFindIndex = data.edges.findIndex(edge => edge.target === value._cfg.model.target && edge.source === value._cfg.model.source);
                if (edgeFindIndex !== -1) data.edges.splice(edgeFindIndex, 1);
                g6_graph.removeItem(value);
              }
            }

            option.g6_example.calcTopologyData();
          }, 50)

          function collapsed(parent, edges, is_out, caching_data, depth = 0) {
            const parentModel = parent.getModel();
            const caching_node = caching_data?.nodes.find(node => node.id === parentModel.id);

            edges.forEach(edge => {
              const edgeModel = edge.getModel();
              const itemNode = is_out ? edge.getTarget() : edge.getSource();
              const itemNodeModel = itemNode.getModel();

              if (edgeModel.source === model.id && edgeModel.target === model.id) {
                removeEdges.set(edge, edge);
                return;
              }

              if (removeEdges.has(edge)) return;
              if (removeNodes.has(itemNode)) return;
              if (itemNodeModel.id === model.id) return;
              if (itemNodeModel.node_depth === 0) return;

              const is_flag = is_out ? itemNodeModel.node_depth > 0 : itemNodeModel.node_depth < 0;
              const is_last_callback_first = is_out ? itemNodeModel.node_depth < parentModel.node_depth : itemNodeModel.node_depth > parentModel.node_depth;

              if (is_flag) {
                removeEdges.set(edge, edge);

                const curr_edges = is_out ? itemNode.getInEdges() : itemNode.getOutEdges();
                const is_not_multiple_edge = curr_edges.every(edge => removeEdges.has(edge));

                if (is_not_multiple_edge) {
                  removeNodes.set(itemNode, itemNode);
                }

                if (parentModel.id !== itemNodeModel.id) {
                  const next_edges = is_out ? itemNode.getOutEdges() : itemNode.getInEdges();
                  const caching_id = joinDataMapKey(node_edge_type, itemNodeModel.id);
                  removeCaching.push(caching_id);
                  caching_data = option.g6_example.mapData.get(caching_id) || caching_data;
                  collapsed(itemNode, next_edges, is_out, caching_data, depth++);
                }
              } else if (is_last_callback_first) {
                removeEdges.set(edge, edge);
              }
            });
          }
        }
      },

      enter(g6_graph, e, that, option) {
        const model = e.item.getModel();

        const centerNodes = option.g6_example.vmOption.centerNodes || [];
        if (centerNodes.some(nodeId => nodeId === model.id)) return; // 中心节点直接 return;

        if (model.disabled_collapse) return;

        that.get_duplex_edge(g6_graph, e.item, that, option);
        that.enter_collapsed(g6_graph, e, that, option);
        that.enter_disabled(g6_graph, e, that, option);
        model.show_collapse = true;
        g6_graph.setItemState(e.item, 'node-collapsed', { name: 'show_collapse', value: model.show_collapse });
      },

      leave(g6_graph, e, that, option) {
        const model = e.item.getModel();

        const centerNodes = option.g6_example.vmOption.centerNodes || [];
        if (centerNodes.some(nodeId => nodeId === model.id)) return; // 中心节点直接 return;

        if (model.disabled_collapse) return;

        model.show_collapse = false;
        g6_graph.setItemState(e.item, 'node-collapsed', { name: 'show_collapse', value: model.show_collapse });
      },

      enter_disabled(g6_graph, e, that, option) {
        const model = e.item.getModel();
        const center_node_model = that.get_center_model(g6_graph, e, that, option);

        const shape_top_base_data = getShape('arrow').getCfg(model, 'top').base_data;
        const shape_bottom_base_data = getShape('arrow').getCfg(model, 'bottom').base_data;
        const top_disabled_name = shape_top_base_data['disabled-name'];
        const bottom_disabled_name = shape_bottom_base_data['disabled-name'];

        model[top_disabled_name] = model.node_depth > 0;
        model[bottom_disabled_name] = model.node_depth < 0;

        const in_edges = e.item.getInEdges();
        const out_edges = e.item.getOutEdges();
        if (!in_edges.length && !out_edges.length) {
          model[top_disabled_name] = true;
          model[bottom_disabled_name] = true;
        }

        g6_graph.setItemState(e.item, 'node-collapsed', { name: top_disabled_name, value: model[top_disabled_name] });
        g6_graph.setItemState(e.item, 'node-collapsed', { name: bottom_disabled_name, value: model[bottom_disabled_name] });
      },

      enter_collapsed(g6_graph, e, that, option) {
        const model = e.item.getModel();
        if (!model.is_enter_collapsed) {
          model.is_enter_collapsed = true;
          const in_edges = e.item.getInEdges();
          const out_edges = e.item.getOutEdges();
          const shape_top_base_data = getShape('arrow').getCfg(model, 'top').base_data;
          const shape_bottom_base_data = getShape('arrow').getCfg(model, 'bottom').base_data;
          if (model.duplex_edge_one && model.duplex_edge_type === 'out-edges') {
            g6_graph.setItemState(e.item, 'node-collapsed', { name: 'collapsed-name', 'node-edge-type': shape_top_base_data['node-edge-type'], value: model[shape_bottom_base_data['collapsed-name']] });
            g6_graph.setItemState(e.item, 'node-collapsed', { name: 'collapsed-name', 'node-edge-type': shape_bottom_base_data['node-edge-type'], value: model[shape_bottom_base_data['collapsed-name']] });
            return;
          } else if (model.duplex_edge_one && model.duplex_edge_type === 'in-edges') {
            g6_graph.setItemState(e.item, 'node-collapsed', { name: 'collapsed-name', 'node-edge-type': shape_top_base_data['node-edge-type'], value: model[shape_top_base_data['collapsed-name']] });
            g6_graph.setItemState(e.item, 'node-collapsed', { name: 'collapsed-name', 'node-edge-type': shape_bottom_base_data['node-edge-type'], value: model[shape_top_base_data['collapsed-name']] });
            return;
          }

          !!in_edges.length && g6_graph.setItemState(e.item, 'node-collapsed', { name: 'collapsed-name', 'node-edge-type': shape_top_base_data['node-edge-type'], value: true });
          !!out_edges.length && g6_graph.setItemState(e.item, 'node-collapsed', { name: 'collapsed-name', 'node-edge-type': shape_bottom_base_data['node-edge-type'], value: true });
        }
      },

      get_duplex_edge(g6_graph, item) {
        const model = item.getModel();
        const in_edges = item.getInEdges();
        const out_edges = item.getOutEdges();

        const duplex_edge = in_edges.some(in_edge => out_edges.some(out_edge => {
          const in_model = in_edge.getModel();
          const out_model = out_edge.getModel();
          return in_model.source === out_model.target && in_model.target === out_model.source;
        }));

        model.duplex_edge_type = duplex_edge && model.node_depth !== 0 && (model.node_depth < 0 ? 'in' : 'out') + '-edges';
        model.duplex_edge_one = duplex_edge && in_edges.length === 1 && out_edges.length === 1;
        return model;
      },

      get_center_model(g6_graph, e, that, option) {
        const model = e.item.getModel();
        const nodes = g6_graph.getNodes();
        const combos = g6_graph.getCombos();
        const centerNodes = option.g6_example.vmOption.centerNodes || [];
        let centerNodeId;
        if (model.comboId) {
          centerNodeId = centerNodes.find(nodeId => nodes.some(nodeItem => {
            const nodeModel = nodeItem.getModel();
            return nodeModel.comboId === model.comboId && nodeModel.id === nodeId;
          }));
        } else {
          centerNodeId = centerNodes.find(nodeId => [...nodes, ...combos].some(nodeItem => {
            const nodeModel = nodeItem.getModel();
            return !nodeModel.comboId && nodeModel.id === nodeId;
          }));
        }
        const center_node = g6_graph.findById(centerNodeId);
        const center_node_model = center_node?.getModel();
        return center_node_model;
      },

      isNotCollapsed(g6_graph, e, that, option) {
        const model = e.item.getModel();

        const centerNodes = option.g6_example.vmOption.centerNodes || [];
        if (centerNodes.some(nodeId => nodeId === model.id)) return true; // 中心节点直接 return;
        if (model.disabled_collapse) return true;
        if (model[e.target.get('disabled-name')]) return true;
        if (!model[e.target.get('collapsed-name')]) return true;
      }
    },

    'node-active': {
      click(g6_graph, e, that, option) {
        if (e.target.get('event-name') !== 'node-main') return;
        const g6_example = option.g6_example;
        const caching = g6_example.caching;
        // if (caching.hasCaching('event.node-active.item')) return;
        that.clear(g6_graph, e, that, option);

        const node = e.item;
        const model = e.item.getModel();
        model.active = true;
        g6_graph.setItemState(node, 'node-active', model.active);
        caching.setCaching('event.node-active.item', node)
      },

      cancelStatus(g6_graph, e, that, option) {
        const node = e.item;
        const model = e.item.getModel();
        model.active = false;
        g6_graph.setItemState(node, 'node-active', model.active);
      },

      clear(g6_graph, e, that, option) {
        const g6_example = option.g6_example;
        const caching = g6_example.caching;
        if (caching.hasCaching('event.node-active.item')) {
          const node = caching.getCaching('event.node-active.item');
          that.cancelStatus(g6_graph, { item: node }, that, option);
          caching.delCaching('event.node-active.item');

        } else {
          g6_graph?.getNodes().forEach((node) => {
            const model = node.getModel();
            model.active = false;
            g6_graph.setItemState(node, 'node-active', model.active);
          });
        }

      },

      load(g6_graph, e, that, data) {
        if (!data.ids) return;
        try {
          data.ids.forEach(id => {
            const node = g6_graph.findById(id);
            if (node) {
              const model = node.getModel();
              model.active = true;
              g6_graph.setItemState(node, 'node-active', model.active);
            }
          });
        } catch (e) { }
      },
    },

    'edge-running': {
      // 边动画
      setState(g6_graph, e, that, option) {
        const edges = option.edges || [];
        edges.forEach(edge => {
          const edgeItem = g6_graph.find('edge', (item) => item.getModel().target === edge.target && item.getModel().source === edge.source);
          if (edgeItem) {
            const model = edgeItem.getModel();
            model.running = true;
            g6_graph.setItemState(edgeItem, 'running', model.running);
            edgeItem.toFront();
          }
        });
      },

      setCachingState(g6_graph, e, that, option) {
        const g6_example = option.g6_example;
        const caching = g6_example.caching;
        const node = e.item;
        const nodeModel = node.getModel();

        if (caching.getCaching('event.custom-legend.check')) return;

        if (option?.event_type !== 'enter') {
          nodeModel['event-click-edge-running'] = !nodeModel['event-click-edge-running'];
          caching.setCaching('event.edge-running.select', nodeModel['event-click-edge-running']);
        }
      },

      isCachingState(g6_graph, e, that, option) {
        const event_name = e.target.get('event-name');
        return event_name === 'node-collapsed';
      },

      click: (g6_graph, e, that, option) => {
        if (that.isCachingState(g6_graph, e, that, option)) return;
        that.clear(g6_graph, e, that, option);
        that.setCachingState(g6_graph, e, that, option);

        const node = e.item;
        const edges = node.getEdges();
        edges.forEach((edge) => {
          const model = edge.getModel();
          model.running = true;
          g6_graph.setItemState(edge, 'running', model.running)
          edge.toFront();
        });
      },

      enter(g6_graph, e, that, option) {
        const g6_example = option.g6_example;
        const caching = g6_example.caching;

        if (caching.hasCaching('event.edge-running.select')) return;

        const node = e.item;
        const nodeModel = node.getModel();
        if (nodeModel['event-click-edge-running']) return;

        that.click(g6_graph, e, that, { ...option, event_type: 'enter' });
      },

      leave(g6_graph, e, that, option) {
        const g6_example = option.g6_example;
        const caching = g6_example.caching;

        if (caching.hasCaching('event.edge-running.select')) return;

        const node = e.item;
        const nodeModel = node.getModel();
        if (nodeModel['event-click-edge-running']) return;

        that.clear(g6_graph, e, that, option);
      },

      clear(g6_graph, e, that, option) {
        const g6_example = option.g6_example;
        const caching = g6_example.caching;
        caching.setCaching('event.edge-running.select', false);

        const nodes = g6_graph.getNodes();
        nodes.forEach(node => {
          const nodeModel = node.getModel();
          nodeModel['event-click-edge-running'] = false;
        });

        g6_graph.getEdges().forEach((edge) => {
          const model = edge.getModel();
          model.running = false;
          g6_graph.setItemState(edge, 'running', model.running);
        });
      },
    },

    'edge-focus': {
      // 边聚焦
      enter: (g6_graph, e, that) => {
        that.triggerEdgeEvent(g6_graph, e, 'enter');
      },

      leave(g6_graph, e, that) {
        that.triggerEdgeEvent(g6_graph, e, 'leave');
      },

      clear(g6_graph) {
        g6_graph.getEdges().forEach((edge) => {
          const model = edge.getModel();
          model.selected = false;
          g6_graph.setItemState(edge, 'selected', model.selected);
        });
      },

      triggerEdgeEvent(g6_graph, e, type) {
        const selected = type === 'enter';
        const { item } = e;
        const model = item.getModel();
        const sourceItem = item.getSource();
        const source_in_edges = sourceItem.getInEdges();
        model.selected = selected;
        item.toFront();
        g6_graph.setItemState(item, 'selected', model.selected);
        source_in_edges.forEach(edgeItem => {
          const edge_model = edgeItem.getModel();
          edge_model.selected = selected;
          if (edge_model.source === model.target && edge_model.target === model.source) {
            g6_graph.setItemState(edgeItem, 'selected', edge_model.selected);
          }
        })
      }
    },

    'combo-collapsed': {
      click(g6_graph, e, that, option) {
        if (e.target.get('event-name') === 'combo-collapsed') {
          g6_graph.collapseExpandCombo(e.item);

          g6_graph.layout();
          let timer, timer2;
          clearTimeout(timer);
          clearTimeout(timer2);
          timer = setTimeout(() => {
            option.g6_example.focusNode(e);
            clearTimeout(timer);
            timer2 = setTimeout(() => {
              option.g6_example.updateMinimap();
              clearTimeout(timer2);
            }, 500);
          }, 200);
        }
      }
    },

    'loop-edge': {
      load(g6_graph, e, that, option) {

      },
    },

    'disabled': {
      setState(g6_graph, e, that, option) {
        const g6_example = option.g6_example;
        const caching = g6_example.caching;
        caching.setCaching('event.disabled.select', true);

        const edges = g6_graph.getEdges();
        const nodes = g6_graph.getNodes();
        const option_not_nodes = option.not_nodes || [{}];
        const option_not_edges = option.not_edges || [{}];
        nodes.forEach(node => {
          const is_some = option_not_nodes.some(opt_node => {
            if (typeof opt_node === 'string') {
              return opt_node === node.getModel().id;
            }
            return opt_node.id === node.getModel().id;
          });

          if (!is_some) {
            g6_graph.setItemState(node, 'disabled', { event_type: 'setState', value: true });
          } else {
            g6_graph.setItemState(node, 'disabled', { event_type: 'setState', value: false });
          }
        });

        edges.forEach(edge => {
          if (!option_not_edges.some(opt_edge => opt_edge.target === edge.getModel().target && opt_edge.source === edge.getModel().source)) {
            g6_graph.setItemState(edge, 'disabled', { event_type: 'setState', value: true });
            edge.toBack();
          }
        });
      },

      setCachingState(g6_graph, e, that, option) {
        if (that.isCachingState(g6_graph, e, that, option)) return;

        const g6_example = option.g6_example;
        const caching = g6_example.caching;
        const node = e.item;
        const nodeModel = node.getModel();

        if (option?.event_type !== 'enter') {
          caching.setCaching('event.disabled.select', true);
        }
      },

      isCachingState(g6_graph, e, that, option) {
        const event_name = e.target.get('event-name');
        return event_name === 'node-collapsed';
      },

      click(g6_graph, e, that, option) {
        if (that.isCachingState(g6_graph, e, that, option)) return;
        that.setCachingState(g6_graph, e, that, option);

        const node = e.item;
        const nodes = [...g6_graph.getNodes(), ...g6_graph.getCombos()];
        nodes.forEach(node => {
          if (node.getType() === 'combo' && !node.collapsed) return;
          g6_graph.setItemState(node, 'disabled', { event_type: option?.event_type || 'click', value: true });
        });

        const edges = g6_graph.getEdges();
        edges.forEach(edge => {
          g6_graph.setItemState(edge, 'disabled', { event_type: option?.event_type || 'click', value: true });
        });

        g6_graph.setItemState(e.item, 'disabled', { event_type: option?.event_type || 'click', value: false });
        const out_edges = node.getOutEdges();
        out_edges.forEach(edge => {
          const targetNode = edge.getTarget();
          if (targetNode) {
            g6_graph.setItemState(targetNode, 'disabled', { event_type: option?.event_type || 'click', value: false });
            disabledCombo(targetNode);
          }
          g6_graph.setItemState(edge, 'disabled', { event_type: option?.event_type || 'click', value: false });
        });

        const in_edges = node.getInEdges();
        in_edges.forEach(edge => {
          const sourceNode = edge.getSource();
          if (sourceNode) {
            g6_graph.setItemState(sourceNode, 'disabled', { event_type: option?.event_type || 'click', value: false });
            disabledCombo(sourceNode);
          }
          g6_graph.setItemState(edge, 'disabled', { event_type: option?.event_type || 'click', value: false });
        });

        function disabledCombo(node) {
          const nodeModel = node.getModel();
          if (node.getType() === 'combo') {
            const nodes = node.getNodes();
            for (const node of nodes) {
              g6_graph.setItemState(node, 'disabled', { event_type: option?.event_type || 'click', value: false });
              const in_edges = node.getInEdges();
              for (const edge of in_edges) {
                g6_graph.setItemState(edge, 'disabled', { event_type: option?.event_type || 'click', value: false });
              }

              const out_edges = node.getOutEdges();
              for (const edge of out_edges) {
                g6_graph.setItemState(edge, 'disabled', { event_type: option?.event_type || 'click', value: false });
              }
            }
          }
        }
      },

      enter(g6_graph, e, that, option) {
        const g6_example = option.g6_example;
        const caching = g6_example.caching;
        if (caching.hasCaching('event.disabled.select')) return;

        const node = e.item;
        const nodeModel = node.getModel();
        that.click(g6_graph, e, that, { ...option, event_type: 'enter' });
      },

      leave(g6_graph, e, that, option) {
        const g6_example = option.g6_example;
        const caching = g6_example.caching;

        if (caching.hasCaching('event.disabled.select')) return;

        const node = e.item;
        const nodeModel = node.getModel();

        that.clear(g6_graph, e, that, option);
      },

      clear(g6_graph, e, that, option) {
        const g6_example = option.g6_example;
        const caching = g6_example.caching;
        caching.setCaching('event.disabled.select', false);

        const nodes = [...g6_graph.getNodes(), ...g6_graph.getCombos()];
        nodes.forEach(node => {
          const nodeModel = node.getModel();
          g6_graph.setItemState(node, 'disabled', { event_type: 'clear', value: false });
        });

        const edges = g6_graph.getEdges();
        edges.forEach(edge => {
          g6_graph.setItemState(edge, 'disabled', { event_type: 'clear', value: false });
        });
      }
    },
  };

  return data[event];
}

export function getComponentEvent(com) {
  const data = {
    'custom-text-tooltip': {
      over(g6_graph, evt_type, evt, vm) {
        const tooltip_event = evt?.target?.get('text-tooltip');
        if (!tooltip_event) return;

        const enter_events = ['combo:mouseover'];
        if (enter_events.some(ev => ev === evt_type)) {
          const model = evt.item.getModel();
          if (evt_type === 'combo:mouseover' && model.collapsed) {
            return;
          }
          vm.setModel(model.title);
          vm.show({
            x: evt.clientX + (model.x - evt.x) + evt.target.attrs.x,
            y: evt.clientY + (model.y - evt.y) + evt.target.attrs.y + 6
          });
        }
      },

      out(g6_graph, evt_type, evt, vm) {
        const tooltip_event = evt?.target?.get('text-tooltip');
        if (!tooltip_event) return;

        const enter_events = ['combo:mouseout'];
        if (enter_events.some(ev => ev === evt_type)) {
          const model = evt.item.getModel();
          if (evt_type === 'combo:mouseout' && model.collapsed) {
            return;
          }

          vm.hide();
        }
      },
    },

    'custom-tooltip': {
      click(g6_graph, evt_type, evt, vm) {
        const tooltip_event = evt?.target?.get('tooltip-event');
        const enter_events = ['edge:click'];
        if (enter_events.some(ev => ev === evt_type)) {
          const model = evt.item.getModel();
          if (tooltip_event === false) {
            return;
          }
          vm.setModel(model, evt.item, evt_type);
          vm.closeDefaultTooltip();
        }
      },

      enter(g6_graph, evt_type, evt, vm) {
        const tooltip_event = evt?.target?.get('tooltip-event');
        const enter_events = ['node:mouseenter', 'edge:mouseenter', 'combo:mouseenter'];
        if (enter_events.some(ev => ev === evt_type)) {
          const model = evt.item.getModel();
          if (evt_type === 'combo:mouseenter' && (!model.collapsed || !tooltip_event)) {
            if (!model.collapsed)
              return;
          }

          const item_pos = getG6TooltipPos(g6_graph, evt);
          vm.setModel(model, evt.item, evt_type);
          vm.show(item_pos);
        }
      },

      leave(g6_graph, evt_type, evt, vm) {
        const tooltip_event = evt?.target?.get('tooltip-event');
        const event_name = evt?.target?.get('event-name');
        const leave_events = ['node:mouseleave', 'edge:mouseleave', 'combo:mouseleave', 'combo:click'];
        if (leave_events.some(ev => ev === evt_type)) {
          const model = evt.item.getModel();
          if ((evt_type === 'combo:mouseleave') && (!model.collapsed)) {
            return;
          }

          if (evt_type === 'combo:click' && event_name !== 'combo-collapsed') {
            return;
          }

          vm.hide();
        }
      },

      close(g6_graph, evt_type, evt, vm) {
        const leave_events = ['node:click'];
        if (leave_events.some(ev => ev === evt_type)) {
          vm.close();
        }
      },
    },

    'custom-legend': {
      check(g6_graph, evt_type, evt, vm, option) {
        if (evt_type !== 'check') return;
        const items = vm.getItems();
        const is_not_check = items.every(item => !item.check);
        const caching = option.g6_example.caching;
        if (caching.getCaching('event.custom-legend.disabled')) return;
        // caching.setCaching('event.custom-legend.check', !is_not_check);
        const nodes = [...g6_graph.getNodes(), ...g6_graph.getCombos()];
        nodes.forEach(node => {
          if (node.getType() === 'combo' && !node.collapsed) return;

          const node_model = node.getModel();
          const legend = items.find(item => item.filterFn(node_model));
          g6_graph.setItemState(node, 'active_by_legend', {
            value: is_not_check ? true : !!legend?.check,
            event_type: 'check'
          });
        });
      },

      clear(g6_graph, evt_type, evt, vm, option) {
        const caching = option.g6_example.caching;
        // if (caching.getCaching('event.custom-legend.check')) return;
        const events = ['clear'];
        if (!events.some(e => e === evt_type)) return;

        const nodes = [...g6_graph.getNodes(), ...g6_graph.getCombos()];
        nodes.forEach(node => {
          g6_graph.setItemState(node, 'active_by_legend', {
            value: true,
            event_type: 'clear'
          });
        });

        vm.clearChecks();
      },

      disabled(g6_graph, evt_type, evt, vm, option) {
        const caching = option.g6_example.caching;
        if (evt_type !== 'disabled') return;

        caching.setCaching('event.custom-legend.disabled', option.disabled);
        vm.setDisabled(option.disabled);
      }
    },

    'custom-loading': {
      click(g6_graph, evt_type, evt, vm, option, cb) {
        const events = ['node:click'];
        if (!events.some(ev => ev === evt_type)) return;
        const model = evt.item.getModel();

        const centerNodes = option.g6_example.vmOption.centerNodes || [];
        if (centerNodes.some(nodeId => nodeId === model.id)) return; // 中心节点直接 return;

        if (model.disabled_collapse) return;
        if (evt?.target?.get('event-name') === 'node-collapsed') {
          if (model[evt.target.get('disabled-name')]) return;
          if (model[evt.target.get('collapsed-name')]) {
            const model = evt.item.getModel();
            const target = evt.target;
            const edgeType = target.get('node-edge-type');
            const targetX = target.attr('x') || -8;
            const targetY = target.attr('y') || (edgeType === 'in-edges' ? -43 : 27);
            vm.show({
              x: evt.clientX + (model.x - evt.x) + targetX,
              y: evt.clientY + (model.y - evt.y) + targetY,
            });
            cb?.();
          }
        }
      },

      hide(g6_graph, evt_type, evt, vm, option, cb) {
        if (evt_type !== 'hide') return;
        vm.hide();

        if (option.text) {
          vm.showText(option, cb);
        } else {
          cb?.();
        }
      },
    }
  };

  return data[com];
}

export function isEvent(e) {
  // 禁用Event
  const model = e?.item?.getModel();
  const is_disabled_event = e?.target?.get('disabled-event');

  return is_disabled_event || model?.disabled_event;
}

export function onEvent(events, ev_name, e, g6_graph, data) {
  if (e && isEvent(e)) return;
  const result = [];
  events.forEach(ev => {
    const event = getEvent(ev);
    let fn = event?.[ev_name];
    if (fn) {
      const ret = fn(g6_graph, e, event, data);
      result.push(ret);
    } else {
      result.push(undefined);
    }
  });

  return result;
}

export function onComponentEvent(components, evt_type, e, g6_graph, vm, option, cb) {
  if (isEvent(e)) return;

  components.forEach(com => {
    const component = getComponentEvent(com);
    if (component) {
      Object.keys(component).forEach((fn_key) => {
        component[fn_key](g6_graph, evt_type, e, vm, option, cb, component);
      })
    }
  });
}

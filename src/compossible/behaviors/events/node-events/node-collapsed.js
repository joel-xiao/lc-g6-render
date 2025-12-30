import { joinDataMapKey } from '../../../utils/common';
import { getShape } from '../../../shapes/items/index'; // Updated import

export default {
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

        // Use getShape/getComponent from new location
        // Note: getShape from components/index.js maps to getComponent which returns the component object
        // We need to ensure getShape('arrow') returns the object that has getCfg
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
            const top_collapsed_name = shape_top_base_data['collapsed-name'];
            const bottom_collapsed_name = shape_bottom_base_data['collapsed-name'];

            if (model.duplex_edge_one && model.duplex_edge_type === 'out-edges') {
                g6_graph.setItemState(e.item, 'node-collapsed', { name: 'collapsed-name', 'node-edge-type': shape_top_base_data['node-edge-type'], value: model[bottom_collapsed_name] });
                g6_graph.setItemState(e.item, 'node-collapsed', { name: 'collapsed-name', 'node-edge-type': shape_bottom_base_data['node-edge-type'], value: model[bottom_collapsed_name] });
                return;
            } else if (model.duplex_edge_one && model.duplex_edge_type === 'in-edges') {
                g6_graph.setItemState(e.item, 'node-collapsed', { name: 'collapsed-name', 'node-edge-type': shape_top_base_data['node-edge-type'], value: model[top_collapsed_name] });
                g6_graph.setItemState(e.item, 'node-collapsed', { name: 'collapsed-name', 'node-edge-type': shape_bottom_base_data['node-edge-type'], value: model[top_collapsed_name] });
                return;
            }

            // 如果有边，设置 collapsed-name 为 true（表示已展开状态）
            if (in_edges.length) {
                model[top_collapsed_name] = true;
                g6_graph.setItemState(e.item, 'node-collapsed', { name: 'collapsed-name', 'node-edge-type': shape_top_base_data['node-edge-type'], value: true });
            }
            if (out_edges.length) {
                model[bottom_collapsed_name] = true;
                g6_graph.setItemState(e.item, 'node-collapsed', { name: 'collapsed-name', 'node-edge-type': shape_bottom_base_data['node-edge-type'], value: true });
            }
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
}

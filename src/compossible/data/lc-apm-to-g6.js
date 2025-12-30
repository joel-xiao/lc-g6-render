/**
 * 灵云 APM 数据转换工具
 * 用于将 APM 后端数据转换为 G6 图数据格式
 */
import { cloneDeep } from "lodash";
import { mergeModel } from "./format.js";

/**
 * 根据 props 生成节点 ID
 */
export function getJoinId(data, item) {
    data.props = Array.from(new Set(data.props || data.prop)).filter((r) => r);
    return (
        data.props
            .map((prop) => item[prop])
            .filter((r) => r)
            .join("-") || "id_undefined"
    );
}

/**
 * 获取节点属性
 */
function getNodeProps(data, item) {
    const result = { domain: item.domain };
    data.props.forEach((prop) => {
        result[prop] = item[prop];
    });
    return result;
}

/**
 * 根据布尔字段推导 statusType（兼容旧数据格式）
 */
function deriveStatusType(item) {
    if (item.statusType) return item.statusType;
    if (item.is_user) return "user";
    if (item.is_deleted) return "disabled";
    if (item.is_been_moved_to_other) return "moved";
    if (item.is_external) return "external";
    if (item.is_permission === false) return "no-permission";
    return "normal";
}

/**
 * 将 APM 数据转换为 G6 格式
 */
export function APMtoG6Data(data, option) {
    data.props = Array.from(new Set(data.props || data.prop)).filter((r) => r);
    const result = { nodes: [], edges: [], combos: [] };
    const topologyMap = new Map();

    // 转换节点
    data?.nodes?.forEach((node) => {
        const item = {
            shape: node.shape,
            showIcon: node.showIcon,
            title: node.title || node.app_name,
            id: getJoinId(data, node),
            props: getNodeProps(data, node),
            statusType: deriveStatusType(node),
            data: node.data,
            edges_number: node.edges_number,
            is_terminal: node.is_terminal,
            node_type: node.node_type,
            icon: node.icon,
            service_type: node.service_type,
            disabled_collapse: node.disabled_collapse,
            node_depth: node.depth,
            chain_depth: node.chain_depth,
            node_self_stats: node.node_self_stats,
            "event-enter-disabled": node["event-enter-disabled"],
        };

        if (topologyMap.has(item.id)) return;
        topologyMap.set(item.id, item);

        if (node.width) item.width = node.width;
        if (node.x !== undefined) item.x = node.x;
        if (node.y !== undefined) item.y = node.y;
        if (node.center) item.center = node.center;
        if (node.comboId) item.comboId = node.comboId;
        if (node.service_type) item.service_type = node.service_type;

        const service_types = [10, 20, 30];
        if (service_types.some(service_type => service_type == node.service_type)) {
            item.is_client = true;
        }

        result.nodes.push(item);
    });

    // 转换边
    data?.links?.forEach((link) => {
        const item = {
            target: getJoinId(data, link.to),
            source: getJoinId(data, link.from),
            target_props: link.to,
            source_props: link.from,
            link_type: link.link_type,
            data: link.data,
            edge_depth: link.depth,
            is_not_link: link.is_not_link,
            statusType: deriveStatusType(link),
            type: link.type,
            comboId: link.comboId,
        };

        if (link.style) item.style = link.style;

        if (option && option.loop_link === false && item.target === item.source) {
            return;
        }

        if (item.target === item.source) {
            item.type = "loop-circle-run";
            item.loopCfg = { position: "top", dist: 60, clockwise: true };
        }
        result.edges.push(item);
    });

    // 转换 combos
    data?.combos?.forEach((node) => {
        const item = {
            shape: node.shape,
            showIcon: node.showIcon,
            title: node.label || node.app_name || "--",
            id: getJoinId(data, node),
            props: getNodeProps(data, node),
            statusType: deriveStatusType(node),
            data: node.data,
            show_collapsed: node.show_collapsed,
            collapsed: node.collapsed,
            is_terminal: node.is_terminal,
            node_type: node.node_type,
            icon: node.icon,
            service_type: node.service_type,
            disabled_collapse: node.disabled_collapse,
            combo: true,
            node_depth: node.depth,
            chain_depth: node.chain_depth,
            node_self_stats: node.node_self_stats,
            "event-enter-disabled": node["event-enter-disabled"],
        };

        if (node.width) item.width = node.width;
        if (node.x !== undefined) item.x = node.x;
        if (node.y !== undefined) item.y = node.y;
        if (node.center) item.center = node.center;
        if (node.fill) item.fill = node.fill;
        if (node.stroke) item.stroke = node.stroke;
        if (node.header) item.header = node.header;

        result.combos.push(item);
    });

    calcExternalNodes(result, option);
    return result;
}

/**
 * 合并外部服务节点
 */
export function calcExternalNodes(data, option) {
    if (option?.merge_external_service === false) return;
    const children_sort_key = option?.children_sort_key || "total";

    let newNode;
    let newEdges = [];
    const nodes = [];
    const edges = [];
    const nodeId = "EXTERNAL_SERVICE";
    
    let node_idx = 0;
    while (node_idx < data.nodes.length) {
        const node = data.nodes[node_idx];
        if (node.statusType === 'external') {
            const filter_edges = data.edges.filter((edge) => edge.target.startsWith(nodeId));
            edges.push(...filter_edges);
            data.edges = data.edges.filter(
                (edge) => !filter_edges.some(
                    (filter_edge) => filter_edge.source === edge.source && filter_edge.target === edge.target
                )
            );
            nodes.push(node);
            data.nodes.splice(node_idx, 1);
        } else {
            node_idx++;
        }
    }

    nodes.forEach((node) => {
        if (!newNode) {
            newNode = cloneDeep(node);
        } else {
            newNode = mergeModel(newNode, node);
        }
    });

    if (!newNode) return;

    newNode.disabled_collapse = true;
    newNode.id = nodeId;
    newNode.label = "外部服务";
    newNode.title = newNode.label;
    newNode.data.center_number = nodes.length;
    newNode._children_sort_key = children_sort_key;
    newNode.data.children = cloneDeep(
        nodes.sort((a, b) => b.data[children_sort_key] - a.data[children_sort_key])
    );
    newNode.statusType = "external";
    newNode.center = { showIcon: true };

    edges.forEach((edge) => {
        edge.data.target_nodes = [];
        const find_node = nodes.find((node) => node.id === edge.target);
        if (find_node) edge.data.target_nodes.push(cloneDeep(find_node));

        edge.target = nodeId;
        edge.target_props.appsysid = nodeId;

        const newEdgeIndex = newEdges.findIndex(
            (new_edge) => new_edge.source === edge.source && new_edge.target === edge.target
        );

        if (newEdgeIndex === -1) {
            const e = cloneDeep(edge);
            e.children = [cloneDeep(e)];
            newEdges.push(e);
        } else {
            const new_edge = newEdges[newEdgeIndex];
            new_edge.children.push(cloneDeep(edge));
            newEdges[newEdgeIndex] = mergeModel(new_edge, edge);
            edge.data.target_nodes.forEach((node) => {
                if (new_edge.data.target_nodes.some((n) => n.id === node.id)) {
                    new_edge.data.target_nodes.push(node);
                }
            });
        }
    });

    data.nodes.push(newNode);
    data.edges.push(...newEdges);
}

/**
 * 计算拓扑深度
 */
export function calcTopologyDepth(data) {
    [...data.nodes, ...(data.combos || []), ...data.links].forEach((node) => {
        if (Array.isArray(node.depth)) {
            let prev_depth = node.depth.filter(d => d <= 0);
            let last_depth = node.depth.filter(d => d > 0);
            prev_depth = Math.max(...prev_depth);
            last_depth = Math.min(...last_depth);
            node.depth = (Math.abs(prev_depth) < Math.abs(last_depth) ? prev_depth : last_depth) || 0;
        }

        if (Array.isArray(node.chain_depth)) {
            let prev_depth = node.chain_depth.filter(d => d <= 0);
            let last_depth = node.chain_depth.filter(d => d > 0);
            prev_depth = Math.min(...prev_depth);
            last_depth = Math.max(...last_depth);
            node.chain_depth = (Math.abs(prev_depth) < Math.abs(last_depth) ? prev_depth : last_depth) || 0;
        }
    });
}

/**
 * APM 指标数据字段
 */
const APM_METRICS = {
    total: 0, dur: 0, questions: 0, slow: 0,
    frustrated: 0, err: 0, fail: 0, exception: 0,
};

/**
 * 计算节点的 APM 指标数据（基于边的数据聚合）
 */
export function calcNodeModelData(itemModel, g6_graph, utils, g6_example) {
    const is_edge = itemModel.id.startsWith("edge-");

    if (is_edge) {
        for (let node of [
            g6_graph.findById(itemModel.target),
            g6_graph.findById(itemModel.source),
        ]) {
            if (!node) continue;
            calcSingleNodeData(node, utils, g6_example);
        }
    } else {
        const node = g6_graph.findById(itemModel.id);
        if (node) calcSingleNodeData(node, utils, g6_example);
    }
}

function calcSingleNodeData(node, utils, g6_example) {
    const in_edges = node.getInEdges();
    const out_edges = node.getOutEdges();
    const node_model = node.getModel();

    if (node_model.node_self_stats === true) {
        if (!node_model.node_self_data) {
            node_model.node_self_data = cloneDeep(node_model.data);
        }
        if (!in_edges.length && !out_edges.length) {
            node_model.data = cloneDeep(node_model.node_self_data);
            utils?.calcNodeStatus?.(node_model);
            g6_example.updateItemState(node);
            return;
        }
    }

    scaleData(node_model, in_edges);
    scaleData(node_model, out_edges, "out");
    utils?.calcNodeStatus?.(node_model);
    g6_example.updateItemState(node);
}

function scaleData(node_model, edges, type = "") {
    const children_nodes = [];
    const edgeMap = {};

    const data = edges.reduce((prev, item) => {
        const item_model = item.getModel();
        const edgeKey = item_model.target + '-/-' + item_model.source;
        
        if (edgeMap[edgeKey]) return prev;
        edgeMap[edgeKey] = true;

        Object.keys(APM_METRICS).forEach((key) => {
            if (typeof item_model?.data?.[key] === "number") {
                prev[key] = (prev[key] || 0) + item_model.data[key];
            }
        });

        if (node_model.statusType === 'external') {
            for (let child_link of (item_model.children || [])) {
                const target_nodes = child_link.data.target_nodes || [];
                for (let node of target_nodes) {
                    const find_node = children_nodes.find(c_node => c_node.id === node.id);
                    if (find_node) {
                        Object.keys(APM_METRICS).forEach((key) => {
                            find_node.data[key] = (find_node.data[key] || 0) + (child_link.data[key] || 0);
                        });
                    } else {
                        node = cloneDeep(node);
                        Object.keys(APM_METRICS).forEach((key) => {
                            node.data[key] = (node.data[key] || 0) + (child_link.data[key] || 0);
                        });
                        children_nodes.push(node);
                    }
                }
            }
        }

        return prev;
    }, { ...APM_METRICS });

    Object.keys(data).forEach((key) => {
        node_model.data[type ? type + "_" + key : key] = data[key];
    });

    if (!edges.length) {
        Object.keys(APM_METRICS).forEach((key) => {
            node_model.data[type ? type + "_" + key : key] = APM_METRICS[key];
        });
    }

    node_model.sort_value = (node_model.data?.in_total || 0) + (node_model.data?.external_in_total || 0);

    if (node_model.statusType === 'external' && !type) {
        node_model.data.children = children_nodes.sort(
            (a, b) => b.data[node_model._children_sort_key] - a.data[node_model._children_sort_key]
        );
        node_model.data.center_number = node_model.data.children.length;
        node_model.data.header_number = node_model.data.children.length;
    }
}

/**
 * 过滤节点数据（获取与指定节点相关的所有节点和边）
 */
export function filterSelfNodeData(data, node) {
    data = JSON.parse(JSON.stringify(data));

    const nodesMap = new Map();
    for (let n of data.g6_nodes) {
        nodesMap.set(n.id, n);
    }

    node = nodesMap.get(node.id);

    const edgeMap = new Map();
    for (let edge of data.g6_edges) {
        edgeMap.set(edge.target + "-/-" + edge.source, edge);
    }

    data.edges = data.edges.filter((edge) => {
        return edge.link_type === "app" || edgeMap.has(edge.target + "-/-" + edge.source);
    });

    findNodes(node, data, "all", nodesMap);

    const result = { edges: [], nodes: [] };

    for (let n of data.nodes || []) {
        if (n.show) {
            result.nodes.push(n);
            delete n.show;
        }
    }

    for (let edge of data.edges) {
        if (edge.show) {
            result.edges.push(edge);
            delete edge.show;
        }
    }
    return result;
}

function findNodes(node, data, post_type, nodesMap) {
    node.show = true;

    if (post_type === "in" || post_type === "all") {
        const in_edges = data.edges.filter((r) => node.id === r.target);
        for (let edge of in_edges) {
            edge.show = true;
            const n = nodesMap.get(edge.source);
            if (n && !n.show) findNodes(n, data, post_type, nodesMap);
        }
    }

    if (post_type === "out" || post_type === "all") {
        const out_edges = data.edges.filter((r) => node.id === r.source);
        for (let edge of out_edges) {
            edge.show = true;
            const n = nodesMap.get(edge.target);
            if (n && !n.show) findNodes(n, data, post_type, nodesMap);
        }
    }
}

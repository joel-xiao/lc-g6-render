/**
 * 图数据操作相关方法
 */
import { getShape } from '../shapes/items/index';
import { joinDataMapKey } from '../utils/common';
import { calcNodeModelData } from '../data/format.js';

/**
 * 基于中心节点计算 BFS 深度
 */
export function calcBfsDepth(graph, data) {
    const centerNodes = graph.vmOption?.centerNodes || [];
    if (!centerNodes.length || !data.nodes?.length) return;

    const centerId = centerNodes[0];
    const nodeMap = new Map();
    const outEdgesMap = new Map();
    const inEdgesMap = new Map();

    // 创建节点映射
    data.nodes.forEach(node => {
        nodeMap.set(node.id, node);
        if (node.node_depth === undefined) {
            node.node_depth = undefined;
            node.chain_depth = undefined;
        }
    });

    // 创建边映射
    (data.edges || []).forEach(edge => {
        if (!outEdgesMap.has(edge.source)) outEdgesMap.set(edge.source, []);
        if (!inEdgesMap.has(edge.target)) inEdgesMap.set(edge.target, []);
        outEdgesMap.get(edge.source).push({ target: edge.target });
        inEdgesMap.get(edge.target).push({ source: edge.source });
    });

    // 设置中心节点
    const centerNode = nodeMap.get(centerId);
    if (centerNode) {
        centerNode.node_depth = 0;
        centerNode.chain_depth = 0;
    }

    // BFS 计算调出层（depth > 0）
    bfsTraverse(centerId, outEdgesMap, nodeMap, 'target', 1);
    
    // BFS 计算调入层（depth < 0）
    bfsTraverse(centerId, inEdgesMap, nodeMap, 'source', -1);

    // 确保所有节点都有深度
    data.nodes.forEach(node => {
        if (node.node_depth === undefined) {
            node.node_depth = 0;
            node.chain_depth = 0;
        }
    });

    // 更新边的 edge_depth
    (data.edges || []).forEach(edge => {
        const targetNode = nodeMap.get(edge.target);
        if (targetNode && edge.edge_depth === undefined) {
            edge.edge_depth = targetNode.node_depth;
        }
    });
}

function bfsTraverse(startId, edgesMap, nodeMap, nodeKey, direction) {
    const queue = [{ id: startId, depth: 0 }];
    const visited = new Set([startId]);

    while (queue.length > 0) {
        const { id, depth } = queue.shift();
        const edges = edgesMap.get(id) || [];

        edges.forEach(edge => {
            const nextId = edge[nodeKey];
            if (!visited.has(nextId)) {
                visited.add(nextId);
                const nextNode = nodeMap.get(nextId);
                if (nextNode) {
                    const newDepth = depth + direction;
                    if (nextNode.node_depth === undefined) {
                        nextNode.node_depth = newDepth;
                        nextNode.chain_depth = newDepth;
                    }
                    queue.push({ id: nextId, depth: newDepth });
                }
            }
        });
    }
}

/**
 * 通用的添加数据方法
 * @param {G6Graph} graph - G6Graph 实例
 * @param {Object} options - 配置项
 * @param {Event} options.e - 触发事件（可选）
 * @param {string} options.node_edge_type - 边类型 (in-edges/out-edges)
 * @param {Object} options.model - 节点模型
 * @param {Object} data - 要添加的数据 { nodes, edges }
 * @param {Function} cb - 冲突处理回调
 */
export function addGraphData(graph, { e, node_edge_type, model }, data, cb) {
    const g6 = graph.g6_graph;

    // 1. 布局新边
    graph.layoutEdges(data.edges, data.nodes);

    // 2. 添加节点
    data.nodes.forEach(node => {
        const existingItem = g6.find('node', item => item.getModel().id === node.id);
        if (existingItem) {
            node.conflicting = true;
            cb?.('conflict-node', existingItem, node) || graph.mergeModel(existingItem, node);
        } else {
            graph.addItem('node', node);
        }
    });

    // 3. 添加边
    data.edges.forEach(edge => {
        const existingItem = g6.find('edge', item => {
            const m = item.getModel();
            return m.target === edge.target && m.source === edge.source;
        });
        if (existingItem) {
            edge.conflicting = true;
            cb?.('conflict-edge', existingItem, edge) || graph.mergeModel(existingItem, edge);
        } else {
            graph.addItem('edge', edge);
            calcNodeModelData(edge, g6, graph.vmOption.utils, graph);
            setTimeout(() => {
                const edgeItem = g6.findById(edge.id);
                if (edgeItem) graph.updateItem(edgeItem, edge);
            });
        }
    });

    // 4. 重新计算布局
    graph.layoutQuadraticEdges();
    g6.layout();

    // 5. 缓存展开数据（用于收起时删除）
    model = e?.item?.getModel() || model;
    if (model) {
        node_edge_type = e?.target?.get('node-edge-type') || node_edge_type;
        
        // 处理双向边情况
        if (model.duplex_edge_type === 'out-edges') {
            node_edge_type = getShape('arrow').getCfg(model, 'bottom').base_data['node-edge-type'];
        } else if (model.duplex_edge_type === 'in-edges') {
            node_edge_type = getShape('arrow').getCfg(model, 'top').base_data['node-edge-type'];
        }

        graph.mapData.set(joinDataMapKey(node_edge_type, model.id), data);
    }
}

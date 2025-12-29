import { cloneDeep } from "lodash";

export function getJoinId(data, item) {
  data.props = Array.from(new Set(data.props || data.prop)).filter((r) => r);
  return (
    data.props
      .map((prop) => item[prop])
      .filter((r) => r)
      .join("-") || "id_undefined"
  );
}

export function mergeModel(
  itemModel,
  model,
  change = "addition",
  option,
  utils,
  g6_example,
) {
  delete model.conflicting;
  for (let key of Object.keys(model.data)) {
    itemModel.data[key] = model.data[key] || itemModel.data[key];
  }

  utils?.calcNodeStatus?.(itemModel);

  const g6_graph = g6_example?.g6_graph;
  if (g6_graph) {
    g6_example.updateItemState(g6_graph.findById(itemModel.id));
  }

  utils?.calcNodeStatus?.(itemModel);
  return itemModel;
}

export function calcNodeModelData(itemModel, g6_graph, utils, g6_example) {
  const is_edge = itemModel.id.startsWith("edge-");

  if (is_edge) {
    for (let node of [
      g6_graph.findById(itemModel.target),
      g6_graph.findById(itemModel.source),
    ]) {
      if (!node) continue;

      const in_edges = node.getInEdges();
      const out_edges = node.getOutEdges();

      const node_model = node.getModel();
      if (node_model.node_self_stats === true) {
        if (!node_model.node_self_data)
          node_model.node_self_data = cloneDeep(itemModel.data);

        if (!in_edges.length && !out_edges.length) {
          node_model.data = cloneDeep(node_model.node_self_data);
          utils?.calcNodeStatus?.(node_model);
          g6_example.updateItemState(node);
          continue; // 自身节点的统计数据不需要进行合并统计
        }
      }

      scaleData(node_model, in_edges);
      scaleData(node_model, out_edges, "out");
      utils?.calcNodeStatus?.(node_model);
      g6_example.updateItemState(node);
    }
  } else {
    const node = g6_graph.findById(itemModel.id);
    if (!node) return;

    const in_edges = node.getInEdges();
    const out_edges = node.getOutEdges();
    const node_model = node.getModel();
    if (node_model.node_self_stats === true) {
      if (!node_model.node_self_data)
        node_model.node_self_data = cloneDeep(itemModel.data);

      if (!in_edges.length && !out_edges.length) {
        node_model.data = cloneDeep(node_model.node_self_data);
        utils?.calcNodeStatus?.(node_model);
        g6_example.updateItemState(node);
        return; // 自身节点的统计数据不需要进行合并统计
      }
    }

    scaleData(node_model, in_edges);
    scaleData(node_model, out_edges, "out");
    utils?.calcNodeStatus?.(node_model);
    g6_example.updateItemState(node);
  }

  function scaleData(node_model, edges, type = "") {
    const normalData = {
      total: 0,
      dur: 0,
      questions: 0,
      slow: 0,
      frustrated: 0,
      err: 0,
      fail: 0,
      exception: 0,
    };

    const children_nodes = [];

    const edgeMap = {};

    const data = edges.reduce(
      (prev, item) => {
        const item_model = item.getModel();

        if (edgeMap[item_model.target + '-/-' + item_model.source]) return prev;
        edgeMap[item_model.target + '-/-' + item_model.source] = true;

        Object.keys(normalData).forEach((key) => {
          if (typeof item_model?.data?.[key] === "number") {
            if (!prev[key]) prev[key] = 0;
            prev[key] += item_model.data[key];
          }
        });

        // 外部服务的数据计算逻辑
        if (node_model.statusType === 'external') {
          for (let child_link of (item_model.children || [])) {
            const target_nodes = child_link.data.target_nodes || [];
            for (let node of target_nodes) {
              const find_node = children_nodes.find( c_node => c_node.id === node.id);
              if (find_node) {
                Object.keys(normalData).forEach((key) => {
                  find_node.data[key] = find_node.data[key] || 0;
                  find_node.data[key] += (child_link.data[key] || 0);
                });
              } else {
                node = cloneDeep(node);

                Object.keys(normalData).forEach((key) => {
                  node.data[key] = node.data[key] || 0;
                  node.data[key] += (child_link.data[key] || 0);
                });
                children_nodes.push(node);
              }
            }
          }
        }

        return prev;
      },
      { ...normalData },
    );

    Object.keys(data).forEach((key) => {
      node_model.data[type ? type + "_" + key : key] = data[key];
    });

    if (!edges.length) {
      Object.keys(normalData).forEach((key) => {
        node_model.data[type ? type + "_" + key : key] = normalData[key];
      });
    }

    node_model.sort_value = (node_model.data?.in_total || 0) + (node_model.data?.external_in_total || 0);

     // 外部服务的数据计算逻辑 !type === 调入
    if (node_model.statusType === 'external' && !type) {
      node_model.data.children = children_nodes.sort((a, b) => b.data[node_model._children_sort_key] - a.data[node_model._children_sort_key]);
      node_model.data.center_number = node_model.data.children.length;
      node_model.data.header_number = node_model.data.children.length;
    }
  }
}

function getNodeProps(data, item) {
  const result = {
    domain: item.domain,
  };
  data.props.forEach((prop) => {
    result[prop] = item[prop];
  });

  return result;
}

export function toG6Data(data, option) {
  data.props = Array.from(new Set(data.props || data.prop)).filter((r) => r);
  const result = { nodes: [], edges: [], combos: [] };

  const topologyMap = new Map();

  data?.nodes?.forEach((node, idx) => {
    const item = {
      shape: node.shape,
      showIcon: node.showIcon,
      title: node.title || node.app_name,
      id: getJoinId(data, node),
      props: getNodeProps(data, node),
      statusType: node.statusType,
      data: node.data,
      edges_number: node.edges_number,
      is_terminal: node.is_terminal,
      is_external: node.is_external,
      is_user: node.is_user,
      is_deleted: node.is_deleted,
      is_been_moved_to_other: node.is_been_moved_to_other,
      is_permission: node.is_permission,
      node_type: node.node_type,
      icon: node.icon,
      service_type: node.service_type,
      disabled_collapse: node.disabled_collapse,
      node_depth: node.depth,
      chain_depth: node.chain_depth,
      node_self_stats: node.node_self_stats, // 是否是自身节点的统计数据
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
    if (node.is_user) item.statusType = "user";
    if (node.is_deleted) item.statusType = "disabled";
    if (node.is_been_moved_to_other) item.statusType = "moved";
  
    // 是否为客户端
    const service_types = [10, 20, 30];
    if (service_types.some( service_type => service_type == node.service_type)) item.is_client = true;

    result.nodes.push(item);
  });

  data?.links?.forEach((link, idx) => {
    const item = {
      target: getJoinId(data, link.to),
      source: getJoinId(data, link.from),
      target_props: link.to,
      source_props: link.from,
      link_type: link.link_type,
      data: link.data,
      edge_depth: link.depth,
      is_not_link: link.is_not_link,
      is_external: link.is_external,
      is_user: link.is_user,
      is_deleted: link.is_deleted,
      is_been_moved_to_other: link.is_been_moved_to_other,
      is_permission: link.is_permission,
      type: link.type,
      comboId: link.comboId,
    };

    if (link.style) item.style = link.style;

    if (option && option.loop_link === false && item.target === item.source) {
      return;
    }

    if (item.target === item.source) {
      item.type = "loop-circle-run";
      item.loopCfg = {
        position: "top",
        dist: 60,
        clockwise: true,
      };
    }
    result.edges.push(item);
  });

  data?.combos?.forEach((node, idx) => {
    const item = {
      shape: node.shape,
      showIcon: node.showIcon,
      title: node.label || node.app_name || "--",
      id: getJoinId(data, node),
      props: getNodeProps(data, node),
      statusType: node.statusType,
      data: node.data,
      show_collapsed: node.show_collapsed,
      collapsed: node.collapsed,
      statusType: node.statusType,
      is_terminal: node.is_terminal,
      is_external: node.is_external,
      is_user: node.is_user,
      is_deleted: node.is_deleted,
      is_been_moved_to_other: node.is_been_moved_to_other,
      is_permission: node.is_permission,
      node_type: node.node_type,
      icon: node.icon,
      service_type: node.service_type,
      disabled_collapse: node.disabled_collapse,
      combo: true,
      node_depth: node.depth,
      chain_depth: node.chain_depth,
      node_self_stats: node.node_self_stats, // 是否是自身节点的统计数据
      "event-enter-disabled": node["event-enter-disabled"],
    };
    if (node.width) item.width = node.width;
    if (node.x !== undefined) item.x = node.x;
    if (node.y !== undefined) item.y = node.y;
    if (node.center) item.center = node.center;
    if (node.fill) item.fill = node.fill;
    if (node.stroke) item.stroke = node.stroke;
    if (node.header) item.header = node.header;
    if (node.is_user) item.statusType = "user";
    if (node.is_deleted) item.statusType = "disabled";
    if (node.is_been_moved_to_other) item.statusType = "moved";

    result.combos.push(item);
  });

  // result.combos = [
  //   { id: 'combo1', label: '应用系统应用系统应用系统应用系统应用系统应用系统应用系统', show_collapsed: true, collapsed: true, statusType: 'normal', center: {show: true, text: '应用'}, data: {center_number: '10'} },
  //   { id: 'combo2', label: '应用系统', collapsed: false, statusType: 'normal', center: {show: true, text: '应用'}, data: {center_number: '10'} },
  // ]
  calcExternalNodes(result, option);
  //return Object.freeze(result);
  return result;
}

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
    if (node.is_external) {
      // is_external
      const filter_edges = data.edges.filter((edge) => edge.target.startsWith(nodeId));
      edges.push(...filter_edges);
      data.edges = data.edges.filter(
        (edge) =>
          !filter_edges.some(
            (filter_edge) =>
              filter_edge.source === edge.source &&
              filter_edge.target === edge.target,
          ),
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
    nodes.sort((a, b) => b.data[children_sort_key] - a.data[children_sort_key]),
  );
  newNode.statusType = "external";
  newNode.center = {
    showIcon: true,
  };

  edges.forEach((edge) => {
    edge.data.target_nodes = [];
    const find_node = nodes.find((node) => node.id === edge.target);
    if (find_node) edge.data.target_nodes.push(cloneDeep(find_node));

    edge.target = nodeId;
    edge.target_props.appsysid = nodeId;

    const newEdgeIndex = newEdges.findIndex(
      (new_edge) =>
        new_edge.source === edge.source && new_edge.target === edge.target,
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

export function getLayoutData(g6_graph, layout = "sort-depth") {
  const edges = g6_graph.getEdges();
  const combos = g6_graph.getCombos();
  let nodes = g6_graph.getNodes();

  if (layout === "sort-depth") {
    nodes = nodes.sort((a, b) => {
      const a_model = a.getModel();
      const b_model = b.getModel();
      return a_model.node_depth - b_model.node_depth;
    });
  }

  const data = {
    nodes: nodes.map((node) => node.getModel()),
    edges: edges.map((edge) => edge.getModel()),
    combos: combos.map((combo) => combo.getModel()),
  };
  return data;
}

export function calcTopologyDepth(data) {
  [...data.nodes, ...(data.combos || []), ...data.links].forEach((node) => {
    if (Array.isArray(node.depth)) {
      let prev_depth = [];
      let last_depth = [];
      (node.depth || []).forEach((depth) => {
        if (depth <= 0) {
          prev_depth.push(depth);
        } else if (depth > 0) {
          last_depth.push(depth);
        }
      });

      prev_depth = Math.max(...prev_depth);
      last_depth = Math.min(...last_depth);
      node.depth =
        (Math.abs(prev_depth) < Math.abs(last_depth)
          ? prev_depth
          : last_depth) || 0;
    }

    if (Array.isArray(node.chain_depth)) {
      let prev_depth = [];
      let last_depth = [];
      (node.chain_depth || []).forEach((depth) => {
        if (depth <= 0) {
          prev_depth.push(depth);
        } else if (depth > 0) {
          last_depth.push(depth);
        }
      });

      prev_depth = Math.min(...prev_depth);
      last_depth = Math.max(...last_depth);
      node.chain_depth =
        (Math.abs(prev_depth) < Math.abs(last_depth)
          ? prev_depth
          : last_depth) || 0;
    }
  });

}

export const filterSelfNodeData = function (data, node) {
  data = JSON.parse(JSON.stringify(data));

  const nodesMap = new Map();
  for (let node of data.g6_nodes) {
    nodesMap.set(node.id, node);
  }

  node = nodesMap.get(node.id);

  const edgeMap = new Map();
  for (let edge of data.g6_edges) {
    edgeMap.set(edge.target + "-/-" + edge.source, edge);
  }

  data.edges = data.edges.filter((edge) => {
    return edge.link_type === "app"
      ? true
      : edgeMap.has(edge.target + "-/-" + edge.source);
  });
  
  findNodes(node, data, "all", nodesMap);
  // findNodes(node, data, "in", nodesMap);
  // findNodes(node, data, "out", nodesMap);

  const result = {
    edges: [],
    nodes: [],
  };

  for (let node of data.nodes || []) {
    if (node.show) {
      result.nodes.push(node);
      delete node.show;
    }
  }

  for (let edge of data.edges) {
    if (edge.show) {
      result.edges.push(edge);
      delete edge.show;
    }
  }
  return result;
};

function findNodes(node, data, post_type, nodesMap, recursion = 0) {
  node.show = true;

  let in_edges = [];
  if (post_type === "in" || post_type === "all") {
    in_edges = data.edges.filter((r) => node.id === r.target);
  }

  for (let edge of in_edges) {
    edge.show = true;
    const node = nodesMap.get(edge.source);
    if (node && node.show) continue;
    node && findNodes(node, data, post_type, nodesMap, recursion + 1);
  }

  let out_edges = [];
  if (post_type === "out" || post_type === "all") {
    out_edges = data.edges.filter((r) => node.id === r.source);
  }

  for (let edge of out_edges) {
    edge.show = true;
    const node = nodesMap.get(edge.target);
    if (node && node.show) continue;
    node && findNodes(node, data, post_type, nodesMap, recursion + 1);
  }
}

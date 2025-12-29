import { Storage } from './storage';

export function layoutCombo(nodes, combo, self) {
  const { nodeDepthMap, nodesMap, center_y} = layoutNodes(nodes, combo, undefined, self);
  const { max_width } = layoutNodesOffset(nodeDepthMap, nodesMap, undefined, self);
  // return

  const comboPadding = combo.padding;
  const combo_rect = {
    y: center_y,
    width: max_width,
    height: (nodeDepthMap.size || 1) * self.sep,
    top: 0,
    bottom: 0,
    in_height: Array.from(nodeDepthMap.keys()).filter( depth => depth < 0).length * self.sep,
    out_height: Array.from(nodeDepthMap.keys()).filter( depth => depth > 0).length * self.sep,
    nodes: nodes.filter(node => node.comboId === combo.id),
    padding: comboPadding,
    combo
  }

  combo_rect.top = combo_rect.y - combo_rect.in_height - comboPadding[0];
  combo_rect.bottom = combo_rect.y + combo_rect.out_height + comboPadding[2];

  if (combo?.collapsed) {
    combo_rect.width = self.sep;
    combo_rect.height = self.sep;
  }
  combo.x = 0;
  combo.y = 0;

  selfFn();
  function selfFn() {
    const { nodeDepthMap, nodesMap} = layoutNodes(nodes, undefined, combo_rect, self);
    layoutNodesOffset(nodeDepthMap, nodesMap, combo_rect, self);
  }
}

export function layoutGridCombo(nodes, combo, self) {
  const { center_y, height, width } = gridNodes(nodes, combo, self);

  const comboPadding = combo.padding;
  const combo_rect = {
    y: center_y,
    width: width,
    height: height,
    top: 0,
    bottom: 0,
    in_height: height / 2,
    out_height: height / 2,
    nodes: nodes.filter(node => node.comboId === combo.id),
    padding: comboPadding,
    combo
  }

  combo.combo_rect = combo_rect;
  
  combo_rect.top = combo_rect.y - combo_rect.in_height - comboPadding[0];
  combo_rect.bottom = combo_rect.y + combo_rect.out_height + comboPadding[2];

  if (combo?.collapsed) {
    combo_rect.width = self.sep;
    combo_rect.height = self.sep;
  }

  combo.x = 0;
  combo.y = 0;

  selfFn();
  function selfFn() {
    const { nodeDepthMap, nodesMap} = layoutNodes(nodes, undefined, combo_rect, self);
    layoutNodesOffset(nodeDepthMap, nodesMap, combo_rect, self);
  }
}

export function layoutNodes(nodes, combo, combo_rect, self) {
  const nodeDepthMap = new Map();
  const nodesMap = new Map();
  let center_y = 0;
  for (const node of nodes) {
    if (combo && combo.id !== node.comboId) continue;
    if (!combo && node.comboId) continue;

    const id = node.node_depth + '';
    let node_depth_sum = nodeDepthMap.get(id) || 0;
    nodeDepthMap.set(id, node_depth_sum + 1);
    
    if (!nodesMap.has(id)) nodesMap.set(id, []);
    const depth_nodes = nodesMap.get(id);
    depth_nodes.push(node);
    nodesMap.set(id, depth_nodes);

    if (combo) {
      node.y = node.node_depth * self.sep;
      node.x = node_depth_sum * self.sep;

      if (node.node_depth === 0) {
        center_y = node.y;
      }
    } else if (combo_rect) {
      node.y = node.node_depth < 0 ? combo_rect.top + node.node_depth * self.sep : combo_rect.bottom + node.node_depth * self.sep;
      node.x = node_depth_sum * self.sep;
    } else {
      node.y = node.node_depth * self.sep;
      node.x = node_depth_sum * self.sep;
    }
  }

  return {
    center_y,
    nodeDepthMap,
    nodesMap
  }
}

export function gridNodes(nodes, combo, self) {
  const max_width = self.width * 0.7;
  nodes = nodes.filter(node => node.comboId === combo.id);

  // 优先排列有edges的节点, 然后再根据调入数排列
  const storage = new Storage();
  const storage_name = "lc-g6.layout.grid-sort-nodes";
  const caching_nodes = storage.get(storage_name);

  if (caching_nodes) {
    const nodesMap = {};
    for (const node of caching_nodes) {
      nodesMap[node.id] = node.sort_idx;
    }
    let first_nodes = nodes.filter( node => node.edges_number >= 1).sort((a, b) => (b.edges_number - a.edges_number)); 
    let middle_nodes = nodes.filter( node => node.edges_number == 0.5).sort((a, b) => ((nodesMap[a.id] || 0) - (nodesMap[b.id] || 0))); 
    let last_nodes = nodes.filter( node => !node.edges_number).sort((a, b) => ((nodesMap[a.id] || 0) - (nodesMap[b.id] || 0))); 
    nodes = first_nodes.concat(middle_nodes).concat(last_nodes);
  } else {
    nodes = nodes.sort((a, b) => (b.edges_number - a.edges_number)); 
  }

  storage.set(storage_name, nodes.map((node, idx) => ({id: node.id, sort_idx: idx})));


  let y_start = 0;
  let x_start = 0;
  let node_y_len = 0;
  let node_x_len = 0;

  nodes.forEach((n, idx) => {
    let current_x = x_start + (idx > 0 ? idx - node_x_len : idx) * self.sep;
    if (current_x > max_width) {
      node_x_len = idx;
      node_y_len += 1;
      current_x = x_start + (idx - node_x_len) * self.sep;
    }

    let current_y = y_start + node_y_len * self.sep;
    n.y = current_y;
    n.x = current_x;
  });

  const min_x = x_start;
  const max_x = Math.max(...nodes.map(n => n.x), 0);
  const min_y = y_start;
  const max_y = Math.max(...nodes.map(n => n.y), 0);
  const height = max_y - min_y;
  const width = max_x - min_x + self.sep;
  const center_y = height / 2;

  return {
    center_y,
    width,
    height,
  }
}

export function layoutNodesOffset(nodeDepthMap, nodesMap, combo_rect, self) {
  const widths = [self.sep, ...Array.from(nodeDepthMap.entries()).map(([depth, curr_depth_sum]) => curr_depth_sum * self.sep)];
  if (combo_rect) widths.push(combo_rect.width);
  const max_width = Math.max(...widths);

  for (const [depth, curr_depth_sum] of nodeDepthMap.entries()) {
    const curr_w = (curr_depth_sum * self.sep);
    const offset = (max_width - curr_w) / 2;

    const depth_nodes = nodesMap.get(depth);
    for (const node of depth_nodes) {
      node.x = node.x + offset;
    }
  }

  if (combo_rect) {
    const offset = (max_width - combo_rect.width) / 2;
    combo_rect.combo.x = offset;
    combo_rect.nodes.forEach(node => {  
      node.x = node.x + offset;
    });
  }

  return {
    max_width,
  }
}

export function layoutEdges(edges, nodes) {
  for (const edge of edges) {
    const source = nodes.find(node => node.id === edge.source);
    const target = nodes.find(node => node.id === edge.target);

    // 横向排列时，如果发现edge的source和target的node_depth相同，且type为cubic-v-circle-run，则将type改为cubic-h-circle-run
    if (source?.node_depth === target?.node_depth && edge.type === 'cubic-v-circle-run') {
      edge.type = 'cubic-h-circle-run';
    }
  }
}

export function layoutQuadraticEdges(graph, edges, nodes, layout) {
  for (const edge of edges) {
    const source = nodes.find(node => node.id === edge.source);
    const target = nodes.find(node => node.id === edge.target);
    if (!source || !target) continue;

    delete edge.controlPoints;

    setTimeout(() => {
      try {
        graph.findById(edge.id)?.update({type: edge.type});
      } catch (e) {}
    }, 100);

    // type === 'custom-combo' 为自定义combo
    if (source.type === 'custom-combo' || target.type === 'custom-combo') continue;

    // 如果source和target的comboId不一致，则跳过
    if ((source.comboId && !target.comboId) || (!source.comboId && target.comboId)) continue;

    const find_edge = edges.find( item => edge.target === item.source && edge.source === item.target);

    // 如果source和target的y相同，且x相差大于1.5倍的sep，则将type改为quadratic-circle-run
    let sep = 0;
    
    if (!source.comboId && !target.comboId && layout.outerLayout) {
      sep = layout.outerLayout.nodesep + layout.outerLayout.ranksep;
    } else {
      sep = graph.cfg.layout.nodesep + graph.cfg.layout.ranksep;
    }

    if ((source.comboId && target.comboId) && layout.innerLayout) {
      sep = layout.innerLayout.nodeSize;
    }

    const is_x_reverse = source.x > target.x;
    const offset_x = Math.abs(is_x_reverse ? source.x - target.x : target.x - source.x);
    const is_y_reverse = source.y > target.y;
    const offset_y = Math.abs( is_y_reverse ? source.y - target.y : target.y - source.y);
    const gap = 12;
    if (source.y === target.y &&  offset_x > sep * 1.5) {
      edge.type = 'quadratic-circle-run';

      const reverse_offset_x = is_x_reverse ? -offset_x : offset_x;
      edge.controlPoints = find_edge?.controlPoints || [{ x: source.x + reverse_offset_x / 2 , y: source.y + (parseInt((reverse_offset_x / sep - 1)) * gap)}];
    } else if (source.x === target.x && offset_y > sep * 1.5) {
      edge.type = 'quadratic-circle-run';
      
      const reverse_offset_y = is_y_reverse ? -offset_y : offset_y;
      edge.controlPoints = find_edge?.controlPoints || [{ x: source.x + (parseInt((reverse_offset_y / sep - 1)) * gap), y: source.y + reverse_offset_y / 2 }];
    }

    setTimeout(() => {
      try {
        graph.findById(edge.id)?.update({type: edge.type});
      } catch (e) {}
    }, 100);
  }
}

/**
 * Demo Mock 数据生成工具
 * 用于演示拓扑图的各种节点状态和交互功能
 */

// 判断节点是否禁用展开收起
export function getNodeDisabledCollapse(node) {
  return (
    node.is_user ||
    node.is_external ||
    node.is_deleted ||
    node.node_type === "app" ||
    !!node.comboId
  );
}

// 生成系统拓扑 Mock 数据
export function getMockSysTopoData(sysId) {
  const centerNodeId = `${sysId}-`;

  const nodes = [
    // 调出节点
    { id: "sys-level1-out-1-", title: "调出系统1", type: "node-icon", node_type: "sys", statusType: "normal", showIcon: true, data: {}, props: { appsysid: "sys-level1-out-1", appid: "" } },
    { id: "sys-level1-out-2-", title: "调出系统2", type: "node-icon", node_type: "sys", statusType: "normal", showIcon: true, data: {}, props: { appsysid: "sys-level1-out-2", appid: "" } },
    // 调入节点
    { id: "sys-level1-in-1-", title: "调入系统1", type: "node-icon", node_type: "sys", statusType: "normal", showIcon: true, data: {}, props: { appsysid: "sys-level1-in-1", appid: "" } },
    { id: "sys-level1-in-2-", title: "调入系统2", type: "node-icon", node_type: "sys", statusType: "normal", showIcon: true, data: {}, props: { appsysid: "sys-level1-in-2", appid: "" } },
    // 各种状态节点
    { id: "sys-warning-", title: "警告系统", type: "node-icon", node_type: "sys", statusType: "warning", showIcon: true, data: {}, props: { appsysid: "sys-warning", appid: "" } },
    { id: "sys-abnormal-", title: "异常系统", type: "node-icon", node_type: "sys", statusType: "abnormal", showIcon: true, data: {}, props: { appsysid: "sys-abnormal", appid: "" } },
    { id: "sys-deleted-", title: "已删除系统", type: "node-icon", node_type: "sys", statusType: "disabled", is_deleted: true, showIcon: true, data: {}, props: { appsysid: "sys-deleted", appid: "" } },
    { id: "EXTERNAL_SERVICE-", title: "外部服务", type: "node-icon", node_type: "sys", statusType: "external", is_external: true, showIcon: true, data: {}, props: { appsysid: "EXTERNAL_SERVICE", appid: "" } },
    { id: "sys-moved-", title: "已移动系统", type: "node-icon", node_type: "sys", statusType: "moved", is_been_moved_to_other: true, showIcon: true, data: {}, props: { appsysid: "sys-moved", appid: "" } },
    { id: "sys-user-", title: "用户", type: "node-icon", node_type: "sys", statusType: "user", is_user: true, showIcon: true, data: {}, props: { appsysid: "sys-user", appid: "" } },
  ];

  const edges = [
    // 调出边
    { source: centerNodeId, target: "sys-level1-out-1-", type: "cubic-v-circle-run", data: {}, source_props: { appsysid: sysId, appid: "" }, target_props: { appsysid: "sys-level1-out-1", appid: "" } },
    { source: centerNodeId, target: "sys-level1-out-2-", type: "cubic-v-circle-run", data: {}, source_props: { appsysid: sysId, appid: "" }, target_props: { appsysid: "sys-level1-out-2", appid: "" } },
    { source: centerNodeId, target: "EXTERNAL_SERVICE-", type: "cubic-v-circle-run", data: {}, source_props: { appsysid: sysId, appid: "" }, target_props: { appsysid: "EXTERNAL_SERVICE", appid: "" } },
    { source: centerNodeId, target: "sys-warning-", type: "cubic-v-circle-run", data: {}, source_props: { appsysid: sysId, appid: "" }, target_props: { appsysid: "sys-warning", appid: "" } },
    { source: centerNodeId, target: "sys-abnormal-", type: "cubic-v-circle-run", data: {}, source_props: { appsysid: sysId, appid: "" }, target_props: { appsysid: "sys-abnormal", appid: "" } },
    { source: centerNodeId, target: "sys-deleted-", type: "cubic-v-circle-run", data: {}, source_props: { appsysid: sysId, appid: "" }, target_props: { appsysid: "sys-deleted", appid: "" } },
    { source: centerNodeId, target: "sys-moved-", type: "cubic-v-circle-run", data: {}, source_props: { appsysid: sysId, appid: "" }, target_props: { appsysid: "sys-moved", appid: "" } },
    // 调入边
    { source: "sys-level1-in-1-", target: centerNodeId, type: "cubic-v-circle-run", data: {}, source_props: { appsysid: "sys-level1-in-1", appid: "" }, target_props: { appsysid: sysId, appid: "" } },
    { source: "sys-level1-in-2-", target: centerNodeId, type: "cubic-v-circle-run", data: {}, source_props: { appsysid: "sys-level1-in-2", appid: "" }, target_props: { appsysid: sysId, appid: "" } },
    { source: "sys-user-", target: centerNodeId, type: "cubic-v-circle-run", data: {}, source_props: { appsysid: "sys-user", appid: "" }, target_props: { appsysid: sysId, appid: "" } },
  ];

  const combos = [{
    id: centerNodeId,
    title: "Demo System",
    combo: true,
    type: "custom-combo",
    statusType: "normal",
    collapsed: false,
    show_collapsed: true,
    padding: [80, 80, 80, 80],
    style: { fill: '#0099ff07', stroke: '#09F', lineWidth: 2 },
    data: { center_number: 0, app_total: 0 },
    props: { appsysid: sysId, appid: "" },
  }];

  return { nodes, edges, combos };
}

// 生成应用拓扑 Mock 数据
export function getMockAppTopoData(sysId, appId) {
  const comboId = `${sysId}-`;
  const centerAppId = `${sysId}-${appId}`;

  const nodes = [
    { id: centerAppId, title: "中心应用", type: "node-icon", node_type: "app", statusType: "normal", showIcon: true, shape: "circle", comboId, disabled_collapse: true, data: {}, props: { appsysid: sysId, appid: appId }, center: { text: "" }, is_client: true },
    // 调出应用
    { id: `${sysId}-app-level1-out-1`, title: "调出应用1", type: "node-icon", node_type: "app", statusType: "normal", showIcon: true, shape: "circle", comboId, disabled_collapse: true, data: {}, props: { appsysid: sysId, appid: "app-level1-out-1" }, center: { text: "" }, is_client: true },
    { id: `${sysId}-app-level1-out-2`, title: "调出应用2", type: "node-icon", node_type: "app", statusType: "normal", showIcon: true, shape: "circle", comboId, disabled_collapse: true, data: {}, props: { appsysid: sysId, appid: "app-level1-out-2" }, center: { text: "" }, is_client: true },
    // 调入应用
    { id: `${sysId}-app-level1-in-1`, title: "调入应用1", type: "node-icon", node_type: "app", statusType: "normal", showIcon: true, shape: "circle", comboId, disabled_collapse: true, data: {}, props: { appsysid: sysId, appid: "app-level1-in-1" }, center: { text: "" }, is_client: true },
    { id: `${sysId}-app-level1-in-2`, title: "调入应用2", type: "node-icon", node_type: "app", statusType: "normal", showIcon: true, shape: "circle", comboId, disabled_collapse: true, data: {}, props: { appsysid: sysId, appid: "app-level1-in-2" }, center: { text: "" }, is_client: true },
    // 各种状态应用
    { id: `${sysId}-app-warning`, title: "警告应用", type: "node-icon", node_type: "app", statusType: "warning", showIcon: true, shape: "circle", comboId, disabled_collapse: true, data: {}, props: { appsysid: sysId, appid: "app-warning" }, center: { text: "" }, is_client: true },
    { id: `${sysId}-app-abnormal`, title: "异常应用", type: "node-icon", node_type: "app", statusType: "abnormal", showIcon: true, shape: "circle", comboId, disabled_collapse: true, data: {}, props: { appsysid: sysId, appid: "app-abnormal" }, center: { text: "" }, is_client: true },
  ];

  const edges = [
    // 调出边
    { source: centerAppId, target: `${sysId}-app-level1-out-1`, type: "line-circle-run", data: {}, source_props: { appsysid: sysId, appid: appId }, target_props: { appsysid: sysId, appid: "app-level1-out-1" }, comboId, link_type: "app" },
    { source: centerAppId, target: `${sysId}-app-level1-out-2`, type: "line-circle-run", data: {}, source_props: { appsysid: sysId, appid: appId }, target_props: { appsysid: sysId, appid: "app-level1-out-2" }, comboId, link_type: "app" },
    { source: centerAppId, target: `${sysId}-app-warning`, type: "line-circle-run", data: {}, source_props: { appsysid: sysId, appid: appId }, target_props: { appsysid: sysId, appid: "app-warning" }, comboId, link_type: "app" },
    { source: centerAppId, target: `${sysId}-app-abnormal`, type: "line-circle-run", data: {}, source_props: { appsysid: sysId, appid: appId }, target_props: { appsysid: sysId, appid: "app-abnormal" }, comboId, link_type: "app" },
    // 调入边
    { source: `${sysId}-app-level1-in-1`, target: centerAppId, type: "line-circle-run", data: {}, source_props: { appsysid: sysId, appid: "app-level1-in-1" }, target_props: { appsysid: sysId, appid: appId }, comboId, link_type: "app" },
    { source: `${sysId}-app-level1-in-2`, target: centerAppId, type: "line-circle-run", data: {}, source_props: { appsysid: sysId, appid: "app-level1-in-2" }, target_props: { appsysid: sysId, appid: appId }, comboId, link_type: "app" },
  ];

  return { nodes, edges, combos: [], centerAppId };
}

// 生成展开节点时的 Mock 数据
export function getMockExpandData(model, edgeType, depth) {
  const isOut = edgeType === 'out-edges';
  const type = isOut ? 'out' : 'in';
  const count = Math.floor(Math.random() * 2) + 1;
  const newNodes = [];
  const newEdges = [];

  if (model.node_type === 'sys') {
    for (let i = 0; i < count; i++) {
      const newId = `sys-level${depth}-${type}-${i}-`;
      const newNode = {
        id: newId,
        title: `L${depth} ${isOut ? '调出' : '调入'}系统 ${i + 1}`,
        type: "node-icon",
        node_type: "sys",
        statusType: Math.random() > 0.8 ? 'warning' : 'normal',
        showIcon: true,
        data: {},
        props: { appsysid: `sys-level${depth}-${type}-${i}`, appid: "" },
        node_depth: isOut ? depth : -depth,
        chain_depth: isOut ? depth : -depth,
      };
      newNodes.push(newNode);

      newEdges.push({
        source: isOut ? model.id : newId,
        target: isOut ? newId : model.id,
        type: "cubic-v-circle-run",
        edge_depth: newNode.node_depth,
        data: {},
        source_props: isOut ? model.props : newNode.props,
        target_props: isOut ? newNode.props : model.props,
      });
    }
  } else if (model.node_type === 'app') {
    const sysId = model.props?.appsysid;
    const comboId = model.comboId;

    for (let i = 0; i < count; i++) {
      const newId = `${sysId}-app-level${depth}-${type}-${i}`;
      const newNode = {
        id: newId,
        title: `L${depth} ${isOut ? '调出' : '调入'}应用 ${i + 1}`,
        type: "node-icon",
        node_type: "app",
        statusType: Math.random() > 0.8 ? 'warning' : 'normal',
        showIcon: true,
        shape: "circle",
        comboId,
        disabled_collapse: true,
        data: {},
        props: { appsysid: sysId, appid: `app-level${depth}-${type}-${i}` },
        center: { text: "" },
        is_client: true,
        node_depth: isOut ? depth : -depth,
        chain_depth: isOut ? depth : -depth,
      };
      newNodes.push(newNode);

      newEdges.push({
        source: isOut ? model.id : newId,
        target: isOut ? newId : model.id,
        type: "line-circle-run",
        edge_depth: newNode.node_depth,
        data: {},
        source_props: isOut ? model.props : newNode.props,
        target_props: isOut ? newNode.props : model.props,
        comboId,
        link_type: "app",
      });
    }
  }

  return { nodes: newNodes, edges: newEdges, combos: [] };
}

// 生成点击节点时插入的边数据
export function getMockInsertEdges(model, sysId, appId) {
  const comboId = `${sysId}-`;
  const centerAppId = `${sysId}-${appId}`;
  const mockEdges = [];

  if (model.node_type === 'app') {
    // 应用节点：连接到其他应用节点、系统节点、外部系统
    mockEdges.push(
      {
        source: model.id,
        target: `${sysId}-app-level1-out-1`,
        type: "line-circle-run",
        data: {},
        source_props: model.props || {},
        target_props: { appsysid: sysId, appid: "app-level1-out-1" },
        comboId,
        link_type: "app",
      },
      {
        source: model.id,
        target: `${sysId}-app-level1-out-2`,
        type: "line-circle-run",
        data: {},
        source_props: model.props || {},
        target_props: { appsysid: sysId, appid: "app-level1-out-2" },
        comboId,
        link_type: "app",
      },
      {
        source: model.id,
        target: comboId,
        type: "cubic-v-circle-run",
        data: {},
        source_props: model.props || {},
        target_props: { appsysid: sysId, appid: "" },
      },
      {
        source: model.id,
        target: "EXTERNAL_SERVICE-",
        type: "cubic-v-circle-run",
        data: {},
        source_props: model.props || {},
        target_props: { appsysid: "EXTERNAL_SERVICE", appid: "" },
        is_external: true,
      }
    );
  } else if (model.node_type === 'sys') {
    // 系统节点：连接到其他系统节点、应用节点、外部系统
    mockEdges.push(
      {
        source: model.id,
        target: "sys-level1-out-1-",
        type: "cubic-v-circle-run",
        data: {},
        source_props: model.props || {},
        target_props: { appsysid: "sys-level1-out-1", appid: "" },
      },
      {
        source: model.id,
        target: "sys-level1-in-1-",
        type: "cubic-v-circle-run",
        data: {},
        source_props: model.props || {},
        target_props: { appsysid: "sys-level1-in-1", appid: "" },
      },
      {
        source: model.id,
        target: centerAppId,
        type: "cubic-v-circle-run",
        data: {},
        source_props: model.props || {},
        target_props: { appsysid: sysId, appid: appId },
        comboId,
        link_type: "app",
      },
      {
        source: model.id,
        target: "EXTERNAL_SERVICE-",
        type: "cubic-v-circle-run",
        data: {},
        source_props: model.props || {},
        target_props: { appsysid: "EXTERNAL_SERVICE", appid: "" },
        is_external: true,
      }
    );
  }

  return mockEdges;
}

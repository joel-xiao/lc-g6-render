/**
 * Demo Mock 数据生成工具
 * 用于演示拓扑图的各种节点状态和交互功能
 */

// 禁用展开收起的 statusType 列表
const DISABLED_COLLAPSE_STATUS_TYPES = ['user', 'external', 'disabled'];

// 判断节点是否禁用展开收起
export function getNodeDisabledCollapse(node) {
  return (
    DISABLED_COLLAPSE_STATUS_TYPES.includes(node.statusType) ||
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
    { id: "sys-deleted-", title: "已删除系统", type: "node-icon", node_type: "sys", statusType: "disabled", showIcon: true, data: {}, props: { appsysid: "sys-deleted", appid: "" } },
    { id: "EXTERNAL_SERVICE-", title: "外部服务", type: "node-icon", node_type: "sys", statusType: "external", showIcon: true, data: {}, props: { appsysid: "EXTERNAL_SERVICE", appid: "" } },
    { id: "sys-moved-", title: "已移动系统", type: "node-icon", node_type: "sys", statusType: "moved", showIcon: true, data: {}, props: { appsysid: "sys-moved", appid: "" } },
    { id: "sys-user-", title: "用户", type: "node-icon", node_type: "sys", statusType: "user", showIcon: true, data: {}, props: { appsysid: "sys-user", appid: "" } },
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
      }
    );
  }

  return mockEdges;
}

/**
 * 功能展示 Demo 数据
 * 展示组件库支持的各种节点装饰与状态
 */
export function getFeaturesDemoData() {
  const nodes = [
    // 1. 节点类型和形状
    { id: 'node-type-app', label: 'app', title: 'app', desc: '节点类型: app, 形状: 圆形', type: 'node-icon', node_type: 'app', shape: 'ellipse', statusType: 'normal', showIcon: true, icon: '/g6-icons/server-normal.svg', comboId: 'group-basic', disabled_collapse: true, data: { status: 'normal' } },
    { id: 'shape-hexagonal', label: '六边形', title: '六边形', desc: '节点类型: sys, 形状: 六边形', type: 'node-icon', node_type: 'sys', shape: 'hexagonal-polygon', statusType: 'normal', showIcon: true, icon: '/g6-icons/server2-normal.svg', comboId: 'group-basic', disabled_collapse: true, data: { status: 'normal' } },
    
    // 2. 状态类型
    { id: 'status-normal', label: '正常', title: '正常', desc: 'statusType: normal (绿色光环)', type: 'node-icon', statusType: 'normal', node_type: 'server', showIcon: true, comboId: 'group-status', disabled_collapse: true, data: { status: 'normal' } },
    { id: 'status-warning', label: '警告', title: '警告', desc: 'statusType: warning (黄色光环)', type: 'node-icon', statusType: 'warning', node_type: 'server', showIcon: true, comboId: 'group-status', disabled_collapse: true, data: { status: 'warning' } },
    { id: 'status-abnormal', label: '异常', title: '异常', desc: 'statusType: abnormal (红色光环)', type: 'node-icon', statusType: 'abnormal', node_type: 'server', showIcon: true, comboId: 'group-status', disabled_collapse: true, data: { status: 'error' } },
    { id: 'status-special', label: '特殊状态', title: '特殊状态', desc: 'statusType: disabled', type: 'node-icon', statusType: 'disabled', node_type: 'app', showIcon: true, icon: '/g6-icons/deleted.svg', comboId: 'group-status', disabled_collapse: true, data: { status: 'normal' } },
    { id: 'status-moved', label: '已移动', title: '已移动', desc: 'statusType: moved', type: 'node-icon', statusType: 'moved', node_type: 'app', showIcon: true, icon: '/g6-icons/moved.svg', comboId: 'group-status', disabled_collapse: true, data: { status: 'normal' } },
    
    // 3. 角标展示
    { id: 'badges-both', label: '双角标', title: '双角标', desc: '右上角标: 99, 右下角标: 5', type: 'node-icon', node_type: 'app', statusType: 'normal', showIcon: true, icon: '/g6-icons/server-normal.svg', disabled_collapse: true, data: { status: 'normal', right_top_number: 99, right_bottom_number: 5 }, rightTop: { show: true }, rightBottom: { show: true } },
    
    // 4. 中心内容
    { id: 'center-all', label: '中心内容', title: '中心内容', desc: '中心数字: 10, 文字: CORE', type: 'node-icon', node_type: 'server', statusType: 'normal', showIcon: false, disabled_collapse: true, data: { status: 'normal', center_number: 10 }, center: { show: true, showIcon: true, text: 'CORE' } },
    
    // 5. 图标类型
    { id: 'icon-web', label: 'Web', title: 'Web图标', desc: 'icon: web-normal.svg', type: 'node-icon', node_type: 'app', statusType: 'normal', icon: '/g6-icons/web-normal.svg', showIcon: true, comboId: 'group-icons', disabled_collapse: true, data: { status: 'normal' } },
    { id: 'icon-phone', label: 'Phone', title: 'Phone图标', desc: 'icon: phone-normal.svg', type: 'node-icon', node_type: 'app', statusType: 'normal', icon: '/g6-icons/phone-normal.svg', showIcon: true, comboId: 'group-icons', disabled_collapse: true, data: { status: 'normal' } },
    { id: 'icon-default', label: 'Default', title: 'Default图标', desc: 'icon: server-normal.svg', type: 'node-icon', node_type: 'app', statusType: 'normal', icon: '/g6-icons/server-normal.svg', showIcon: true, disabled_collapse: true, data: { status: 'normal' } },
    { id: 'icon-default2', label: 'Default2', title: 'Default2图标', desc: 'icon: server2-normal.svg', type: 'node-icon', node_type: 'app', statusType: 'normal', icon: '/g6-icons/server2-normal.svg', showIcon: true, disabled_collapse: true, data: { status: 'normal' } },
    { id: 'icon-warning', label: 'Warning', title: 'Warning图标', desc: 'icon: server-warning.svg', type: 'node-icon', node_type: 'app', statusType: 'normal', icon: '/g6-icons/server-warning.svg', showIcon: true, disabled_collapse: true, data: { status: 'normal' } },
    { id: 'icon-abnormal', label: 'Abnormal', title: 'Abnormal图标', desc: 'icon: server-abnormal.svg', type: 'node-icon', node_type: 'app', statusType: 'normal', icon: '/g6-icons/server-abnormal.svg', showIcon: true, disabled_collapse: true, data: { status: 'normal' } },
    
    // 6. Combo 节点组
    { id: 'combo-node-1', label: 'Combo节点1', title: 'Combo节点1', desc: 'comboId: combo-group-1', type: 'node-icon', node_type: 'app', statusType: 'normal', comboId: 'combo-group-1', showIcon: true, icon: '/g6-icons/server-normal.svg', disabled_collapse: true, data: { status: 'normal' } },
    { id: 'combo-node-2', label: 'Combo节点2', title: 'Combo节点2', desc: 'comboId: combo-group-1', type: 'node-icon', node_type: 'app', statusType: 'normal', comboId: 'combo-group-1', showIcon: true, icon: '/g6-icons/server2-normal.svg', disabled_collapse: true, data: { status: 'normal' } }
  ];

  const combos = [
    { id: 'group-basic', title: '基础节点', type: 'custom-combo', statusType: 'normal', collapsed: false, show_collapsed: false, padding: [60, 60, 60, 60], style: { fill: '#0099ff07', stroke: '#09F', lineWidth: 2 } },
    { id: 'group-status', title: '状态类型', type: 'custom-combo', statusType: 'normal', collapsed: false, show_collapsed: false, padding: [60, 60, 60, 60], style: { fill: '#0099ff07', stroke: '#09F', lineWidth: 2 } },
    { id: 'group-icons', title: '图标类型', type: 'custom-combo', statusType: 'normal', collapsed: false, show_collapsed: false, padding: [60, 60, 60, 60], style: { fill: '#0099ff07', stroke: '#09F', lineWidth: 2 } },
    { id: 'combo-group-1', title: 'Combo组', type: 'custom-combo', statusType: 'normal', collapsed: false, show_collapsed: false, padding: [80, 80, 80, 80], style: { fill: '#0099ff07', stroke: '#09F', lineWidth: 2 } },
    { id: 'group-empty', title: '空组', type: 'custom-combo', statusType: 'normal', collapsed: false, show_collapsed: false, padding: [60, 60, 60, 60], style: { fill: '#0099ff07', stroke: '#09F', lineWidth: 2 } }
  ];

  const edges = [
    { id: 'edge-center-1', source: 'node-type-app', target: 'shape-hexagonal', type: 'line-circle-run' },
    { id: 'edge-center-2', source: 'node-type-app', target: 'status-normal', type: 'line-circle-run' },
    { id: 'edge-center-3', source: 'node-type-app', target: 'badges-both', type: 'line-circle-run' },
    { id: 'edge-center-4', source: 'node-type-app', target: 'icon-web', type: 'line-circle-run' },
    { id: 'edge-status-1', source: 'status-normal', target: 'status-warning', type: 'line-circle-run' },
    { id: 'edge-status-2', source: 'status-normal', target: 'status-abnormal', type: 'line-circle-run' },
    { id: 'edge-status-3', source: 'status-warning', target: 'status-special', type: 'line-circle-run' },
    { id: 'edge-status-4', source: 'status-abnormal', target: 'status-moved', type: 'line-circle-run' },
    { id: 'edge-feature-1', source: 'badges-both', target: 'center-all', type: 'line-circle-run' },
    { id: 'edge-icon-1', source: 'icon-web', target: 'icon-phone', type: 'line-circle-run' },
    { id: 'edge-icon-2', source: 'icon-web', target: 'icon-default', type: 'line-circle-run' },
    { id: 'edge-icon-3', source: 'icon-default', target: 'icon-default2', type: 'line-circle-run' },
    { id: 'edge-icon-4', source: 'icon-default', target: 'icon-warning', type: 'line-circle-run' },
    { id: 'edge-icon-5', source: 'icon-warning', target: 'icon-abnormal', type: 'line-circle-run' },
    { id: 'edge-combo-1', source: 'combo-node-1', target: 'combo-node-2', type: 'line-circle-run' },
    { id: 'edge-cross-1', source: 'shape-hexagonal', target: 'status-warning', type: 'line-circle-run' },
    { id: 'edge-cross-2', source: 'center-all', target: 'icon-phone', type: 'line-circle-run' },
    { id: 'edge-cross-3', source: 'icon-abnormal', target: 'combo-node-1', type: 'line-circle-run' },
    { id: 'edge-cross-4', source: 'status-special', target: 'icon-default2', type: 'line-circle-run' }
  ];

  return { nodes, edges, combos };
}

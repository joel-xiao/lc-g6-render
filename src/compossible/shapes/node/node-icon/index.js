import G6 from "@antv/g6";
import { getTooltipStatus, getHealthSetting } from '../../../utils/health';
import { getAnchorPoints } from '../../utils';
import { getComponent } from '../../items';
import defaults from './options';

const NodeIcon = {
    getAnchorPoints: function (...args) {
        // Note: g6_graph is passed as last arg when called from G6 custom node
        // But here args might need to be checked.
        // The original code passed g6_graph from closure.
        // We need to verify how G6 calls this or if we need to pass g6 instance differently.
        // In G6 3.x, getAnchorPoints(cfg) return array.
        // The original code was: getAnchorPoints(...args, g6_graph);
        // We might need to bind this or strict reliance on args.
        const cfg = args[0];
        return getAnchorPoints('center').getNodeAnchorPoints(cfg, this.g6_graph);
    },
    drawShape: function drawShape(cfg, group) {
        const status = getHealthSetting(cfg.statusType) || cfg;
        const shape_type = cfg.shape || 'hexagonal-polygon';

        // Add Halo
        getComponent('state-halo').add(shape_type, { cfg, group, style: status });

        // Main Shape
        const shape = getComponent('main-shape').add(shape_type, { cfg, group, style: status });

        // Icon
        getComponent('node-icon').add({ cfg, group, style: status });

        // Center Number
        getComponent('node-center-group').add(G6, { cfg, group, style: status });

        // Right Top Number
        if (cfg?.rightTop?.show && cfg?.data?.right_top_number) {
            const status = getHealthSetting('abnormal') || cfg;
            getComponent('text-number').add(G6, {
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
            getComponent('text-number').add(G6, {
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
        getComponent('node-title').add(G6, { cfg, group, style: status });

        // Arrow
        getComponent('arrow').add('rect', { cfg, group, style: status, position: 'top' });
        getComponent('arrow').add('rect', { cfg, group, style: status, position: 'bottom' });

        // Node Status
        const nodeStatus = getTooltipStatus(cfg);
        getComponent('node-status').add(G6, { cfg, group, status: nodeStatus });

        return shape;
    },

    afterUpdate(cfg, item) {
        // 注: 使用 updateItem 时，不会触发 afterUpdate 它会重绘制整个节点，并导致节点闪烁
    },

    setState(name, value, item) {
        const model = item.getModel();
        if (name === 'statusType') {
            const status = getHealthSetting(model.statusType) || model;
            getComponent('state-halo').update(item, model, status);
            getComponent('main-shape').update(item, model, status);
            getComponent('node-center-group').update(G6, item, model, status);
            // Icon
            getComponent('node-icon').update(item, model, status);
        }

        // 展开 or 收起
        if (name === 'node-collapsed') {
            getComponent('arrow').setState(item, { value });
        }

        // 置灰 or 非置灰
        // Note: 'group' component disabled method required g6_example
        // This implies we need reference to the graph instance or wrapper
        // The original code had access to g6_example via closure in getRegisterNode
        // We might need to ensure 'this' context or pass it in.
        // item.get('graph') might work if attached, but usually G6 doesn't attach custom graph wrapper to item.
        // For now we assume we might need to fix this dependency injection.
        const graph = item.get('graph'); // G6 graph instance
        // We need the wrapper 'g6_example' which has 'caching'.
        // Temporary fix: pass the graph or handle it later. 
        // The component 'group.js' uses g6_example.caching.
        // We will revisit this when integrating back.

        // Using a placeholder or assuming it will be injected/bound
        const g6_example = item.get('g6_example') || this.g6_example;

        getComponent('group').disabled(g6_example, item, name, value);

        if (name === 'node-active') {
            const status = getHealthSetting(model.statusType) || model;
            getComponent('state-halo').setState(item, { name, value, style: status });
        }
    },
}

export function getRegister(g6_example) {
    const nodeDef = { ...NodeIcon };
    nodeDef.g6_graph = g6_example.g6_graph;
    nodeDef.g6_example = g6_example;

    return {
        'node-icon': {
            register: 'rect',
            node: nodeDef,
            options: defaults,
        }
    };
}

export { defaults };
export default NodeIcon;

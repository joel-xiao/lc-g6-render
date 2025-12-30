import { debounce } from 'lodash';
import { onEvent } from '../behaviors/events/index';
import NormalEvent from '../behaviors/normal-event/index';
import ExpandLinkEvent from '../behaviors/expand-link-event/index';

const CUSTOM_BEHAVIORS = {
    'normal-event': NormalEvent,
    'expand-link-event': ExpandLinkEvent,
};

function getCustomBehavior(type, event_type) {
    const behavior = CUSTOM_BEHAVIORS[type];
    if (!behavior) return;
    const fn_name = behavior.getEvent(event_type);
    return behavior[fn_name];
}

/**
 * 处理自定义行为
 */
export function onCustomBehavior(graph, event_type, e) {
    const behavior = graph.vmOption.customBehaviors?.[0];
    if (!behavior) return;

    if (typeof behavior === 'string') {
        const fn = getCustomBehavior(behavior, event_type);
        fn?.(e, graph, onEvent);
    } else {
        const fn_name = behavior.getEvent()[event_type];
        behavior[fn_name]?.(e, graph, onEvent);
    }
}

/**
 * 绑定所有 G6 事件
 */
export function bindEvents(graph) {
    const g6 = graph.g6_graph;

    const bindEvent = (eventName, hasCustomBehavior = true) => {
        g6.on(eventName, (e) => {
            if (hasCustomBehavior) onCustomBehavior(graph, eventName, e);
            graph.vmOption?.onEvent(eventName, e);
        });
    };

    // 节点事件
    bindEvent('node:click');
    bindEvent('node:mousedown', false);
    bindEvent('node:mouseenter');
    bindEvent('node:mouseleave');

    // 边事件
    bindEvent('edge:click');
    bindEvent('edge:mouseenter');
    bindEvent('edge:mouseleave');

    // Combo 事件
    bindEvent('combo:click');
    bindEvent('combo:mouseover');
    bindEvent('combo:mouseout');
    bindEvent('combo:mouseenter');
    bindEvent('combo:mouseleave');

    // 画布事件
    bindEvent('canvas:click');
    bindEvent('canvas:mousedown');

    // Tooltip 事件
    g6.on('tooltipchange', (e) => {
        if (e.action === 'hide') {
            g6.emit('tooltipchange', { ...e, action: 'show' });
        }
    });

    // 渲染事件
    g6.on('afterrender', (e) => {
        if (graph._destroy) return;
        setTimeout(() => {
            graph.loadZoom();
            graph.onZoom();
        });
        onEvent(['loop-edge'], 'load', undefined, g6, { g6_example: graph });
        if (graph.is_set_data) {
            graph.focusNode();
            graph.activeNode();
            graph.is_set_data = false;
        }
        graph.layoutQuadraticEdges();
        graph.vmOption?.onEvent('afterrender', e);
    });

    // 布局事件
    g6.on('beforelayout', (e) => {
        if (graph._destroy) return;
        graph.stopAnimate();
        graph.clearEvents();
        graph.vmOption?.onEvent('beforelayout', e);
    });

    g6.on('afterlayout', (e) => {
        if (graph._destroy) return;
        graph.onZoom();
        onEvent(['loop-edge'], 'load', undefined, g6, { g6_example: graph });
        graph.vmOption?.onEvent('afterlayout', e);
    });

    // 缩放事件
    g6.on('wheelzoom', () => graph.onZoom());
}

/**
 * 初始化 resize 监听
 */
export function initResize(graph) {
    const drawer = graph.el_container;
    graph.resizeObserver = new ResizeObserver(debounce(() => {
        if (!graph.g6_graph || graph.g6_graph.get('destroyed')) return;
        graph.changeSize(drawer.getBoundingClientRect());
    }, 500, { trailing: true }));
    graph.resizeObserver.observe(drawer);
}

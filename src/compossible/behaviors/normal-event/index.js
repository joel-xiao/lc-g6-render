import { onEvent } from '../events/index';

const NormalEvent = {
    getEvent(event_type) {
        const events = {
            'node:click': 'onNodeClick',
            'node:mouseenter': 'onNodeEnter',
            'node:mouseleave': 'onNodeLeave',
            'combo:click': 'onComboClick',
            'combo:mouseenter': 'onComboEnter',
            'combo:mouseleave': 'onComboLeave',
            'edge:click': 'onEdgeClick',
            'edge:mouseenter': 'onEdgeEnter',
            'edge:mouseleave': 'onEdgeLeave',
            'canvas:click': 'onCanvasClick',
            'canvas:mousedown': 'onCanvasDown',
        };

        return events[event_type];
    },

    onNodeClick(evt, that) {
        onEvent(['edge-running', 'disabled', 'node-collapsed'], 'click', evt, that.g6_graph, {
            g6_example: that,
        });
    },

    onNodeEnter(evt, that) {
        onEvent(['edge-running', 'node-collapsed', 'disabled', 'edge-focus'], 'enter', evt, that.g6_graph, {
            g6_example: that,
        });
    },

    onNodeLeave(evt, that) {
        onEvent(['edge-running', 'node-collapsed', 'disabled', 'edge-focus'], 'leave', evt, that.g6_graph, {
            g6_example: that,
        });
    },

    onComboClick(evt, that) {
        const model = evt.item.getModel();

        if (model.collapsed) {
            onEvent(['edge-running', 'edge-focus', 'disabled'], 'clear', evt, that.g6_graph, {
                g6_example: that,
            });
            onEvent(['combo-collapsed'], 'click', evt, that.g6_graph, {
                g6_example: that,
            });

        } else {
            onEvent(['edge-running', 'edge-focus', 'disabled'], 'clear', evt, that.g6_graph, {
                g6_example: that,
            });
        }
    },

    onComboEnter(evt, that) {
        const model = evt.item.getModel();
        if (model.collapsed) {
            onEvent(['edge-running', 'node-collapsed', 'disabled'], 'enter', evt, that.g6_graph, {
                g6_example: that,
            });
        }
    },

    onComboLeave(evt, that) {
        const model = evt.item.getModel();
        if (model.collapsed) {
            onEvent(['edge-running', 'node-collapsed', 'disabled'], 'leave', evt, that.g6_graph, {
                g6_example: that,
            });
        }
    },

    onEdgeClick(evt, that) {
    },

    onEdgeEnter(evt, that) {
        onEvent(['edge-focus'], 'enter', evt, that.g6_graph);
    },

    onEdgeLeave(evt, that) {
        onEvent(['edge-focus'], 'leave', evt, that.g6_graph);
    },

    onCanvasClick(evt, that) {
        onEvent(['edge-running', 'edge-focus', 'disabled'], 'clear', evt, that.g6_graph, {
            g6_example: that,
        });
    },

    onCanvasDown(evt, that) {
        onEvent(['edge-focus'], 'clear', evt, that.g6_graph);
    },
};

export default NormalEvent;

import { onEvent } from '../events/index';

function getNodeDisabledCollapse(node) {
    // 组内的节点（应用节点）不应该有展开收起按钮
    // 只有系统节点（不在组内的）才可能有展开收起按钮
    return (
        node.is_user ||
        node.is_external ||
        node.is_deleted ||
        node.node_type === "app" || // 应用节点（组内节点）禁用展开收起
        !!node.comboId // 在组内的节点都禁用展开收起
    );
}

const ExpandLinkEvent = {
    getEvent(event_type) { // If getting all events
        if (!event_type) {
            return {
                "node:click": "onNodeClick",
                "node:mouseenter": "onNodeMouseEnter",
                "node:mouseleave": "onNodeMouseLeave",
                "combo:click": "onComboClick",
                "combo:mouseenter": "onComboMouseEnter",
                "combo:mouseleave": "onComboMouseLeave",
                "edge:click": "onEdgeClick",
                "edge:mouseenter": "onEdgeMouseEnter",
                "edge:mouseleave": "onEdgeMouseLeave",
                "canvas:click": "onCanvasClick",
                "canvas:mousedown": "onCanvasMouseDown",
            };
        }

        // If getting specific event (following normal-event pattern)
        const events = {
            "node:click": "onNodeClick",
            "node:mouseenter": "onNodeMouseEnter",
            "node:mouseleave": "onNodeMouseLeave",
            "combo:click": "onComboClick",
            "combo:mouseenter": "onComboMouseEnter",
            "combo:mouseleave": "onComboMouseLeave",
            "edge:click": "onEdgeClick",
            "edge:mouseenter": "onEdgeMouseEnter",
            "edge:mouseleave": "onEdgeMouseLeave",
            "canvas:click": "onCanvasClick",
            "canvas:mousedown": "onCanvasMouseDown",
        };
        return events[event_type];
    },

    onNodeClick(evt, that, onEvent) {
        const combo = that.g6_graph.getCombos()[0]?.getModel();
        const eventName = evt.target?.get("event-name");
        const model = evt.item.getModel();

        if (combo?.collapsed) {
            if (model.is_deleted) return;

            onEvent(
                ["edge-running", "disabled", "node-collapsed"],
                "click",
                evt,
                that.g6_graph,
                {
                    g6_example: that,
                },
            );
        } else {
            if (model.is_external || model.is_deleted) return;

            if (eventName === "node-collapsed") {
                onEvent(["node-collapsed"], "click", evt, that.g6_graph, {
                    g6_example: that,
                });
            } else {
                onEvent(["node-active"], "click", evt, that.g6_graph, {
                    g6_example: that,
                });

                onEvent(
                    ["edge-running", "disabled"],
                    "setCachingState",
                    evt,
                    that.g6_graph,
                    {
                        g6_example: that,
                    },
                );
            }
        }
    },

    onNodeMouseEnter(evt, that, onEvent) {
        const model = evt.item.getModel();

        const caching_current_model = "outer.event.node-click.current";
        if (that.caching.hasCaching(caching_current_model)) {
            model.disabled_collapse = true;
        }

        const events = ["edge-running", "disabled", "node-collapsed", "edge-focus"];

        onEvent(events, "enter", evt, that.g6_graph, {
            g6_example: that,
        });
    },

    onNodeMouseLeave(evt, that, onEvent) {
        const model = evt.item.getModel();

        const caching_current_model = "outer.event.node-click.current";
        if (that.caching.hasCaching(caching_current_model)) {
            model.disabled_collapse = getNodeDisabledCollapse(model);
        }

        const events = ["edge-running", "disabled", "node-collapsed", "edge-focus"];

        onEvent(events, "leave", evt, that.g6_graph, {
            g6_example: that,
        });
    },

    onComboClick(evt, that, onEvent) {
        const model = evt.item.getModel();
        const eventName = evt.target?.get("event-name");

        if (eventName === "combo-collapsed") {
            return;
        }

        if (model.collapsed) {
            onEvent(
                ["edge-running", "disabled", "node-collapsed"],
                "click",
                evt,
                that.g6_graph,
                {
                    g6_example: that,
                },
            );
        } else {
            onEvent(
                ["edge-running", "edge-focus", "disabled", "node-active"],
                "clear",
                evt,
                that.g6_graph,
                {
                    g6_example: that,
                },
            );
        }
    },

    onComboMouseEnter(evt, that, onEvent) {
        const model = evt.item.getModel();
        if (model.collapsed) {
            onEvent(
                ["edge-running", "node-collapsed", "disabled"],
                "enter",
                evt,
                that.g6_graph,
                {
                    g6_example: that,
                },
            );
        }
    },

    onComboMouseLeave(evt, that, onEvent) {
        const model = evt.item.getModel();
        if (model.collapsed) {
            onEvent(
                ["edge-running", "node-collapsed", "disabled"],
                "leave",
                evt,
                that.g6_graph,
                {
                    g6_example: that,
                },
            );
        }
    },

    onEdgeMouseEnter(evt, that, onEvent) {
        onEvent(["edge-focus"], "enter", evt, that.g6_graph);
    },

    onEdgeMouseLeave(evt, that, onEvent) {
        onEvent(["edge-focus"], "leave", evt, that.g6_graph);
    },

    onEdgeClick(evt, that, onEvent) {
        // No logic in original getBehavior for edge:click, kept it registered though
    },

    onCanvasClick(evt, that, onEvent) {
        // 点击画布时恢复所有节点显示
        if (that.vmOption) {
            that.vmOption.restoreAllNodes?.();
        }

        onEvent(
            ["edge-running", "edge-focus", "disabled", "node-active"],
            "clear",
            evt,
            that.g6_graph,
            {
                g6_example: that,
            },
        );
    },

    onCanvasMouseDown(evt, that, onEvent) {
        onEvent(["edge-focus"], "clear", evt, that.g6_graph);
    },
};

export default ExpandLinkEvent;

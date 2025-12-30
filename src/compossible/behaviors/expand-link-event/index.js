// 禁用展开收起的 statusType 列表
const DISABLED_COLLAPSE_STATUS_TYPES = ['user', 'external', 'disabled'];

function getNodeDisabledCollapse(node) {
    // 组内的节点（应用节点）不应该有展开收起按钮
    // 只有系统节点（不在组内的）才可能有展开收起按钮
    return (
        DISABLED_COLLAPSE_STATUS_TYPES.includes(node.statusType) ||
        !!node.comboId // 在组内的节点都禁用展开收起
    );
}

const ExpandLinkEvent = {
    getEvent(event_type) {
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
            if (model.statusType === 'disabled') return;

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
            if (model.statusType === 'external' || model.statusType === 'disabled') return;

            if (eventName === "node-collapsed") {
                // 检查节点是否已展开（collapsed-name 为 true 表示已展开）
                const result = onEvent(["node-collapsed"], "isNotCollapsed", evt, that.g6_graph, {
                    g6_example: that,
                });

                // isNotCollapsed 返回 true 表示：中心节点、禁用、或未展开状态
                // 返回 false/undefined 表示：已展开状态，可以收起
                if (result[0]) {
                    // 未展开状态，需要展开（获取外部数据）
                    // 显示 loading
                    that.vmOption?.onG6ComponentEvent?.('show', evt);
                    ExpandLinkEvent.onExpandNode(evt, that, onEvent);
                } else {
                    // 已展开状态，直接收起节点（不显示 loading）
                    onEvent(["node-collapsed"], "click", evt, that.g6_graph, {
                        g6_example: that,
                    });
                }
            } else {
                // 点击节点显示关联边
                ExpandLinkEvent.onNodeClickShowEdges(evt, that, onEvent);
            }
        }
    },

    // 展开节点 - 调用外部数据获取函数
    onExpandNode(evt, that, onEvent) {
        const model = evt.item.getModel();
        const edgeType = evt.target.get("node-edge-type");
        const depth = Math.abs(model.node_depth || 0) + 1;

        // 调用外部提供的数据获取函数
        const getExpandData = that.vmOption?.getExpandData;
        if (!getExpandData) {
            // 没有外部数据获取函数，隐藏 loading 并调用默认的展开收起逻辑
            that.vmOption?.onG6ComponentEvent?.('hide', evt);
            onEvent(["node-collapsed"], "click", evt, that.g6_graph, {
                g6_example: that,
            });
            return;
        }

        const newData = getExpandData(model, edgeType, depth);
        if (!newData || !newData.nodes || newData.nodes.length === 0) {
            // 没有新数据，隐藏 loading 并返回
            that.vmOption?.onG6ComponentEvent?.('hide', evt, {
                text: '暂无数据'
            });
            return;
        }

        // 检查节点是否已存在
        const existingIds = new Set(that.g6_graph.getNodes().map((n) => n.getModel().id));
        newData.nodes = newData.nodes.filter((n) => !existingIds.has(n.id));
        newData.edges = newData.edges.filter((e) =>
            newData.nodes.some((n) => n.id === e.source || n.id === e.target)
        );

        if (newData.nodes.length === 0) {
            // 所有节点已存在，隐藏 loading 并返回
            that.vmOption?.onG6ComponentEvent?.('hide', evt, {
                text: '暂无数据'
            });
            return;
        }

        // 添加到图
        that.addData({ e: evt, node_edge_type: edgeType, model }, newData);

        // 隐藏 loading
        that.vmOption?.onG6ComponentEvent?.('hide', evt, {
            text: newData.nodes.length > 0 ? '' : '暂无数据'
        });

        // 更新节点的展开状态
        const collapsed_name = evt.target.get('collapsed-name');
        if (collapsed_name) {
            model[collapsed_name] = true;
            that.g6_graph.setItemState(evt.item, 'node-collapsed', {
                name: collapsed_name,
                value: true
            });
        }
    },

    // 点击节点显示关联边
    onNodeClickShowEdges(evt, that, onEvent) {
        const model = evt.item.getModel();
        const cachingKey = "outer.event.node-click.current";
        const caching_insert_id = "outer.insertTopologyData." + model.id;
        const caching_id = "outer.topologyData." + model.id;

        // 先取消之前的状态
        ExpandLinkEvent.cancelNodeEdges(evt, that, onEvent);

        // 禁用展开收起
        onEvent(["node-collapsed"], "leave", evt, that.g6_graph, { g6_example: that });
        model.disabled_collapse = true;

        // 缓存当前节点
        that.caching.setCaching(cachingKey, model);

        // 获取插入边数据
        const is_not_insert_caching = !that.caching.hasCaching(caching_insert_id);
        if (is_not_insert_caching) {
            // 调用外部提供的数据获取函数
            const getInsertEdges = that.vmOption?.getInsertEdges;
            if (!getInsertEdges) {
                // 没有外部数据，使用默认的边高亮逻辑
                onEvent(["node-active"], "click", evt, that.g6_graph, { g6_example: that });
                onEvent(["edge-running", "disabled"], "setCachingState", evt, that.g6_graph, { g6_example: that });
                return;
            }

            const insertEdges = getInsertEdges(model);
            if (!insertEdges || insertEdges.length === 0) {
                onEvent(["node-active"], "click", evt, that.g6_graph, { g6_example: that });
                onEvent(["edge-running", "disabled"], "setCachingState", evt, that.g6_graph, { g6_example: that });
                return;
            }

            const insertEdgeMap = {};
            const insertEdgeSet = {};
            const removeEdgeMap = {};

            for (let edge of insertEdges) {
                insertEdgeMap[edge.target] = edge;
                insertEdgeMap[edge.source] = edge;
                insertEdgeSet[edge.target + "--edge--" + edge.source] = edge;
            }

            let g6_graph_edges = that.g6_graph.getEdges();
            for (const edge of g6_graph_edges) {
                const edgeModel = edge.getModel();
                removeEdgeMap[edgeModel.id] = edgeModel;
            }

            const insertEdgesArr = Object.values(insertEdgeSet);
            const insertNodeIds = Object.keys(insertEdgeMap);
            that.caching.setCaching(caching_insert_id, {
                nodeIds: insertNodeIds,
                edges: insertEdgesArr,
            });

            if (!that.caching.hasCaching(caching_id)) {
                that.caching.setCaching(caching_id, {
                    edges: Object.values(removeEdgeMap),
                });
            }
        }

        // 移除原有边
        const cachedData = that.caching.getCaching(caching_id);
        if (cachedData && cachedData.edges) {
            for (let edgeModel of cachedData.edges) {
                const edgeItem = that.g6_graph.findById(edgeModel.id);
                if (edgeItem) that.g6_graph.removeItem(edgeItem);
            }
        }

        // 添加插入边
        const cachedInsertData = that.caching.getCaching(caching_insert_id);
        if (!cachedInsertData) return;

        const { edges: insertEdges, nodeIds: insertNodeIds } = cachedInsertData;
        if (insertEdges && insertEdges.length > 0) {
            for (let edgeModel of insertEdges) {
                const existingEdge = that.g6_graph.getEdges().find((edge) => {
                    const m = edge.getModel();
                    return m.source === edgeModel.source && m.target === edgeModel.target;
                });

                if (!existingEdge) {
                    if (!edgeModel.id) {
                        edgeModel.id = `edge-${edgeModel.source}-${edgeModel.target}-${Date.now()}`;
                    }
                    try {
                        that.g6_graph.addItem("edge", edgeModel);
                    } catch (error) {
                        console.error("添加边失败:", error);
                    }
                }
            }
        }

        that.layoutEdges();
        that.layoutQuadraticEdges();

        // 设置边运行状态和禁用状态
        onEvent(["edge-running"], "setState", evt, that.g6_graph, { edges: insertEdges });
        onEvent(["disabled"], "setState", evt, that.g6_graph, {
            not_nodes: [model.id, ...insertNodeIds],
            not_edges: insertEdges,
            g6_example: that,
        });

        that.calcTopologyData();
    },

    // 取消节点边高亮
    cancelNodeEdges(evt, that, onEvent) {
        const cachingKey = "outer.event.node-click.current";
        if (!that.caching.hasCaching(cachingKey)) return;

        const model = that.caching.getCaching(cachingKey);
        that.caching.delCaching(cachingKey);

        const caching_insert_id = "outer.insertTopologyData." + model.id;
        const caching_id = "outer.topologyData." + model.id;

        // 移除插入的边
        if (that.caching.hasCaching(caching_insert_id)) {
            const data = that.caching.getCaching(caching_insert_id);
            for (let edgeModel of data.edges) {
                that.g6_graph.removeItem(edgeModel.id);
            }
        }

        // 恢复原有边
        if (that.caching.hasCaching(caching_id)) {
            const data = that.caching.getCaching(caching_id);
            for (let edgeModel of data.edges) {
                that.g6_graph.addItem("edge", edgeModel);
            }
        }

        // 清除高亮状态
        onEvent(["edge-running", "disabled"], "clear", evt, that.g6_graph, { g6_example: that });

        that.calcTopologyData();
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
        // 取消节点边高亮
        ExpandLinkEvent.cancelNodeEdges(evt, that, onEvent);

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

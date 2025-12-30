import { cloneDeep, debounce } from 'lodash';
import G6 from "@antv/g6";
import { assignOptions } from './option-merger';
import { registry } from './registry';
import { getLayout } from '../layouts/options';
import { getShape } from '../shapes/components/index';
import { layoutEdges, layoutQuadraticEdges } from '../layouts/dagre-tbt/methods';
import { getCustomBehavior } from '../behaviors/scenarios';
import { onEvent, getEvent } from '../behaviors/events/index';
import { joinDataMapKey } from '../utils/common';
import { mergeModel, calcNodeModelData } from '../data/format.js';
import { Caching } from '../utils/caching.js';

export class G6Graph {
    data = { nodes: [], edges: [] };
    mapData = new Map();
    caching = new Caching();
    _destroy = false;
    minimap;
    add_data_event;
    vmOption;
    option;
    g6_graph;
    assign_option;
    resizeObserver;

    constructor(options) {
        this.updateOptions(options);
    }

    updateOptions({ option, vmOption }) {
        this.option = option || {};
        this.vmOption = vmOption || {};
    }

    nweGraph() {
        if (!this.g6_graph && this.option) {
            this.el_container = document.getElementById(this.option.container);
            if (!this.el_container) return;
            const rect = this.el_container?.getBoundingClientRect();
            this.option.width = rect.width;
            this.option.height = rect.height;
            const { option, minimap } = assignOptions(this.option, this.vmOption);
            this.assign_option = option;
            this.minimap = minimap;

            this.g6_graph = new G6.Graph(this.assign_option);
            this.g6_graph.get('canvas').set('localRefresh', false);
            this.registerElement();
            this.addEventListener();
            this.onResize('load');
        }
    }

    destroy() {
        if (!this.g6_graph) return;
        if (this._destroy) return;

        this.stopAnimate();
        this.clearEvents();
        this.g6_graph.destroy();
        this._destroy = true;
    }

    registerElement() {
        registry.registerAll(this);
    }

    render() {
        this.g6_graph?.render();
    }

    getGraph() {
        return this.g6_graph;
    }

    setOptionZoom(zoom) {
        this.g6_graph?.setMinZoom(zoom.min);
        this.g6_graph?.setMaxZoom(zoom.max);
    }

    setData(data) {
        this.is_set_data = true;
        this.data = data;
        const keys = Object.keys(data);
        if (!keys.includes('links')) {
            this.nweGraph();
            this.g6_graph?.data(this.data);
            this.render();
        }
    }

    changeData(data, stack) {
        this.g6_graph?.changeData(data, stack)
    }

    addData({ e, node_edge_type, model }, data, cb) {
        this.layoutEdges(data.edges, data.nodes);

        data.nodes.forEach(node => {
            const item = this.g6_graph.find('node', (item) => {
                const model = item.getModel();
                return model.id === node.id;
            });
            if (item) {
                node.conflicting = true;
                cb?.('conflict-node', item, node) || this.mergeModel(item, node);
            } else {
                this.addItem('node', node);
            }
        });

        data.edges.forEach(edge => {
            const item = this.g6_graph.find('edge', (item) => {
                const model = item.getModel();
                return model.target === edge.target && model.source === edge.source;
            });
            if (item) {
                edge.conflicting = true;
                cb?.('conflict-edge', item, edge) || this.mergeModel(item, edge)
            } else {
                this.addItem('edge', edge);
                calcNodeModelData(edge, this.g6_graph, this.vmOption.utils, this);
                setTimeout(() => {
                    this.updateItem(this.g6_graph.findById(edge.id), edge);
                })
            }
        });

        this.layoutQuadraticEdges(data.edges, data.nodes);

        this.g6_graph.layout();

        model = e?.item?.getModel() || model;
        if (model) {
            node_edge_type = e.target.get('node-edge-type') || node_edge_type;
            if (model.duplex_edge_type === 'out-edges') {
                const shape_base_data = getShape('arrow').getCfg(model, 'bottom').base_data;
                node_edge_type = shape_base_data['node-edge-type'];
            }

            if (model.duplex_edge_type === 'in-edges') {
                const shape_base_data = getShape('arrow').getCfg(model, 'top').base_data;
                node_edge_type = shape_base_data['node-edge-type'];
            }

            this.mapData.set(joinDataMapKey(node_edge_type, model.id), data);
            this.add_data_event = e;
        }
    }

    mergeModel(item, model, change = 'addition') {
        let itemModel = item.getModel();
        itemModel = mergeModel(itemModel, model, change, itemModel.mergeModel || this.vmOption.defaultMergeNode, this.vmOption.utils, this);
        this.calcNodeModelData(item);
        return itemModel;
    }

    updateItemState(item) {
        // console.log('updateItemState', item.getModel().title);
        item.setState('statusType', Math.random());
    }

    calcNodeModelData(item) {
        let itemModel = item.getModel();
        calcNodeModelData(itemModel, this.g6_graph, this.vmOption.utils, this);
    }

    calcTopologyData() {
        const nodes = this.g6_graph.getNodes();
        nodes.forEach(node => {
            this.calcNodeModelData(node);
        });
    }

    layoutEdges(edges, nodes) {
        if (this._destroy) return;

        if (!edges && !nodes) {
            edges = this.g6_graph.getEdges().map(edge => edge.getModel());
            nodes = [...this.g6_graph.getNodes(), ...this.g6_graph.getCombos()].map(node => node.getModel());
        }

        layoutEdges(edges, nodes);
    }

    layoutQuadraticEdges(edges, nodes) {
        if (this._destroy) return;

        if (!edges && !nodes) {
            edges = this.g6_graph.getEdges().map(edge => edge.getModel());
            nodes = [...this.g6_graph.getNodes(), ...this.g6_graph.getCombos()].map(node => node.getModel());
        }

        layoutQuadraticEdges(this.g6_graph, edges, nodes, this.assign_option.layout);
    }

    stopAnimate() {
        if (this._destroy) return;

        const nodes = this.g6_graph.getNodes().concat(this.g6_graph.getCombos());
        nodes.forEach(node => {
            const model = node.getModel();
            if (model.shape_animate?.values) {
                console.log(model.shape_animate.values())
                model.shape_animate.values().forEach((value) => {
                    value.stopAnimate();
                });
            }
        });
    }

    clearEvents() {
        if (this._destroy) return;
        onEvent(['node-active', 'edge-running', 'edge-focus', 'disabled'], 'clear', undefined, this.g6_graph, {
            g6_example: this,
        });
    }

    toFrontNodes() {
        const nodes = this.g6_graph.getNodes();
        nodes.forEach((node) => {
            node.toFront();
        });

        this.g6_graph.paint();
    }

    addComboChild(combo, item) {
        combo.addChild(item);
    }

    addItem(type, model, stack) {
        this.g6_graph.addItem(type, model, stack);
    }

    removeItem(item, stack) {
        this.g6_graph.removeItem(item, stack);
    }

    updateItem(item, model, stack) {
        this.g6_graph.updateItem(item, model, stack);
    }

    focusItem(item, animate, animateCfg) {
        this.g6_graph.focusItem(item, animate, animateCfg);
    }

    updateLayout(layout) {
        this.nweGraph();
        this.g6_graph?.destroyLayout();
        this.g6_graph?.updateLayout(getLayout(layout, this.assign_option));
    }

    layout() {
        this.g6_graph.layout();
    }

    updateMinimap() {
        if (this.minimap) {
            this.minimap.updateCanvas();
        }
    }

    activeNode(e) {
        clearTimeout(window.timer);
        window.timer = setTimeout(() => {
            onEvent(['node-active'], 'load', e, this.g6_graph, {
                ids: this.vmOption.activeNodes
            });
        }, 50);
    }

    focusNode(e) {
        const timer = 200;
        if (e) {
            this.focusItem(e.item, timer);
            return;
        }

        setTimeout(() => {
            try {
                const centerNodes = this.vmOption.centerNodes || [];
                const item = this.g6_graph.findById(centerNodes[0]);
                if (item) {
                    this.focusItem(item, timer);
                } else {
                    setTimeout(() => {
                        this.g6_graph.fitCenter();
                    });
                }
            } catch (e) {
                console.log('focusNode:Err');
            }
        }, 100)
    }

    changeSize(rect) {
        if (!this.getGraph()) {
            this.nweGraph();
        } else {
            try {
                this.g6_graph?.changeSize(rect.width, rect.height);
            } catch (e) { }
        }
    }

    loadZoom() {
        if (this._destroy) return;
        let zoom = this.g6_graph.getZoom();
        zoom = zoom > 1 ? 1 : zoom;
        this.setZoom(zoom);
    }

    setZoom(zoom) {
        this.g6_graph?.zoomTo(zoom);
    }

    onCustomBehavior(event_type, e) {
        const behavior = this.vmOption.customBehaviors?.[0];
        if (!behavior) return;

        if (typeof behavior === 'string') {
            const fn = getCustomBehavior(behavior, event_type);
            fn?.(e, this);

        } else {
            const fn_name = behavior.getEvent()[event_type];
            const fn = behavior[fn_name];
            fn?.(e, this, onEvent);
        }
    }

    addEventListener() {
        this.g6_graph.on('node:click', (e) => {
            this.onCustomBehavior('node:click', e);
            this.vmOption?.onEvent('node:click', e);
        });

        this.g6_graph.on('node:mousedown', (e) => {
            this.vmOption?.onEvent('node:mousedown', e);
        });

        this.g6_graph.on('node:mouseenter', (e) => {
            this.onCustomBehavior('node:mouseenter', e);
            this.vmOption?.onEvent('node:mouseenter', e);
        });

        this.g6_graph.on('node:mouseleave', (e) => {
            this.onCustomBehavior('node:mouseleave', e);
            this.vmOption?.onEvent('node:mouseleave', e);
        });

        this.g6_graph.on('edge:click', (e) => {
            this.onCustomBehavior('edge:click', e);
            this.vmOption?.onEvent('edge:click', e);
        });

        this.g6_graph.on('edge:mouseenter', (e) => {
            this.onCustomBehavior('edge:mouseenter', e);
            this.vmOption?.onEvent('edge:mouseenter', e);
        });

        this.g6_graph.on('edge:mouseleave', (e) => {
            this.onCustomBehavior('edge:mouseleave', e);
            this.vmOption?.onEvent('edge:mouseleave', e);
        });

        this.g6_graph.on('combo:click', (e) => {
            this.onCustomBehavior('combo:click', e);
            this.vmOption?.onEvent('combo:click', e);
        });

        this.g6_graph.on('combo:mouseover', (e) => {
            this.onCustomBehavior('combo:mouseover', e);
            this.vmOption?.onEvent('combo:mouseover', e);
        });

        this.g6_graph.on('combo:mouseout', (e) => {
            this.onCustomBehavior('combo:mouseout', e);
            this.vmOption?.onEvent('combo:mouseout', e);
        });

        this.g6_graph.on('combo:mouseenter', (e) => {
            this.onCustomBehavior('combo:mouseenter', e);
            this.vmOption?.onEvent('combo:mouseenter', e);
        });

        this.g6_graph.on('combo:mouseleave', (e) => {
            this.onCustomBehavior('combo:mouseleave', e);
            this.vmOption?.onEvent('combo:mouseleave', e);
        });

        this.g6_graph.on('canvas:click', (e) => {
            this.onCustomBehavior('canvas:click', e);
            this.vmOption?.onEvent('canvas:click', e);
        });

        this.g6_graph.on('canvas:mousedown', (e) => {
            this.onCustomBehavior('canvas:mousedown', e);
            this.vmOption?.onEvent('canvas:mousedown', e);
        });

        this.g6_graph.on('tooltipchange', (e) => {
            if (e.action === 'hide') {
                this.g6_graph.emit('tooltipchange', {
                    ...e,
                    action: 'show'
                });
            }
        });

        this.g6_graph.on('afterrender', (e) => {
            if (this._destroy) return;

            setTimeout(() => {
                this.loadZoom();
                this.onZoom();
            });

            onEvent(['loop-edge'], 'load', undefined, this.g6_graph, {
                g6_example: this,
            });

            if (this.is_set_data) {
                this.focusNode();
                this.is_set_data = undefined;
            }

            this.layoutQuadraticEdges();
            this.vmOption?.onEvent('afterrender', e);
        });

        this.g6_graph.on('beforelayout', (e) => {
            if (this._destroy) return;
            this.stopAnimate();
            this.clearEvents();

            this.vmOption?.onEvent('beforelayout', e);
        });

        this.g6_graph.on('afterlayout', (e) => {
            if (this._destroy) return;
            this.onZoom();

            onEvent(['loop-edge'], 'load', undefined, this.g6_graph, {
                g6_example: this,
            });

            if (this.add_data_event) {
                this.add_data_event = undefined;
            }

            this.vmOption?.onEvent('afterlayout', e);
        });

        this.g6_graph.on('wheelzoom', (e) => {
            this.onZoom();
        });
    }

    onZoom() {
        if (this._destroy) return;
        this.vmOption?.setZoom(this.g6_graph.getZoom());
    }

    onResize(type) {
        let drawer = this.el_container;
        const g6_graph = this.g6_graph;
        const that = this;
        if (type === "load") {
            this.resizeObserver = new ResizeObserver(debounce(() => {
                if (!g6_graph || g6_graph.get('destroyed')) return;
                const rect = drawer.getBoundingClientRect();
                that.changeSize(rect);
            }, 500, { trailing: true }));
            this.resizeObserver.observe(drawer);
        } else {
            this.resizeObserver && this.resizeObserver.unobserve(drawer);
        }
    }
}

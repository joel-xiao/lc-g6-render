import G6 from "@antv/g6";
import { assignOptions } from './option-merger';
import { registry } from './registry';
import { getLayout } from '../layouts/options';
import { layoutEdges, layoutQuadraticEdges } from '../layouts/depth-vertical/algorithm';
import { onEvent } from '../behaviors/events/index';
import { mergeModel } from '../data/format.js';
import { Caching } from '../utils/caching.js';

// 拆分的模块
import { bindEvents, initResize } from './graph-bindEvents';
import { calcBfsDepth, addGraphData } from './graph-bindData';

export class G6Graph {
    // 实例属性
    data = { nodes: [], edges: [] };
    mapData = new Map();
    caching = new Caching();
    _destroy = false;
    minimap = null;
    vmOption = {};
    option = {};
    g6_graph = null;
    assign_option = null;
    resizeObserver = null;
    el_container = null;
    is_set_data = false;

    constructor(options) {
        this.updateOptions(options);
    }

    updateOptions({ option, vmOption }) {
        this.option = option || {};
        this.vmOption = vmOption || {};
    }

    // ========== 生命周期 ==========

    newGraph() {
        if (this.g6_graph || !this.option) return;
        
        this.el_container = document.getElementById(this.option.container);
        if (!this.el_container) return;
        
        const rect = this.el_container.getBoundingClientRect();
        this.option.width = rect.width;
        this.option.height = rect.height;
        
        registry.registerAll(this);
        
        const { option, minimap } = assignOptions(this.option, this.vmOption);
        this.assign_option = option;
        this.minimap = minimap;

        this.g6_graph = new G6.Graph(this.assign_option);
        this.g6_graph.get('canvas').set('localRefresh', false);
        
        bindEvents(this);
        initResize(this);
    }

    nweGraph() { this.newGraph(); }

    destroy() {
        if (!this.g6_graph || this._destroy) return;
        this.stopAnimate();
        this.clearEvents();
        this.g6_graph.destroy();
        this._destroy = true;
    }

    render() {
        this.g6_graph?.render();
    }

    getGraph() {
        return this.g6_graph;
    }

    // ========== 数据操作 ==========

    setData(data) {
        this.is_set_data = true;
        this.data = data;
        
        if (!Object.keys(data).includes('links')) {
            calcBfsDepth(this, data);
            this.newGraph();
            this.g6_graph?.data(this.data);
            this.render();
        }
    }

    changeData(data, stack) {
        this.g6_graph?.changeData(data, stack);
    }

    addData(options, data, cb) {
        addGraphData(this, options, data, cb);
    }

    // ========== 图元素操作 ==========

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

    addComboChild(combo, item) {
        combo.addChild(item);
    }

    mergeModel(item, model) {
        let itemModel = item.getModel();
        itemModel = mergeModel(itemModel, model);
        return itemModel;
    }

    updateItemState(item) {
        item.setState('statusType', Math.random());
    }

    toFrontNodes() {
        this.g6_graph.getNodes().forEach(node => node.toFront());
        this.g6_graph.paint();
    }

    // ========== 布局 ==========

    layout() {
        this.g6_graph.layout();
    }

    updateLayout(layout) {
        this.newGraph();
        this.g6_graph?.destroyLayout();
        this.g6_graph?.updateLayout(getLayout(layout, this.assign_option));
    }

    layoutEdges(edges, nodes) {
        if (this._destroy) return;
        if (!edges && !nodes) {
            edges = this.g6_graph.getEdges().map(e => e.getModel());
            nodes = [...this.g6_graph.getNodes(), ...this.g6_graph.getCombos()].map(n => n.getModel());
        }
        layoutEdges(edges, nodes);
    }

    layoutQuadraticEdges(edges, nodes) {
        if (this._destroy) return;
        if (!edges && !nodes) {
            edges = this.g6_graph.getEdges().map(e => e.getModel());
            nodes = [...this.g6_graph.getNodes(), ...this.g6_graph.getCombos()].map(n => n.getModel());
        }
        layoutQuadraticEdges(this.g6_graph, edges, nodes, this.assign_option.layout);
    }

    // ========== 缩放 ==========

    setOptionZoom(zoom) {
        this.g6_graph?.setMinZoom(zoom.min);
        this.g6_graph?.setMaxZoom(zoom.max);
    }

    setZoom(zoom) {
        this.g6_graph?.zoomTo(zoom);
    }

    loadZoom() {
        if (this._destroy) return;
        let zoom = this.g6_graph.getZoom();
        this.setZoom(zoom > 1 ? 1 : zoom);
    }

    onZoom() {
        if (this._destroy) return;
        this.vmOption?.setZoom(this.g6_graph.getZoom());
    }

    changeSize(rect) {
        if (!this.getGraph()) {
            this.newGraph();
        } else {
            try {
                this.g6_graph?.changeSize(rect.width, rect.height);
            } catch (e) { /* ignore */ }
        }
    }

    // ========== 节点聚焦 ==========

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
                    setTimeout(() => this.g6_graph.fitCenter());
                }
            } catch (e) {
                console.log('focusNode:Err');
            }
        }, 100);
    }

    // ========== 动画与事件 ==========

    stopAnimate() {
        if (this._destroy) return;
        const nodes = this.g6_graph.getNodes().concat(this.g6_graph.getCombos());
        nodes.forEach(node => {
            const model = node.getModel();
            if (model.shape_animate?.values) {
                model.shape_animate.values().forEach(value => value.stopAnimate());
            }
        });
    }

    clearEvents() {
        if (this._destroy) return;
        onEvent(['node-active', 'edge-running', 'edge-focus', 'disabled'], 'clear', undefined, this.g6_graph, {
            g6_example: this,
        });
    }

    updateMinimap() {
        this.minimap?.updateCanvas();
    }

    registerElement() {
        registry.registerAll(this);
    }

    onResize(type) {
        if (type === 'load') {
            initResize(this);
        } else {
            this.resizeObserver?.unobserve(this.el_container);
        }
    }
}

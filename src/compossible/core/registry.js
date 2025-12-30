import { nodeRegistry } from '../registry/node-registry';
import { edgeRegistry } from '../registry/edge-registry';
import { comboRegistry } from '../registry/combo-registry';
import { layoutRegistry } from '../registry/layout-registry';
// import { behaviorRegistry } from '../registry/behavior-registry'; // Future

/**
 * Core Registry Manager
 * 统一注册管理器，负责所有类型的注册
 */
class Registry {
    constructor() {
        this.registered = false;
        this.registries = {
            node: nodeRegistry,
            edge: edgeRegistry,
            combo: comboRegistry,
            layout: layoutRegistry,
            // behavior: behaviorRegistry
        };
    }

    /**
     * Register all custom G6 elements.
     * This should only be called once per application session as G6 registration is global.
     * @param {Object} g6_example - Context object often needed by shape definitions
     */
    registerAll(g6_example) {
        if (this.registered || window.g6_resister) {
            return;
        }

        this.registries.layout.register();
        this.registries.combo.register(g6_example);
        this.registries.node.register(g6_example);
        this.registries.edge.register(g6_example);

        // Mark as registered
        this.registered = true;
        window.g6_resister = true;
    }

    // Accessors for specific registries
    getNode(type) { return this.registries.node.get(type); }
    getEdge(type) { return this.registries.edge.get(type); }
    getCombo(type) { return this.registries.combo.get(type); }
    getLayout(type) { return this.registries.layout.get(type); }
}

export const registry = new Registry();
export default registry;

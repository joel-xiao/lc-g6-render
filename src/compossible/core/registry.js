import G6 from "@antv/g6";
import { getRegisterNode, getRegisterEdge, getRegisterCombo } from '../shapes/index';
import { registerLayout as dagreTgb } from '../layouts/dagre-tgb/index';
import { registerLayout as dagreTbt } from '../layouts/dagre-tbt/index';

const registerLayoutDef = {
    ...dagreTgb,
    ...dagreTbt
};

class NodeRegistry {
    constructor() {
        this.definitions = {};
    }

    register(g6_example) {
        const definitions = getRegisterNode(g6_example);
        Object.keys(definitions).forEach(key => {
            G6.registerNode(key, definitions[key].node, definitions[key].register);
            this.definitions[key] = definitions[key];
        });
    }

    get(type) {
        return this.definitions[type];
    }
}

class EdgeRegistry {
    constructor() {
        this.definitions = {};
    }

    register(g6_example) {
        const definitions = getRegisterEdge(g6_example);
        Object.keys(definitions).forEach(key => {
            G6.registerEdge(key, definitions[key].edge, definitions[key].register);
            this.definitions[key] = definitions[key];
        });
    }

    get(type) {
        return this.definitions[type];
    }
}

class ComboRegistry {
    constructor() {
        this.definitions = {};
    }

    register(g6_example) {
        const definitions = getRegisterCombo(g6_example);
        Object.keys(definitions).forEach(key => {
            G6.registerCombo(key, definitions[key].combo, definitions[key].register);
            this.definitions[key] = definitions[key];
        });
    }

    get(type) {
        return this.definitions[type];
    }
}

class LayoutRegistry {
    constructor() {
        this.definitions = {};
    }

    register() {
        Object.keys(registerLayoutDef).forEach(key => {
            G6.registerLayout(key, registerLayoutDef[key].layout, registerLayoutDef[key].register);
            this.definitions[key] = registerLayoutDef[key];
        });
    }

    get(type) {
        return this.definitions[type];
    }
}

/**
 * Core Registry Manager
 * 统一注册管理器，负责所有类型的注册
 */
class Registry {
    constructor() {
        this.registered = false;
        this.registries = {
            node: new NodeRegistry(),
            edge: new EdgeRegistry(),
            combo: new ComboRegistry(),
            layout: new LayoutRegistry(),
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
    get node() { return this.registries.node; }
    get edge() { return this.registries.edge; }
    get combo() { return this.registries.combo; }
    get layout() { return this.registries.layout; }

    getNode(type) { return this.registries.node.get(type); }
    getEdge(type) { return this.registries.edge.get(type); }
    getCombo(type) { return this.registries.combo.get(type); }
    getLayout(type) { return this.registries.layout.get(type); }
}

export const registry = new Registry();
export default registry;

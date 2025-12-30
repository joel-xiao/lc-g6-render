import G6 from "@antv/g6";
import { getRegisterNode } from '../shapes/node/index';

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

export const nodeRegistry = new NodeRegistry();

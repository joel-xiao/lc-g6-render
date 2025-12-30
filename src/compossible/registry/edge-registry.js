import G6 from "@antv/g6";
import { getRegisterEdge } from '../shapes/index';

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

export const edgeRegistry = new EdgeRegistry();

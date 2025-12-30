import G6 from "@antv/g6";
import { registerLayout } from '../layouts/dagre';

class LayoutRegistry {
    constructor() {
        this.definitions = {};
    }

    register() {
        Object.keys(registerLayout).forEach(key => {
            G6.registerLayout(key, registerLayout[key].layout, registerLayout[key].register);
            this.definitions[key] = registerLayout[key];
        });
    }

    get(type) {
        return this.definitions[type];
    }
}

export const layoutRegistry = new LayoutRegistry();

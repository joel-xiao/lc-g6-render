import G6 from "@antv/g6";
import { getRegisterCombo } from '../shapes/index';

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

export const comboRegistry = new ComboRegistry();

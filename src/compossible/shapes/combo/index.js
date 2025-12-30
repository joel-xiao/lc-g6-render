import * as CustomCombo from './custom-combo/index';

export function getRegisterCombo(g6_example) {
    return {
        ...CustomCombo.getRegister(g6_example)
    };
}

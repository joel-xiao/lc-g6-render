import * as CustomCombo from './custom-combo/index';

export function getRegisterCombo(g6_example) {
    const customCombo = { ...CustomCombo };
    customCombo.combo.g6_example = g6_example;

    return {
        'custom-combo': {
            ...customCombo,
            options: CustomCombo.defaults,
        }
    };
}

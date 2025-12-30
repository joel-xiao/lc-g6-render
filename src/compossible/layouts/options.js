import G6 from "@antv/g6";
import { getDagreOptions } from './dagre/options';
import { getDagreGridOptions } from './dagre-grid/options';
import { getGridOptions } from './grid/options';
import { getRandomOptions } from './random/options';
import { getDagreTbtOptions } from './dagre-tbt/options';
import { getDagreTgbOptions } from './dagre-tgb/options';

export function getLayout(layout, options) {
    const data = {
        'dagre': getDagreOptions(options),

        'dagre-grid': getDagreGridOptions(options),

        'grid': getGridOptions(),

        'random': getRandomOptions(),

        'dagre-tbt': getDagreTbtOptions(),

        'dagre-tgb': getDagreTgbOptions()
    };
    return data[layout] || data['dagre'];
}

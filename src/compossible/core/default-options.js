import { getModels } from '../behaviors/modes';
import { getLayout } from '../layouts/options';
import { getDefaultNode } from '../shapes/node/defaults';
import { getDefaultEdge } from '../shapes/edge/defaults';
import { getDefaultCombo } from '../shapes/combo/defaults';

// 临时导入旧的配置生成函数，后续重构时会移除这些依赖

const width = 500, height = 500;

export const graph_default_option = {
    container: undefined,
    width,
    height,
    fitCenter: true,
    fitView: false,
    fitViewPadding: [20, 40, 50, 20],
    animate: false,
    renderer: 'canvas',

    // 必须将 groupByTypes 设置为 false，带有 combo 的图中元素的视觉层级才能合理
    //  groupByTypes: false,

    modes: {
        default: getModels(),  // 'activate-relations'
    },

    layout: getLayout(),
    defaultNode: getDefaultNode(),
    defaultEdge: getDefaultEdge(),
    defaultCombo: getDefaultCombo(),
};

import { getDepthVerticalOptions } from './depth-vertical/options';
import { getDepthGridOptions } from './depth-grid/options';

// 自定义布局映射
const customLayouts = {
    'depth-vertical': getDepthVerticalOptions,
    'depth-grid': getDepthGridOptions
};

export function getLayout(layout, options) {
    // 如果是自定义布局，返回对应配置
    if (customLayouts[layout]) {
        return customLayouts[layout]();
    }
    // 否则透传给 G6 原生布局
    return options || { type: layout };
}

import { cloneDeep } from 'lodash';
import G6 from "@antv/g6";
import { graph_default_option } from './default-options';
import { registry } from './registry';
import { getLayout } from '../layouts/options';
import { getMinimap } from '../plugins/index';

// Helper to merge data properties strictly
export const dataMerge = function (data, props) {
    Object.keys(props).forEach((key) => {
        if (!Array.isArray(data[key]) && typeof data[key] === "object") {
            if (typeof props[key] === "object") {
                dataMerge(data[key], props[key]);
            } else {
                // Allow overwrite if types differ
                data[key] = props[key];
            }
        } else {
            data[key] = props[key];
        }
    });
}

/**
 * 合并用户配置与默认配置
 * @param {Object} option 用户传入的配置
 * @param {Object} vmOption Vue组件的配置（如 minimap 开关）
 * @returns {Object} { option, minimap }
 */
export function assignOptions(option, vmOption) {
    const assign_option = cloneDeep(graph_default_option);

    if (option.defaultNode?.type) {
        const type = option.defaultNode.type;
        const definition = registry.node.get(type);
        if (definition?.options) {
            assign_option.defaultNode = typeof definition.options === 'function' ? definition.options(type) : definition.options;
        }
    }

    if (option.defaultEdge?.type) {
        const type = option.defaultEdge.type;
        const definition = registry.edge.get(type);
        if (definition?.options) {
            assign_option.defaultEdge = typeof definition.options === 'function' ? definition.options(type) : definition.options;
        }
    }

    if (option.defaultCombo?.type) {
        const type = option.defaultCombo.type;
        const definition = registry.combo.get(type);
        if (definition?.options) {
            assign_option.defaultCombo = typeof definition.options === 'function' ? definition.options(type) : definition.options;
        }
    }

    dataMerge(assign_option, option);

    if (option.layout) {
        if (option.layout.type) assign_option.layout = getLayout(option.layout.type, option.layout);
    }

    assign_option.width = assign_option.width || graph_default_option.width;
    assign_option.height = assign_option.height || graph_default_option.height;

    assign_option.plugins = assign_option.plugins || [];
    let minimap;
    if (vmOption && vmOption.minimap) {
        minimap = getMinimap(G6);
        assign_option.plugins.push(minimap);
    }

    return {
        option: assign_option,
        minimap
    };
}

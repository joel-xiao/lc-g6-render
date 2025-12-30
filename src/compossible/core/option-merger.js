import { cloneDeep } from 'lodash';
import G6 from "@antv/g6";
import { graph_default_option } from './default-options';
import { getDefaultNode } from '../shapes/node/defaults';
import { getDefaultEdge } from '../shapes/edge/defaults';
import { getDefaultCombo } from '../shapes/combo/defaults';
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

    if (option.defaultNode) {
        if (option.defaultNode.type) assign_option.defaultNode = getDefaultNode(option.defaultNode.type);
    }

    if (option.defaultEdge) {
        if (option.defaultEdge.type) assign_option.defaultEdge = getDefaultEdge(option.defaultEdge.type);
    }

    if (option.defaultCombo) {
        if (option.defaultCombo.type) assign_option.defaultCombo = getDefaultCombo(option.defaultCombo.type);
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

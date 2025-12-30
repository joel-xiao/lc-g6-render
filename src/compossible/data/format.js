import { cloneDeep } from "lodash";

/**
 * 通用模型合并 - 纯数据操作
 * @param {Object} target - 目标模型
 * @param {Object} source - 源模型
 * @returns {Object} 合并后的模型
 */
export function mergeModel(target, source) {
    delete source.conflicting;
    
    // 合并 data 字段
    if (source.data && target.data) {
        for (let key of Object.keys(source.data)) {
            target.data[key] = source.data[key] ?? target.data[key];
        }
    }

    return target;
}

/**
 * 深拷贝
 */
export { cloneDeep };

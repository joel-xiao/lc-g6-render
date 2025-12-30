/**
 * 健康度图例插件
 * 通过 options.healthLegend 传入配置
 */

const ICON_PATH = '/g6-icons/';

// 默认图标
const DEFAULT_ICONS = {
    'normal': {
        'user': ICON_PATH + 'user.svg',
        'disabled': ICON_PATH + 'deleted.svg',
        'external': ICON_PATH + 'external.svg',
        'moved': ICON_PATH + 'moved.svg',
        'default': ICON_PATH + 'server-normal.svg',
    },
    'warning': {
        'default': ICON_PATH + 'server-warning.svg',
    },
    'abnormal': {
        'default': ICON_PATH + 'server-abnormal.svg',
    }
};

// 默认健康状态
function getDefaultHealthSettings(icons) {
    const base = { lineWidth: 3 };
    return {
        'normal': { ...base, stroke: '#00B42A', fill: '#E8FFEA', label: '健康', icon: icons.normal?.default, icons: icons.normal },
        'warning': { ...base, stroke: '#FF7D00', fill: '#FFF7E8', label: '警示', icon: icons.warning?.default, icons: icons.warning },
        'abnormal': { ...base, stroke: '#F53F3F', fill: '#FFECE8', label: '异常', icon: icons.abnormal?.default, icons: icons.abnormal },
        'external': { ...base, legend: false, stroke: '#0099FF', fill: '#F1FAFF', label: '外部服务', icon: icons.normal?.external },
        'user': { ...base, legend: false, stroke: '#0099FF', fill: '#F1FAFF', label: 'USER', icon: icons.normal?.user },
        'disabled': { ...base, legend: false, stroke: '#BCC4D0', fill: '#F5F7FA', label: '已删除', icon: icons.normal?.disabled, titleStyle: { color: '#999', bg: '#E3E6EB' } },
        'moved': { ...base, legend: false, stroke: '#BCC4D0', fill: '#F5F7FA', label: '已移动', icon: icons.normal?.moved, titleStyle: { color: '#999', bg: '#E3E6EB' } },
    };
}

// 默认 tooltip 状态
const DEFAULT_TOOLTIP_STATUS = {
    'deleted': { color: '#fff', bg: '#F53F3F', label: '已删除' },
    'no_permission': { color: '#fff', bg: '#F53F3F', label: '暂无权限' },
    'moved': { color: '#fff', bg: '#F53F3F', label: '已移动', desc: '该应用已配置至其他应用系统' }
};

const DEFAULT_NO_LOGIC_TYPES = ['disabled', 'moved', 'external', 'user'];

// 深度合并
function merge(target, source) {
    if (!source) return target;
    const result = { ...target };
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = merge(target[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

// 插件实例缓存
let _plugin = null;

/**
 * 初始化健康状态插件（通过 options.health 调用）
 */
export function initHealthPlugin(options = {}) {
    const icons = merge(DEFAULT_ICONS, options.icons);
    const health = merge(getDefaultHealthSettings(icons), options.settings);
    const tooltip = merge(DEFAULT_TOOLTIP_STATUS, options.tooltipStatus);
    const noLogicTypes = options.noLogicStatusTypes || DEFAULT_NO_LOGIC_TYPES;

    _plugin = { icons, health, tooltip, noLogicTypes };
    return _plugin;
}

/**
 * 获取健康状态配置
 */
export function getHealthSetting(nodeType) {
    const p = _plugin || initHealthPlugin();
    if (nodeType === '_all') return p.health;
    return p.health[nodeType] || p.health['normal'];
}

/**
 * 获取 tooltip 状态
 */
export function getTooltipStatus(itemModel) {
    const p = _plugin || initHealthPlugin();
    let type = itemModel.statusType;
    if (itemModel.is_deleted) type = 'deleted';
    if (itemModel.is_permission === false) type = 'no_permission';
    return p.tooltip[type];
}

/**
 * 判断是否为无逻辑状态类型
 */
export function noLogicStatusType(item) {
    const p = _plugin || initHealthPlugin();
    return p.noLogicTypes.includes(item.statusType);
}

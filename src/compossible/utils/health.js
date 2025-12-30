import { icons } from './icons';

export function getHealthSetting(nodeType) {
    const baseData = {
        lineWidth: 3,
    };

    const health = {
        'normal': {
            ...baseData,
            stroke: '#00B42A',
            fill: '#E8FFEA',
            label: '健康',
            icon: icons['normal']['default'],
            icons: icons['normal'],
            filterFn: (d) => {
                if (d.statusType === 'normal' || d.statusType === 'external' || d.statusType === 'user') return true;
                return false;
            },
        },
        'warning': {
            ...baseData,
            stroke: '#FF7D00',
            fill: '#FFF7E8',
            label: '警示',
            icon: icons['warning']['default'],
            icons: icons['warning'],
            filterFn: (d) => {
                if (d.statusType === 'warning') return true;
                return false;
            },
        },
        'abnormal': {
            ...baseData,
            stroke: '#F53F3F',
            fill: '#FFECE8',
            label: '异常',
            icon: icons['abnormal']['default'],
            icons: icons['abnormal'],
            filterFn: (d) => {
                if (d.statusType === 'abnormal') return true;
                return false;
            }
        },
        'external': {
            ...baseData,
            legend: false,
            stroke: '#0099FF',
            fill: '#F1FAFF',
            label: '外部服务',
            icon: icons['normal']['external'],
            filterFn: (d) => {
                if (d.statusType === 'external') return true;
                return false;
            }
        },
        'user': {
            ...baseData,
            legend: false,
            stroke: '#0099FF',
            fill: '#F1FAFF',
            label: 'USER',
            icon: icons['normal']['user'],
            filterFn: (d) => {
                if (d.statusType === 'user') return true;
                return false;
            }
        },

        'disabled': {
            ...baseData,
            legend: false,
            stroke: '#BCC4D0',
            fill: '#F5F7FA',
            titleStyle: {
                color: '#999999',
                bg: '#E3E6EB'
            },
            label: '已删除',
            icon: icons['normal']['disabled'],
            filterFn: (d) => {
                if (d.statusType === 'disabled') return true;
                return false;
            }
        },

        'moved': {
            ...baseData,
            legend: false,
            stroke: '#BCC4D0',
            fill: '#F5F7FA',
            titleStyle: {
                color: '#999999',
                bg: '#E3E6EB'
            },
            label: '已移动',
            icon: icons['normal']['moved'],
            filterFn: (d) => {
                if (d.statusType === 'moved') return true;
                return false;
            }
        }
    };
    if (nodeType === '_all') return health;
    return health[nodeType] || health['normal'];
}


export function getTooltipStatus(itemModel) {
    const tooltipStatus = {
        'deleted': {
            color: '#fff',
            bg: '#F53F3F',
            label: '已删除'
        },

        'no_permission': {
            color: '#fff',
            bg: '#F53F3F',
            label: '暂无权限'
        },

        'moved': {
            color: '#fff',
            bg: '#F53F3F',
            label: '已移动',
            desc: '该应用已配置至其他应用系统'
        }
    }

    let status_type = itemModel.statusType;
    if (itemModel.is_deleted === true) status_type = 'deleted';
    if (itemModel.is_permission === false) status_type = 'no_permission';

    return tooltipStatus[status_type];
}

export function noLogicStatusType(item) {
    return item.statusType === 'disabled' || item.statusType === 'moved' || item.statusType === 'external' || item.statusType === 'user';
}

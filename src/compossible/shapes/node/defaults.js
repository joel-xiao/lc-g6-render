export function getDefaultNode(type) {
    const defaultData = {
        'node-icon': {
            type: "node-icon",
            statusType: 'normal',
            shape: 'hexagonal-polygon',
            size: 70,
            style: {
                lineWidth: 3
            },
            center: {
                show: true,
                text: undefined
            },

            rightTop: {
                show: true,
            },

            rightBottom: {
                show: true,
            }
        },
    }
    return defaultData[type || 'node-icon'];
}

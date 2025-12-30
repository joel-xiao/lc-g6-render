export default function getDefaultNode(type) {
    const defaults = {
        'node-icon': {
            type: "node-icon",
            title: '--',
            label: '', // 禁用 G6 默认的 label 显示
            size: 70,
            style: {
                fill: '#fff',
                stroke: '#fff',
                lineWidth: 1,
                radius: 5,
            },
            // 文本配置
            labelCfg: {
                style: {
                    fill: '#fff',
                    fontSize: 12,
                    opacity: 0, // 隐藏默认 label
                },
            },
            // 连接桩配置
            linkPoints: {
                top: true,
                right: true,
                bottom: true,
                left: true,
                size: 5,
                fill: '#fff',
                stroke: '#1890FF',
            },
            // 图标配置
            icon: {
                show: true,
                // img: '...',
                width: 40,
                height: 40,
            },
            // 状态样式
            stateStyles: {
                hover: {
                    cursor: 'pointer',
                    opacity: 0.8,
                },
                selected: {
                    stroke: '#1890FF',
                    lineWidth: 2,
                },
            },
        }
    };
    return defaults[type || 'node-icon'];
}

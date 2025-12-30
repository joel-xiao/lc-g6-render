import { getHealthSetting } from '../../../plugins/health-legend';

export default {
    name: 'node-icon',
    getIcon(cfg, style) {
        const health = getHealthSetting(cfg.statusType);
        return style?.icon || cfg.icon || health?.icon;
    },

    getCfg(cfg, style) {
        let icon = this.getIcon(cfg, style);

        return {
            icon,
        }
    },

    getName(suffix) {
        return suffix ? this.name + '-' + suffix : this.name;
    },

    add({ group, cfg, style }) {
        if (!cfg.showIcon || !this.getIcon(cfg, style)) return;
        const icon_size = cfg.size - 30;

        const healths = getHealthSetting('_all');
        const statusTypes = Object.keys(healths);
        const legendStatusTypes = statusTypes.filter(key => healths[key].legend !== false);
        if (legendStatusTypes.some(key => cfg.statusType === key)) {
            for (let key of legendStatusTypes) {
                const { icon } = this.getCfg(cfg, healths[key]);
                group.addShape('image', {
                    attrs: {
                        x: -icon_size / 2,
                        y: -icon_size / 2,
                        height: icon_size,
                        width: icon_size,
                        img: icon,
                        opacity: cfg.statusType === key ? 1 : 0,
                    },
                    name: this.getName(key),
                    'event-name': 'node-main',
                    'tooltip-event': true,
                    draggable: true,
                });
            }
        } else {
            const { icon } = this.getCfg(cfg, style);
            group.addShape('image', {
                attrs: {
                    x: -icon_size / 2,
                    y: -icon_size / 2,
                    height: icon_size,
                    width: icon_size,
                    img: icon,
                },
                name: this.getName(),
                'event-name': 'node-main',
                'tooltip-event': true,
                draggable: true,
            });
        }
    },

    async update(item, cfg) {
        const group = item.get('group');
        const children = group.get('children');
        for (let shape of children) {
            if (shape.get('name').startsWith(this.getName() + '-')) {
                if (shape.get('name') === this.getName(cfg.statusType)) {
                    shape.attr('opacity', 1);
                } else {
                    shape.attr('opacity', 0);
                }
            }
        }
    },
}

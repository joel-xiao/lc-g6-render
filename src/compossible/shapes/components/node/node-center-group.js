import { fittingString } from '../../../utils/text';

export default {
    name: 'node-center-group',
    getCfg() {
        return {
            centerNumber: {
                fill: '#333',
                fontSize: 20
            }
        }
    },

    add(G6, { group, cfg, style }) {
        const that_cfg = this.getCfg();
        // Center Number
        let centerNumberShape;
        if (cfg?.data?.center_number !== undefined && cfg?.center?.show) {
            const center_number_text = (cfg?.data?.center_number || 0) + '';
            centerNumberShape = group.addShape('text', {
                attrs: {
                    text: fittingString(G6, center_number_text, cfg.size, that_cfg.centerNumber.fontSize),
                    x: 0,
                    y: 0,
                    fontSize: that_cfg.centerNumber.fontSize,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    textBaseline: "middle",
                    fill: style.stroke || that_cfg.centerNumber.fill,
                },
                name: this.name + '-number',
                'event-name': 'node-main-center-group',
                draggable: true,
            });
        }

        // Circle Text
        if (cfg?.center?.show) {
            const label_fontSize = 12;
            const circle_text = cfg?.center.text;
            const center_icon = cfg?.center.icon || cfg.icon || style.icon;

            // 只有在有Icon or 文本，才将数量向下偏移
            if ((center_icon && cfg?.center.showIcon) || circle_text) {
                // center number
                if (centerNumberShape) centerNumberShape.attrs.y = 14;
            }

            if (cfg?.center.showIcon) {
                // 图标
                const icon_size = cfg.size / 2;
                group.addShape('image', {
                    attrs: {
                        x: -icon_size / 2,
                        y: -icon_size / 1.1,
                        height: icon_size,
                        width: icon_size,
                        img: center_icon,
                    },
                    name: this.name + '-icon',
                    'event-name': 'node-main-center-group',
                    'tooltip-event': true,
                    draggable: true,
                });

            } else {
                // 文本名称
                group.addShape('text', {
                    attrs: {
                        text: fittingString(G6, circle_text, cfg.size, label_fontSize),
                        x: 0,
                        y: -label_fontSize,
                        fontSize: label_fontSize,
                        textAlign: 'center',
                        textBaseline: "middle",
                        fill: '#333',
                    },
                    name: this.name + '-text',
                    'event-name': 'node-main-center-group',
                    'tooltip-event': true,
                    draggable: true,
                });
            }
        }
    },

    update(G6, item, cfg, style) {
        const that_cfg = this.getCfg();
        const group = item.get('group');
        const group_children = group.get('children');
        group_children.forEach(shape => {
            if (shape.get('name') === this.name + '-number') {
                const center_number_text = (cfg?.data?.center_number || 0) + '';
                shape.attr('text', fittingString(G6, center_number_text, cfg.size, that_cfg.centerNumber.fontSize));
                shape.attr('fill', style.stroke || that_cfg.centerNumber.fill);
            }
        });
    },

    hide(item) {
        const group = item.get('group');
        const group_children = group.get('children');
        group_children.forEach(shape => {
            if (shape.get('name').includes(this.name)) {
                shape.attr('opacity', 0);
            }
        });
    },

    show(item) {
        const group = item.get('group');
        const group_children = group.get('children');
        group_children.forEach(shape => {
            if (shape.get('name').startsWith(this.name)) {
                shape.attr('opacity', 1);
            }
        });
    },
}

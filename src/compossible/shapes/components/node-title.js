import { fittingStringRows, getRectSize } from '../../utils/text';

export default {
    name: 'node-title',
    add(G6, { group, cfg, style, position = 'bottom' }) {
        const name = position + '-' + this.name;
        const fontSize = 12;
        const padding = 10;
        const maxWidth = (cfg.size * 2) - (padding * 2);
        const marginBottom = 12;
        const text = fittingStringRows(G6, cfg.title || cfg.label, maxWidth, fontSize) || '--';
        const text_size = getRectSize(G6, text, maxWidth, fontSize);
        const height = text.includes('\n') ? 40 : 20;
        const pos = {
            x: 0,
            y: (cfg.size / 2) + marginBottom,
        };
        const titleGroup = group.addGroup({ name: name + '-group' });
        titleGroup.addShape('rect', {
            attrs: {
                x: (-text_size[0] / 2) - padding,
                y: pos.y,
                fontSize: fontSize,
                fill: style?.titleStyle?.bg || '#CFD9E3',
                width: text_size[0] + (padding * 2),
                height: height,
                radius: 3,
                cursor: '',
            },
            name: name + '-rect',
            'event-name': 'node-title',
        });

        titleGroup.addShape('text', {
            attrs: {
                text,
                x: 0,
                y: pos.y + fontSize + 4.5 + (height - 20),
                fontSize: fontSize,
                lineHeight: 20,
                textAlign: 'center',
                fill: style?.titleStyle?.color || '#000000',
                cursor: '',
            },
            name: name + '-text',
            'event-name': 'node-title',
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
            if (shape.get('name').includes(this.name)) {
                shape.attr('opacity', 1);
            }
        });
    },

    getRectShape(item) {
        let group = item.get('group');
        const group_children = group.get('children');
        group = group_children.find(shape => shape.get('name').includes(this.name + '-group'));
        return group.get('children').find(shape => shape.get('name').includes(this.name + '-rect'));
    }
}

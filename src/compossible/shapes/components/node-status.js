import { fittingString } from '../../utils/text';

export default {
    name: 'node-status',
    add(G6, { group, cfg, status, position }) {
        if (!status) return;

        position = position || 'right-top';
        const name = this.name + '-' + position + '-group';

        let fontSize = 12;
        const label_text = (status.label || '') + '';
        const labelSize = G6.Util.getTextSize(label_text, 12);

        const lineWidth = 1.5
        const rect_size = 16;
        let padding = 3;
        labelSize[0] = labelSize[0];
        if (labelSize[0] < rect_size) {
            padding = 0;
            labelSize[0] = rect_size;
        }
        if (labelSize[1] < rect_size) labelSize[1] = rect_size;

        const posSetting = {
            'right-top': {
                x: (cfg.size / 2) - (labelSize[0] * 0.8),
                y: (-cfg.size / 2) - (labelSize[1] * 0.5)
            },
        };

        const pos = posSetting[position];

        const labelGroup = group.addGroup({ name });
        labelGroup.addShape('rect', {
            attrs: {
                fill: status.bg,
                x: pos.x - padding,
                y: pos.y,
                width: labelSize[0] + (padding * 2),
                height: labelSize[1],
                lineWidth: lineWidth,
                radius: 3,
            },
            name: name + '-rect',
            draggable: true
        });

        labelGroup.addShape('text', {
            attrs: {
                text: fittingString(G6, label_text, labelSize[0], fontSize, ''),
                x: pos.x + (labelSize[0] / 2),
                y: pos.y + (labelSize[1] / 2),
                fontSize: fontSize,
                textAlign: 'center',
                textBaseline: "middle",
                fill: status.color,
            },
            name: name + '-text',
            draggable: true,
        });
    },
}

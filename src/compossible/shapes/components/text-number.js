import { fittingString } from '../../utils/text';

export default {
    add(G6, { group, cfg, style, data, position }) {
        position = position || 'right-top';
        const name = position + '-group';

        let fontSize = 12;
        const number_text = (data?.number || 0) + '';
        const numberSize = G6.Util.getTextSize(number_text, 12);

        const lineWidth = 1.5
        const rect_size = 16;
        let padding = 4;
        numberSize[0] = numberSize[0] + 4;
        if (numberSize[0] < rect_size) {
            padding = 0;
            numberSize[0] = rect_size;
        }
        if (numberSize[1] < rect_size) numberSize[1] = rect_size;

        const posSetting = {
            'right-top': {
                x: (cfg.size / 2) - (cfg.size * 0.12) - ((rect_size + lineWidth * 2) * 0.5),
                y: (-cfg.size / 2) + (cfg.size * 0.12) - ((rect_size + lineWidth * 2) * 0.5)
            },
            'right-bottom': {
                x: (cfg.size / 2) - (cfg.size * 0.12) - ((rect_size + lineWidth * 2) * 0.5),
                y: (-cfg.size / 2) + (cfg.size * 0.88) - ((rect_size + lineWidth * 2) * 0.5)
            },
        };

        const pos = posSetting[position];

        const numberGroup = group.addGroup({ name });
        numberGroup.addShape('rect', {
            attrs: {
                fill: style.fill,
                stroke: style.stroke,
                x: pos.x - padding,
                y: pos.y,
                width: numberSize[0] + (padding * 2),
                height: numberSize[1],
                lineWidth: lineWidth,
                radius: rect_size / 2
            },
            name: name + '-rect',
            draggable: true
        });

        numberGroup.addShape('text', {
            attrs: {
                text: fittingString(G6, number_text, numberSize[0], fontSize, ''),
                x: pos.x + (numberSize[0] / 2),
                y: pos.y + (numberSize[1] / 2),
                fontSize: fontSize,
                textAlign: 'center',
                textBaseline: "middle",
                fill: style.stroke,
            },
            name: name + '-text',
            draggable: true,
        });
    },
}

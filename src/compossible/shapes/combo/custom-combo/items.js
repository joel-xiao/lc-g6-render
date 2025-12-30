
import G6 from "@antv/g6";
import { fittingString, getRectSize } from '../../utils/text';
import { getHealthSetting } from '../../utils/health';
import { getComponent } from '../../items/index';

export function getComboShape(name) {
    const shape = {
        'combo-keyShape': {
            name: 'combo-keyShape',
            getCfg(cfg, style, change_type) {
                const data = {
                    width: style.width,
                    height: style.height,
                    style: {
                        fill: cfg.fill,
                        stroke: cfg.stroke,
                    },

                    pos: {
                        x: 0,
                        y: 0,
                    }
                };

                // 当被切换时则相加padding
                data.width = data.width + (cfg.padding[3] + cfg.padding[1]);
                data.height = data.height + (cfg.padding[0] + cfg.padding[2]);

                data.pos = {
                    x: -data.width / 2 - (cfg.padding[3] - cfg.padding[1]) / 2,
                    y: -data.height / 2 - (cfg.padding[0] - cfg.padding[2]) / 2,
                }

                return data;
            },

            add(G6, { group, cfg, style }) {
                const that_cfg = this.getCfg(cfg, style);
                return group.addShape('rect', {
                    attrs: {
                        ...style,
                        ...that_cfg.pos,
                        width: that_cfg.width,
                        height: that_cfg.height,
                        fill: that_cfg.style.fill,
                        stroke: that_cfg.style.stroke,
                        lineDash: [3],
                        radius: 3,

                    },
                    draggable: true,
                    name: this.name,
                });
            },

            getShape(combo) {
                const group = combo.get('group');
                return group.find((ele) => ele.get('name') === this.name);
            },

            update(combo, { cfg, style }, cb) {
                const that_cfg = this.getCfg(cfg, style, 'update');
                const shape = this.getShape(combo);

                cb?.();
            },

            hide(combo) {
                const shape = this.getShape(combo);
                if (!shape) return;
                shape.attr('strokeOpacity', 0);
                shape.attr('fillOpacity', 0);

                const group = combo.get('group');
                const group_children = group.get('children');
                group_children.forEach(shape => {
                    if (shape.get('name') !== 'text-shape') return;
                    shape.attr('strokeOpacity', 0);
                    shape.attr('fillOpacity', 0);
                });
            },

            show(combo) {
                const shape = this.getShape(combo);
                if (!shape) return;
                shape.attr('strokeOpacity', 1);
                shape.attr('fillOpacity', 1);

                const group = combo.get('group');
                const group_children = group.get('children');
                group_children.forEach(shape => {
                    if (shape.get('name' !== 'text-shape')) return;
                    shape.attr('strokeOpacity', 1);
                    shape.attr('fillOpacity', 1);
                });
            }
        },

        'combo-header': {
            name: 'combo-header',
            add(G6, { group, cfg }) {
                const header = cfg.header;
                if (!header?.show) return;

                const header_name = this.name;
                const headerGroup = group.addGroup({ name: header_name + '-group' });

                // Header Background
                headerGroup.addShape('rect', {
                    attrs: {
                        x: cfg.x,
                        y: cfg.y,
                        width: cfg.style.width,
                        height: 28,
                        fill: header?.style.fill,
                    },
                    draggable: true,
                    name: header_name + '-rect',
                });

                // Header Left Label
                headerGroup.addShape('text', {
                    attrs: {
                        text: '',
                        x: cfg.x,
                        y: cfg.y,
                        textAlign: 'left',
                        height: 28,
                        width: 0,
                        fill: header?.style.stroke

                    },
                    'text-tooltip': true,
                    draggable: true,
                    name: header_name + '-label',
                });

                // Header Right Number
                let rights = [...(cfg?.header?.rights || [])];
                rights = rights.reverse();
                rights.forEach((item, idx) => {
                    const rightGroup = headerGroup.addGroup({ name: header_name + '-right-group-' + idx });

                    rightGroup.addShape('circle', {
                        attrs: {
                            r: 4,
                            x: cfg.x,
                            y: cfg.y,
                            fill: item.fill || header?.style.stroke
                        },
                        draggable: true,
                        name: header_name + '-circle-' + idx,
                    });

                    rightGroup.addShape('text', {
                        attrs: {
                            text: '',
                            x: cfg.x,
                            y: cfg.y,
                            textAlign: 'right',
                            height: 28,
                            width: 0,
                            fill: item.fill || header?.style.stroke
                        },
                        draggable: true,
                        name: header_name + '-number-' + idx,
                    });
                });
            },

            update(combo, { cfg, keyShape }, cb) {
                const group = combo.get('group');
                if (!group) return;
                const that = this;
                const header_name = this.name;
                setTimeout(() => {
                    setShapeRect();
                });

                function setShapeRect() {
                    const headerGroup = group.find((ele) => ele.get('name') === 'combo-header-group');
                    if (!headerGroup) return;

                    const headerRect = headerGroup.find(ele => ele.get('name') === 'combo-header-rect');
                    const headerLabelShape = group.find((ele) => ele.get('name') === 'combo-header-label');

                    if (!cfg.collapsed) {
                        const padding = 10;

                        // Header Rect
                        headerRect.attr({
                            x: keyShape.attr('x'),
                            y: keyShape.attr('y'),
                            width: keyShape.attr('width')
                        });

                        // Header Right Number
                        let rights = [...(cfg?.header?.rights || [])];
                        rights = rights.reverse();
                        const row_w = 10;
                        let rights_width = 0;
                        rights.forEach((item, idx) => {
                            const rightGroup = group.find((ele) => ele.get('name') === header_name + '-right-group-' + idx)
                            const rightTextShape = rightGroup.find((ele) => ele.get('name') === header_name + '-number-' + idx);
                            const text = (item?.label || "--") + ': ' + (cfg?.data?.[item.key] || 0);
                            const size = 12;
                            const textSize = getRectSize(G6, text, 140, size);
                            rightTextShape.attr('text', text);
                            rightTextShape.attr('width', textSize[0]);
                            rightTextShape.attr('y', keyShape.attr('y') + (padding * 2));
                            rightTextShape.attr('x', keyShape.attr('x') + (keyShape.attr('width') - padding) - rights_width);
                            rights_width += Number(rightTextShape.attr('width')) + row_w;

                            const rightCircleShape = rightGroup.find((ele) => ele.get('name') === header_name + '-circle-' + idx);
                            const circle_w = rightCircleShape.attr('r') * 2;
                            rightCircleShape.attr('y', keyShape.attr('y') + (padding * 2) - (size - (circle_w / 2) - 2));
                            rightCircleShape.attr('x', keyShape.attr('x') + (keyShape.attr('width') - padding) - rights_width);
                            rights_width += circle_w + row_w;
                        });

                        // Header Label
                        let mainWidth = keyShape.attr('width');
                        const labelMaxWidth = mainWidth - (padding * 3) - rights_width;
                        const labelFontSize = 12;
                        const labelText = cfg.title || '';
                        const labelWidth = getRectSize(G6, labelText, labelMaxWidth, labelFontSize)[0];
                        headerLabelShape.attr('text', fittingString(G6, labelText, labelWidth, labelFontSize));
                        headerLabelShape.attr('y', keyShape.attr('y') + (padding * 2));
                        headerLabelShape.attr('x', keyShape.attr('x') + padding);
                    }

                    // CallBack
                    cb?.();
                }
            },

            hide(combo, { cfg, keyShape }) {
                const group = combo.get('group');
                const headerGroup = group.find((ele) => ele.get('name') === 'combo-header-group');
                headerGroup?.attr('opacity', 0);
            },

            show(combo, { cfg, keyShape }) {
                const group = combo.get('group');
                const headerGroup = group.find((ele) => ele.get('name') === 'combo-header-group');
                headerGroup?.attr('opacity', 1);
            }
        },

        'combo-collapsed': getComponent('combo-collapsed'),

        'combo-none-data': getComponent('combo-none-data'),
    }

    return shape[name];
}

export function getComboMethods(name) {
    const data = {
        'custom-combo': {
            getCfg(cfg) {
                return cfg;
            }
        }
    }

    return data[name];
}

import G6 from "@antv/g6";
import { getHealthSetting } from '../../utils/health';
import { getComboShape, getComboMethods } from './items';
import { getComponent } from '../../components/index';
import defaults from './options';

export { getComboShape, getComboMethods, defaults };

const CustomCombo = {
    register: 'rect',
    combo: {
        getAnchorPoints() {
            return [
                [0.5, 0],
                [0.5, 1],
            ]
        },

        drawShape: function drawShape(cfg, group) {
            const self = this;
            const style = self.getShapeStyle(cfg);

            // Get Config
            cfg = getComboMethods('custom-combo').getCfg(cfg);

            // Combo Key Shape
            const shape = getComboShape('combo-keyShape').add(G6, { group, cfg, style });

            // Header
            getComboShape('combo-header').add(G6, { group, cfg });

            // Expand
            getComboShape('combo-collapsed').add(G6, { group, cfg });

            // NODATA
            getComboShape('combo-none-data').add(G6, { group, cfg });

            // ============ Collapsed - Start ============

            const status = getHealthSetting(cfg.statusType) || cfg;

            // Add Halo
            getComponent('state-halo').add('hexagonal-polygon', { cfg, group, style: status });

            // Main Shape
            getComponent('main-shape').add('hexagonal-polygon', { cfg, group, style: status });

            // Center Number
            getComponent('node-center-group').add(G6, { cfg, group, style: status });

            // Title
            getComponent('node-title').add(G6, { cfg, group, style: status });

            // ============ Collapsed - End ============

            return shape;
        },

        afterUpdate: function afterUpdate(cfg, combo) {
            const self = this;
            const style = self.getShapeStyle(cfg);
            const keyShape = getComboShape('combo-keyShape').getShape(combo);

            if (cfg.collapsed) {
                if (!cfg.normal_padding) cfg.normal_padding = cfg.padding;
                const titleShape = getComponent('node-title').getRectShape(combo);
                cfg.padding = [0, 0, titleShape ? titleShape.attr('height') + 10 : 0, 0];
            } else {
                cfg.padding = cfg.normal_padding || cfg.padding;
            }

            // NODATA
            getComboShape('combo-none-data').update(combo, { cfg, keyShape });

            // Add Halo
            getComponent('state-halo').hide(combo);
            // Main Shape
            getComponent('main-shape').hide(combo);
            // Node Center
            getComponent('node-center-group').hide(combo);
            // Node Title
            getComponent('node-title').hide(combo);

            // Combo Key Shape
            getComboShape('combo-keyShape').hide(combo, { cfg, keyShape });
            // Header
            getComboShape('combo-header').hide(combo, { cfg, keyShape });
            // Expand
            getComboShape('combo-collapsed').hide(combo, { cfg });


            let timer = 200;

            clearTimeout(cfg.after_update_timer);
            cfg.after_update_timer = setTimeout(() => {
                // Get Config
                cfg = getComboMethods('custom-combo').getCfg(cfg);

                if (cfg.collapsed) {
                    // Add Halo
                    getComponent('state-halo').show(combo);
                    // Main Shape
                    getComponent('main-shape').show(combo);
                    // Node Center
                    getComponent('node-center-group').show(combo);
                    // Node Title
                    getComponent('node-title').show(combo);

                } else {
                    // Combo Key Shape
                    getComboShape('combo-keyShape').show(combo, { cfg, keyShape });
                    // Header
                    getComboShape('combo-header').show(combo, { cfg, keyShape });
                }

                // Combo Key Shape
                getComboShape('combo-keyShape').update(combo, { cfg, keyShape, style });
                // Header
                getComboShape('combo-header').update(combo, { cfg, keyShape }, () => {
                    // Expand
                    getComboShape('combo-collapsed').show(combo, { cfg });
                    getComboShape('combo-collapsed').update(combo, { cfg, keyShape });
                });

                clearTimeout(cfg.after_update_timer);
            }, timer);
        },

        setState(name, value, item) {
            const model = item.getModel();
            if (name === 'statusType') {
                const status = getHealthSetting(model.statusType) || model;
                getComponent('state-halo').update(item, model, status);
                getComponent('main-shape').update(item, model, status);
                getComponent('node-center-group').update(G6, item, model, status);
                // Icon
                getComponent('node-icon').update(item, model, status);
            }

            if (name === 'node-active') {
                getComponent('state-halo').setState(item, { name, value });
            }

            // 置灰 or 非置灰
            // Passing g6_example needs to be handled via closure or this context
            const graph = item.get('graph');
            const g6_example = item.get('g6_example') || this.g6_example || (graph ? { caching: graph.get('caching') } : null); // Fallback

            if (g6_example) {
                getComponent('group').disabled(g6_example, item, name, value);
            }
        },
    }
};

export default CustomCombo;

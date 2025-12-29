import G6 from "@antv/g6";
import { fittingString, getRectSize, getHealthSetting } from './util'

import { getComboShape, getComboMethods } from './register-combo-methods'
import { getShape, getAnchorPoints } from './register-shape-methods'

export function getRegisterCombo(g6_example) {
  const registerCombo = {
    'custom-combo': {
      register: 'rect',
      combo: {
        // getAnchorPoints: function (...args) {
        //   getAnchorPoints('center').getNodeAnchorPoints(...args,  g6_graph);
        // },

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
          const shape = getComboShape('combo-keyShape').add(G6, {group, cfg, style});
  
          // Header
          getComboShape('combo-header').add(G6, {group, cfg});
  
          // Expand
          getComboShape('combo-collapsed').add(G6, {group, cfg});
  
          // NODATA
          getComboShape('combo-none-data').add(G6, {group, cfg});
  
          // ============ Collapsed - Start ============
          
          const status = getHealthSetting(cfg.statusType) || cfg;
    
          // Add Halo
          getShape('state-halo').add('hexagonal-polygon', {cfg, group, style: status});
  
          // Main Shape
          getShape('main-shape').add('hexagonal-polygon', {cfg, group, style: status});
  
          // Center Number
          getShape('node-center-group').add(G6, {cfg, group, style: status});
  
          // Title
          getShape('node-title').add(G6, {cfg, group, style: status});
  
          // ============ Collapsed - End ============
  
          return shape;
        },
  
        afterUpdate: function afterUpdate(cfg, combo) {
          const self = this;
          const style = self.getShapeStyle(cfg);
          const keyShape = getComboShape('combo-keyShape').getShape(combo);
  
          if (cfg.collapsed) {
            if (!cfg.normal_padding) cfg.normal_padding = cfg.padding;
            const titleShape = getShape('node-title').getRectShape(combo);
            cfg.padding = [0, 0, titleShape ? titleShape.attr('height') + 10 : 0 , 0];
          } else {
            cfg.padding = cfg.normal_padding || cfg.padding;
          }
  
          // NODATA
          getComboShape('combo-none-data').update(combo, {cfg, keyShape});
  
          // Add Halo
          getShape('state-halo').hide(combo);
          // Main Shape
          getShape('main-shape').hide(combo);
          // Node Center
          getShape('node-center-group').hide(combo);
          // Node Title
          getShape('node-title').hide(combo);

          // Combo Key Shape
          getComboShape('combo-keyShape').hide(combo, {cfg, keyShape});
          // Header
          getComboShape('combo-header').hide(combo, {cfg, keyShape});
          // Expand
          getComboShape('combo-collapsed').hide(combo, {cfg});
  
  
          let timer = 200;
  
          clearTimeout(cfg.after_update_timer);
          cfg.after_update_timer = setTimeout(() => {
            // Get Config
            cfg = getComboMethods('custom-combo').getCfg(cfg);
  
            if (cfg.collapsed) {
              // Add Halo
              getShape('state-halo').show(combo);
              // Main Shape
              getShape('main-shape').show(combo);
              // Node Center
              getShape('node-center-group').show(combo);
              // Node Title
              getShape('node-title').show(combo);
    
            } else {
            // Combo Key Shape
              getComboShape('combo-keyShape').show(combo, {cfg, keyShape});
              // Header
              getComboShape('combo-header').show(combo, {cfg, keyShape});
            }
          
            // Combo Key Shape
            getComboShape('combo-keyShape').update(combo, {cfg, keyShape, style});
            // Header
            getComboShape('combo-header').update(combo, {cfg, keyShape}, () => {
              // Expand
              getComboShape('combo-collapsed').show(combo, {cfg});
              getComboShape('combo-collapsed').update(combo, {cfg, keyShape});
            });
  
            clearTimeout(cfg.after_update_timer);
          }, timer);
        },
  
        setState(name, value, item) {
          const model = item.getModel();
          if (name === 'statusType') {
            const status = getHealthSetting(model.statusType) || model;
            getShape('state-halo').update(item, model, status);
            getShape('main-shape').update(item, model, status);
            getShape('node-center-group').update(G6, item, model, status);
            // Icon
            getShape('node-icon').update(item, model, status);
          }
          
          if (name === 'node-active') {
            getShape('state-halo').setState(item, {name,value});
          }
  
          // 置灰 or 非置灰
          getShape('group').disabled(g6_example, item, name, value);
        },
      }
    },
  }

  return registerCombo;
}

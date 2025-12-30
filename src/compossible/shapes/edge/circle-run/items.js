import { getComponent } from '../../items/index';

// Helper Map
const edgeShapes = {
    'group': {
        setState(item, { name, value }) {
            const model = item.getModel();
            const keyShape = item.get('keyShape');
            const endArrowShape = keyShape.cfg.endArrowShape;
            // event 聚焦事件相关处理
            const name_list = ['active', 'selected'];
            if (name_list.some(key => key === name)) {
                if (value) {
                    keyShape.attr('stroke', model.style[name].stroke);
                    endArrowShape?.attr('fill', model.style[name].endArrow.fill);
                } else {
                    if (!name_list.some(key => model[key])) {
                        keyShape.attr('stroke', model.style.stroke);
                        endArrowShape?.attr('fill', model.style.endArrow.fill);
                    }
                }
            }
        }
    },

    'state-halo': getComponent('state-halo'),

    'path-running': getComponent('path-running'),

    'loop-edge': getComponent('loop-edge')
};

export function getEdgeShape(name) {
    return edgeShapes[name];
}

import { getComponent } from '../components/index';
import { getEdgeShape } from './items';

export function getCommonEdge(edge_type, g6_example) {
    const commonEdge = {
        'circle-run': {
            afterDraw(cfg, group) {
                const style = cfg.style?.running;
                getEdgeShape('state-halo').add({ cfg, group, style });
                getEdgeShape('path-running').add('circle', { cfg, group, style });
            },

            setState(name, value, item) {
                const model = item.getModel();

                // 置灰 or 非置灰 (Using general component group)
                getComponent('group').disabled(g6_example, item, name, value);

                const style = model.style?.running;
                getEdgeShape('state-halo').setState(item, { style, name, value });
                getEdgeShape('path-running').setState(item, { style, name, value });
                if (model.running) return;

                // Edge specific group
                getEdgeShape('group').setState(item, { style, name, value });
            },
        }
    }

    return commonEdge[edge_type];
}

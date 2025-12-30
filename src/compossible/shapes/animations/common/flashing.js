import { isNotAnimate } from '../utils';

export default {
    start(runShape, item) {
        if (isNotAnimate(item.get('graph'))) return;

        if (runShape.get('animate-flashing')) return;
        runShape.set('animate-flashing', true);
        const model = item.getModel();

        model.shape_animate = model.shape_animate || new WeakMap();
        model.shape_animate.set(runShape, runShape);
        runShape.animate({
            onFrame(ratio) {
                const opacity = Math.sin(ratio * Math.PI);
                return {
                    opacity: opacity
                };
            },
            repeat: true
        }, 2000, 'easeCubic', null, 0);
    },

    stop(runShape, item) {
        const model = item.getModel();
        model.shape_animate && model.shape_animate.delete(runShape);
        runShape.stopAnimate();
        runShape.set('animate-flashing', false);
    }
};

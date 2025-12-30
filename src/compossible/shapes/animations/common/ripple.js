import { isNotAnimate } from '../utils';

export default {
    start(runShape, item) {
        if (isNotAnimate()) return;

        if (runShape.get('animate-ripple')) return;
        runShape.set('animate-ripple', true);
        const model = item.getModel();

        model.shape_animate = model.shape_animate || new WeakMap();
        model.shape_animate.set(runShape, runShape);
        runShape.animate({
            lineWidth: runShape.get('shape-size') + 24,
            opacity: 0.1,
        },
            {
                duration: 3000,
                easing: 'easeCubic',
                delay: (runShape.get('index') || 0) * 1000,
                repeat: true, // repeat
            });
    },

    stop(runShape, item) {
        const model = item.getModel();
        model.shape_animate && model.shape_animate.delete(runShape);
        runShape.stopAnimate();
        runShape.attr('lineWidth', runShape.get('shape-size'));
        runShape.set('animate-ripple', false);
    }
};

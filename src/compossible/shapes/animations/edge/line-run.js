import { isNotAnimate } from '../utils';

export default {
    start(runShape, { keyShape }) {
        if (isNotAnimate()) return;

        runShape.animate(
            (ratio) => {
                const tmpPoint = keyShape.getPoint(ratio);
                return {
                    x: tmpPoint.x,
                    y: tmpPoint.y,
                };
            },
            {
                repeat: true,
                duration: 2000,
            },
        );
    },

    stop(runShape) {
        runShape.stopAnimate();
    }
};

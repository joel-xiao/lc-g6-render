export function isNotAnimate() {
  const is = window.getGlobalConfig('g_g6_topo_animate');
  return is === false;
}

export function isAnimate() {
  return !isNotAnimate();
}

export function getShapeAnimate(name) {
  const data = {
    'from-to': {
      start(runShape, {keyShape}){
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
    },

    'flashing': {
      start(runShape, item) {
        if (isNotAnimate()) return;

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
    },

    'ripple': {
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
    }
  }

  return data[name];
}

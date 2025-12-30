import flashing from './common/flashing';
import ripple from './common/ripple';
import lineRun from './edge/line-run';

const animations = {
    'flashing': flashing,
    'ripple': ripple,
    'from-to': lineRun, // Alias 'from-to' to line-run for backward compatibility
    'line-run': lineRun
};

export function getAnimation(name) {
    return animations[name];
}

export * from './utils';

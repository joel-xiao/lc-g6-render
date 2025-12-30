import G6 from "@antv/g6";
// import { getAnchorPoints } from '../utils' // If needed

export default function getDefaultEdge(type) {
    // const point = getAnchorPoints('center').getEdgeAnchorPoints({
    //   size: 70,
    //   lineWidth: 2,
    //   offset: 8,
    // });

    const baseStyle = {
        loopCfg: {
            position: 'left',
            dist: 100,
            clockwise: false,
            pointPadding: 15,
        },

        lineWidth: 2,
        stroke: "#6AC9FF",
        startArrow: {
            path: G6.Arrow.triangle(0, 0, 4),
            d: 4,
        },
        endArrow: {
            path: G6.Arrow.triangle(5, 5, 4),
            d: 4,
            fill: "#6AC9FF",
        },

        active: {
            stroke: "#0066FF",
            endArrow: {
                fill: '#0066FF'
            }
        },

        selected: {
            stroke: "#0066FF",
            endArrow: {
                fill: '#0066FF'
            }
        },

        running: {
            stroke: "#0066FF",
            endArrow: {
                fill: '#0066FF'
            },
        }
    };

    return {
        type: type || 'cubic-v-circle-run',
        style: baseStyle
    };
}

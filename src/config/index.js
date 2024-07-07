export const clockConfig = {
  text: 'SITE',
  tickColor: '#004028',
  ticksNum: 20,
  redius: 3,
  movingTicksNum: 5,
  tickDimension: {
    x: 0.4,
    y: 1,
    z: 0.9,
  },
  tickColorsGradient: ['#004028', '#2D654A', '#538C6F', '#70AA8C', '#7BB597'],
};

const width = clockConfig.redius * 2 + clockConfig.tickDimension.y;
const height = 10;

export const starsConfig = {
  dimension: {
    w: width,
    h: height,
  },
  numPerRound: 2,
  timeout: 3000,
  parameters: {
    z: [-1.5, -0.55],
    x: [-(width / 2), width / 2],
    y: [-(height / 2), height / 2],
  },
  sizes: [
    {
      brightness: 13,
      size: [0.13, 0.2, 0.13],
    }, // big
    {
      brightness: 9,
      size: [0.1, 0.17, 0.11],
    }, // medium
    {
      brightness: 5,
      size: [0.07, 0.13, 0.09],
    }, // small
  ],
  enabled: true,
  colors: [
    [0x0075ef, 'rgb(56, 162, 248)'],
    ['rgb(139, 127, 93)', 'rgb(189, 177, 143)'],
    ['rgb(119,112,163)', 'rgb(149,142,203)'],
  ],
};

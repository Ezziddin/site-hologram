export const clockConfig = {
  text: 'SITE',
  tickColor: 'rgb(0, 64, 40)',
  ticksNum: 30,
  redius: 3,
  movingTicksNum: 5,
  tickDimension: {
    x: 0.4,
    y: 1,
    z: 0.3,
  },
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
  timeoutRangePerRound: [0, 1000],
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
  colors: [
    [0x0075ef, 'rgb(25, 162, 248)'],
    ['rgb(139, 127, 93)', 'rgb(189, 177, 143)'],
  ],
};

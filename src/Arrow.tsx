import React from 'react';
export enum DIRS {
  UP,
  RIGHT,
  DOWN,
  LEFT,
}

const Arrow: React.FC<{ dir: DIRS, width: number, length: number, value: number, cx: number, cy: number }> = ({ dir, width, length, value, cx, cy }) => {
  let v = 0;
  let a = 0;
  switch (dir) {
    case DIRS.UP:
      a = 180;
      if (value > 0) v = value;
      break;
    case DIRS.RIGHT:
      a = 270;
      if (value > 0) v = value;
      break;
    case DIRS.LEFT:
      a = 90;
      if (value < 0) v = -value;
      break;
    case DIRS.DOWN:
      if (value < 0) v = -value;
      break;
  }
  return (
    <g transform={`rotate(${a},${cx},${cy})`}>
      <rect x={cx - width / 3} y={width} width={width * 2 / 3} height={length} stroke="black" fill="none" />
      {v && (<rect x={cx - width / 3} y={width} width={width * 2 / 3} height={v} stroke="black" fill="green" />)}

    </g>
  )
}

export default Arrow;
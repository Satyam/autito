import React from 'react';

import './Arrow.css';
export enum DIRS {
  UP,
  RIGHT,
  DOWN,
  LEFT,
}

const Arrow: React.FC<{
  dir?: DIRS,
  width?: number,
  length?: number,
  gap?: number,
  arrowWidth?: number,
  arrowTip?: number,
  value?: number,
  cx?: number,
  cy?: number
}> = ({
  dir = DIRS.UP,
  width = 25,
  length = 100,
  gap = 30,
  arrowWidth = 50,
  arrowTip = 50,
  value = 0,
  cx = 0,
  cy = 0,
}) => {
    let v = 0;
    let a = 0;
    switch (dir) {
      case DIRS.UP:
        a = 180;
        if (value < 0) v = -value;
        break;
      case DIRS.RIGHT:
        a = -90;
        if (value > 0) v = value;
        break;
      case DIRS.LEFT:
        a = 90;
        if (value < 0) v = -value;
        break;
      case DIRS.DOWN:
        if (value > 0) v = value;
        break;
    }
    return (
      <g className="Arrow" transform={`rotate(${a},${cx},${cy})`}>
        <path
          d={`
            M ${cx - width / 2} ${cy + gap}
            h ${width}
            v ${length}
            h ${(arrowWidth - width) / 2}
            L 0 ${cy + gap + length + arrowTip}
            L ${cx - arrowWidth / 2} ${cy + gap + length}
            h ${(arrowWidth - width) / 2}
            Z`}

        />
        {v && (<rect x={cx - width / 2} y={cy + gap} width={width} height={v * length / 255} />)}
      </g>
    )
  }

export default Arrow;
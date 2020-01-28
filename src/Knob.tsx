import React, { useState } from 'react';
import Arrow, { DIRS } from './Arrow';

const Knob: React.FC<{
  remote: boolean,
  x: number,
  y: number,
  width: number,
  height: number
}> = ({
  remote,
  x,
  y,
  width,
  height
}) => {
    const [isDragging, setDragging] = useState<boolean>(false);
    const [initial, setInitial] = useState<[number, number]>([0, 0]);
    const [pos, setPos] = useState<[number, number]>([0, 0]);

    const mouseDownHandler = (ev: React.MouseEvent<SVGCircleElement>) => {
      setInitial([ev.clientX, ev.clientY]);
      setPos([0, 0])
      setDragging(true);
    }
    const mouseMoveHandler = (ev: React.MouseEvent<SVGSVGElement>) => {
      if (isDragging) {
        setPos([Math.round((ev.clientX - initial[0]) / width * 512), Math.round((ev.clientY - initial[1]) / height * 512)]);
        console.log(Math.round((ev.clientX - initial[0]) / width * 512), Math.round((ev.clientY - initial[1]) / height * 512));
      }
    }
    const mouseUpHandler = (ev: React.MouseEvent<SVGSVGElement>) => {
      setDragging(false);
    }
    return (
      <svg
        width={width}
        height={height}
        viewBox="-300 -300 600 600"
        xmlns="http://www.w3.org/2000/svg"
        onMouseMove={mouseMoveHandler}
        onMouseUp={mouseUpHandler}
        onMouseLeave={mouseUpHandler}
        style={{ cursor: isDragging ? 'crosshair' : 'default' }}
      >
        <circle cx={x} cy={-y} r="20" fill="grey" onMouseDown={mouseDownHandler} />
        {remote && (<circle cx={x} cy={-y} r="5" fill="green" />)}
        <Arrow dir={DIRS.UP} width={40} length={100} value={pos[1]} />
        <Arrow dir={DIRS.LEFT} width={40} length={100} value={pos[0]} />
        <Arrow dir={DIRS.DOWN} width={40} length={100} value={pos[1]} />
        <Arrow dir={DIRS.RIGHT} width={40} length={100} value={pos[0]} />

      </svg>
    )
  }

export default Knob;

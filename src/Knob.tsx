import React, { useState } from 'react';
import { useMessage } from './useMessage';
import { useSocketIO } from './useSocketIO'

import Arrow, { DIRS } from './Arrow';

import { GO_FORWARD, GO_BACK, STOP, TURN_LEFT, TURN_RIGHT, GO_STRAIGHT } from './constants';

import "./Knob.css";

const Knob: React.FC<{
  width?: number,
  height?: number
}> = ({
  width = 400,
  height = 400,
}) => {
    const {
      lastCommand,
      speed,
      turn,
      x,
      y,
    } = useMessage();

    const socket = useSocketIO();

    const [isDragging, setDragging] = useState<boolean>(false);
    const [initial, setInitial] = useState<[number, number]>([0, 0]);
    const [lastX, setLastX] = useState<number>(0);
    const [lastY, setLastY] = useState<number>(0);

    const mouseDownHandler = (ev: React.MouseEvent<SVGCircleElement>) => {
      setInitial([ev.clientX, ev.clientY]);
      setDragging(true);
    }
    const mouseMoveHandler = (ev: React.MouseEvent<SVGSVGElement>) => {
      if (isDragging) {
        const x = Math.round((ev.clientX - initial[0]) / width * 512);
        const y = Math.round((ev.clientY - initial[1]) / height * 512);
        if (socket) {
          if (y !== lastY) {
            setLastY(y);
            if (y) {
              socket.command([
                y < 0 ? GO_FORWARD : GO_BACK,
                Math.abs(y),
              ]);
            } else socket.command([STOP]);
          }
          if (x !== lastX) {
            setLastX(x);
            if (x) {
              socket.command([x > 0 ? TURN_RIGHT : TURN_LEFT, Math.abs(x)]);

            } else socket.command([GO_STRAIGHT])
          }
        }
        console.log(x, y);
      }
    }
    const mouseUpHandler = (ev: React.MouseEvent<SVGSVGElement>) => {
      setDragging(false);
      setLastX(0);
      setLastY(0);
      if (socket) {
        socket.command([STOP, GO_STRAIGHT]);
      }
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
        className={`Knob ${isDragging ? 'dragging' : ''}`}
      >
        <rect className="frame" x="-300" y="-300" rx="10" ry="10" />
        <circle cx={x} cy={-y} r="20" fill="grey" onMouseDown={mouseDownHandler} />
        {lastCommand === ' ' && (<circle cx={x} cy={-y} r="12" fill="green" />)}
        <Arrow dir={DIRS.UP} value={-speed} />
        <Arrow dir={DIRS.LEFT} value={turn} />
        <Arrow dir={DIRS.DOWN} value={-speed} />
        <Arrow dir={DIRS.RIGHT} value={turn} />

      </svg>
    )
  }

export default Knob;

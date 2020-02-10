import React, { useState } from 'react';
import { useMessage } from './useMessage';
import { useSocketIO } from './useSocketIO'

import Arrow, { DIRS } from './Arrow';

import "./Knob.css";

const Knob: React.FC<{
  width?: number,
  height?: number
}> = ({
  width = 400,
  height = 400,
}) => {
    const {
      speed,
      turn,
      x,
      y,
    } = useMessage();

    const socket = useSocketIO();

    const [isDragging, setDragging] = useState<boolean>(false);
    const [isTransmitting, setTransmitting] = useState<boolean>(false);
    const [initial, setInitial] = useState<[number, number]>([0, 0]);
    const [lastX, setLastX] = useState<number>(0);
    const [lastY, setLastY] = useState<number>(0);

    const mouseDownHandler = (ev: React.MouseEvent<SVGCircleElement>) => {
      setInitial([ev.clientX, ev.clientY]);
      setDragging(true);
    }

    const mouseMoveHandler = (ev: React.MouseEvent<SVGSVGElement>) => {
      if (socket && isDragging && !isTransmitting) {
        const x = Math.round((ev.clientX - initial[0]) / width * 512);
        const y = Math.round((ev.clientY - initial[1]) / height * 512);
        const cmd: cmdMsg = {};
        let changed = false;
        if (y !== lastY) {
          setLastY(y);
          cmd.speed = y;
          changed = true;
        }
        if (x !== lastX) {
          setLastX(x);
          cmd.turn = x;
          changed = true;
        }
        if (changed) {
          setTransmitting(true);
          socket.command(cmd, (reply) => {
            setTransmitting(false);
            console.log('reply', reply)
          })
        };
        console.log(x, y);
      }
    }
    const mouseUpHandler = (ev: React.MouseEvent<SVGSVGElement>) => {
      setDragging(false);
      setLastX(0);
      setLastY(0);
      if (socket && speed && turn) {
        setTransmitting(false)
        socket.command({ speed: 0, turn: 0 });
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
        <Arrow dir={DIRS.UP} value={-speed} />
        <Arrow dir={DIRS.LEFT} value={turn} />
        <Arrow dir={DIRS.DOWN} value={-speed} />
        <Arrow dir={DIRS.RIGHT} value={turn} />

      </svg>
    )
  }

export default Knob;

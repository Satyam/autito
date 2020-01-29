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
        const cmd = [];
        if (y !== lastY) {
          setLastY(y);
          if (y) {
            cmd.push(y < 0 ? GO_FORWARD : GO_BACK, Math.abs(y))
          } else cmd.push(STOP);
        }
        if (x !== lastX) {
          setLastX(x);
          if (x) {
            cmd.push(x > 0 ? TURN_RIGHT : TURN_LEFT, Math.abs(x));

          } else cmd.push(GO_STRAIGHT)
        }
        if (cmd.length) {
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
        <Arrow dir={DIRS.UP} value={-speed} />
        <Arrow dir={DIRS.LEFT} value={turn} />
        <Arrow dir={DIRS.DOWN} value={-speed} />
        <Arrow dir={DIRS.RIGHT} value={turn} />

      </svg>
    )
  }

export default Knob;

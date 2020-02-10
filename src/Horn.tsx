import React, { useCallback } from 'react';
import { useMessage } from './useMessage';
import { useSocketIO } from './useSocketIO'

import './Horn.css'

const Horn: React.FC<{ size?: number }> = ({ size = 50 }) => {
  const { beep, } = useMessage();

  const socket = useSocketIO();

  const clickHandler = useCallback<React.MouseEventHandler<SVGRectElement>>(() => {
    if (socket && !beep) {
      socket.command({ beep: true })
    }
  }, [beep, socket]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="Horn"
    >
      <rect className="frame" x="0" y="0" rx="10" ry="10" onClick={clickHandler} />
      <g className={beep ? 'beeping' : 'silent'}>
        <circle cx="20" cy="50" r="10" />
        <path d={`
          M 30 45
          C 40 45, 70 40, 70 30
          L 70 70
          C 70 60, 40 55, 30 55
        `} />
        <path className="wave" d={`
          M 80 40
          C 85 50, 85 50 80 60
        `} />
        <path className="wave" d={`
          M 90 40
          C 95 50, 95 50 90 60
        `} />
      </g>
    </svg>);
}

export default Horn;
import React, { useCallback } from 'react';
import { useMessage } from './useMessage';
import { useSocketIO } from './useSocketIO'

import './Led.css';

const Led: React.FC<{ size?: number }> = ({ size = 50 }) => {
  const { led, } = useMessage();

  const socket = useSocketIO();

  const clickHandler = useCallback<React.MouseEventHandler<SVGRectElement>>(() => {
    if (socket) {
      socket.command({ led: !led })
    }
  }, [led, socket]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className="Led"
    >
      <rect className="frame" x="0" y="0" rx="10" ry="10" onClick={clickHandler} />
      <g className={led ? 'on' : 'off'}>
        <rect x="10" y="40" width="10" height="40" rx="5" ry="5" />
        <line x1="30" y1="40" x2="80" y2="20" />
        <line x1="30" y1="50" x2="95" y2="40" />
        <line x1="30" y1="60" x2="100" y2="60" />
        <line x1="30" y1="70" x2="95" y2="80" />
        <line x1="30" y1="80" x2="80" y2="100" />
      </g>
    </svg>);
}

export default Led;
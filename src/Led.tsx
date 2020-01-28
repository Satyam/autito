import React, { useCallback } from 'react';
import { useMessage } from './useMessage';
import { useSocketIO } from './useSocketIO'

import { LED } from './constants';

const Led: React.FC<{ size?: number }> = ({ size = 50 }) => {
  const { led, } = useMessage();

  const socket = useSocketIO();

  const clickHandler = useCallback<React.MouseEventHandler<SVGCircleElement>>(() => {
    if (socket) {
      socket.command([LED, led ? 0 : 1])
    }
  }, [led, socket]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke={led ? "yellow" : "grey"} stroke-width="5" onClick={clickHandler}>
        <rect x="0" y="0" width="120" height="120" rx="10" ry="10" stroke="grey" stroke-width="2" fill="silver" />
        <rect x="10" y="40" width="10" height="40" rx="5" ry="5" fill={led ? "yellow" : "grey"} />
        <line x1="30" y1="40" x2="80" y2="20" />
        <line x1="30" y1="50" x2="95" y2="40" />
        <line x1="30" y1="60" x2="100" y2="60" />
        <line x1="30" y1="70" x2="95" y2="80" />
        <line x1="30" y1="80" x2="80" y2="100" />
      </g>
    </svg>);
}

export default Led;
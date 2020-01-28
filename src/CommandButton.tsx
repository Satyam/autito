import React, { useCallback, } from 'react';
import { useSocketIO } from './useSocketIO';


const CommandButton: React.FC<{ command: number[] }> = ({ command, children }) => {
  const socket = useSocketIO();

  const handleClick = useCallback(() => {
    if (socket) {
      socket.command(command)
    }
  }, [socket, command]);

  return (
    <button onClick={handleClick} disabled={!socket}>{children}</button>
  );
}

export default CommandButton;
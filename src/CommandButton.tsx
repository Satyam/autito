import React, { useCallback, } from 'react';
import { useSocketIO } from './useSocketIO';


const CommandButton: React.FC<{ command: ArrayBuffer }> = ({ command, children }) => {
  const socket = useSocketIO();

  const handleClick = useCallback(() => {
    if (socket) {
      console.log('emitting', command);
      // 'binary' is not included in the type definition so it is flagged as error, which is not.
      // @ts-ignore
      socket.binary(true).compress(false).emit('command', command);
    }
  }, [socket, command]);

  return (
    <button onClick={handleClick} disabled={!socket}>{children}</button>
  );
}

export default CommandButton;
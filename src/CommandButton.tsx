import React, { useCallback, } from 'react';
import useWebSocket from 'react-use-websocket';

const socketUrl = `ws://${document.location.hostname}:${process.env.REACT_APP_WS_PORT}/`;

const CONNECTION_STATUS_OPEN = 1;

const CommandButton: React.FC<{ command: ArrayBuffer }> = ({ command, children }) => {
  const [sendMessage, lastMessage, readyState, getWebSocket] = useWebSocket(socketUrl);

  //const handleClickChangeSocketUrl = useCallback(() => setSocketUrl('wss://demos.kaazing.com/echo'), []);
  const handleClick = useCallback(() => sendMessage(command), [sendMessage, command]);

  return (
    <button onClick={handleClick} disabled={readyState !== CONNECTION_STATUS_OPEN}>{children}</button>
  );
}

export default CommandButton;
import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';

const CONNECTION_STATUS_CONNECTING = 0;
const CONNECTION_STATUS_OPEN = 1;
const CONNECTION_STATUS_CLOSING = 2;
const CONNECTION_STATUS_CLOSED = 3;

const socketUrl = `ws://${document.location.hostname}:${process.env.REACT_APP_WS_PORT}/`

const Logger = () => {
  const [messageHistory, setMessageHistory] = useState<MessageEvent[]>([]);
  const [sendMessage, lastMessage, readyState, getWebSocket] = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {

      //getWebSocket returns the WebSocket wrapped in a Proxy. This is to restrict actions like mutating a shared websocket, overwriting handlers, etc
      const currentWebsocketUrl = getWebSocket().url;
      console.log('received a message from ', currentWebsocketUrl);

      setMessageHistory(prev => prev.concat(lastMessage));
    }
  }, [lastMessage, getWebSocket]);

  const connectionStatus = {
    [CONNECTION_STATUS_CONNECTING]: 'Connecting',
    [CONNECTION_STATUS_OPEN]: 'Open',
    [CONNECTION_STATUS_CLOSING]: 'Closing',
    [CONNECTION_STATUS_CLOSED]: 'Closed',
  }[readyState];

  return (
    <div>
      <div>Socket URL {socketUrl}</div>
      <div>The WebSocket is currently {connectionStatus}</div>
      <div>Last message: {lastMessage ? lastMessage.data : ' --none--'}</div>
      <ul>
        {messageHistory.map((message, idx) => <div key={idx}>{message.data}</div>)}
      </ul>
    </div>
  );
};

export default Logger;
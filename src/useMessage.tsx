import React, { createContext, useState, useContext, useEffect } from 'react';
import { useSocketIO } from './useSocketIO';

const initialMessage: statusMsg = {
  lastCommand: ' ',
  speed: 0,
  turn: 0,
  led: false,
  beep: false,
  x: 0,
  y: 0,
}
export const MessageContext = createContext<statusMsg>(initialMessage);

export const MessageProvider: React.FC = ({ children }) => {
  const [message, setMessage] = useState<statusMsg>(initialMessage);
  const socket = useSocketIO();

  useEffect(() => {
    if (socket) {
      socket.on('reply', (message: statusMsg) => {
        setMessage(message);
      })
    }
  }, [socket])
  return <MessageContext.Provider value={message}>{children}</MessageContext.Provider>;
}

export function useMessage() {
  return useContext(MessageContext);
}
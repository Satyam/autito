import React, { useState, useEffect } from 'react';
import { useSocketIO } from './useSocketIO';
import './Logger.css';

const Logger = () => {
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const socket = useSocketIO();
  useEffect(() => {
    if (socket) {
      socket.on('reply', (message: string) => {
        setMessageHistory(prev => prev.concat(message));
      })
    }
  }, [socket])

  return (
    <div className="Logger">
      <ul>
        {messageHistory.map((message, idx) => <div key={idx}>{message}</div>)}
      </ul>
    </div>
  );
};

export default Logger;
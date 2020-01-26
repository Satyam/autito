import React, { useState, useEffect } from 'react';
import { useSocketIO } from './useSocketIO';
import './Logger.css';

import Knob from './Knob';

let last: statusMsg = {
  lastCommand: ' ',
  speed: 0,
  turn: 0,
  led: false,
  beep: false,
  x: 0,
  y: 0,
}

const Logger = () => {
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const socket = useSocketIO();

  useEffect(() => {
    if (socket) {
      socket.on('reply', (message: statusMsg) => {
        last = message;
        setMessageHistory(prev => {
          if (prev.length > 10) prev.unshift();
          return prev.concat(JSON.stringify(message));
        });
      })
    }
  }, [socket])

  return (
    <div className="Logger">
      {last && (<Knob remote={last.lastCommand !== ' '} x={last.turn} y={last.speed} width={400} height={400} />)}
      <ul>
        {messageHistory.map((message, idx) => <div key={idx}>{message}</div>)}
      </ul>
    </div>
  );
};

export default Logger;
import React, { useCallback } from 'react';
import { useMessage } from './useMessage';
import { useSocketIO } from './useSocketIO'

import { REMOTE } from './constants';

import './Remote.css';

const Remote: React.FC<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>> = ({ children }) => {
  const { remote, } = useMessage();

  const socket = useSocketIO();

  const clickHandler = useCallback<React.MouseEventHandler<HTMLButtonElement>>(() => {
    if (socket) {
      socket.command([REMOTE, remote ? 0 : 1])
    }
  }, [remote, socket]);

  return (
    <div className="Remote">
      <button
        className={remote ? 'on' : 'off'}
        onClick={clickHandler}
      >{children}</button>
    </div>);
}

export default Remote;
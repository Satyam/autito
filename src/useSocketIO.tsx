import React, { createContext, useMemo, useContext } from 'react';
import io from 'socket.io-client';

export type MySocket = (SocketIOClient.Socket & {
  command: (command: ArrayBuffer) => MySocket;
}) | null;

export const SocketIOContext = createContext<MySocket>(null);


export const SocketIOProvider: React.FC<{ url?: string, options?: SocketIOClient.ConnectOpts }> = ({ url = window.location.toString(), options, children }) => {
  const socket: MySocket = useMemo(() => {
    const s = io(url, options)
    if (s) {
      // @ts-ignore
      s.command = (command: ArrayBuffer) => s.binary(true).compress(true).emit('command', command);

    }
    return s as MySocket;
  }, [url, options]);

  return <SocketIOContext.Provider value={socket}>{children}</SocketIOContext.Provider>;
}

export function useSocketIO() {
  return useContext(SocketIOContext);
}
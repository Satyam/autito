import React, { createContext, useMemo, useContext } from 'react';
import io from 'socket.io-client';

type Command = (command: cmdMsg, ack?: (line: string) => void) => MySocket;

export type MySocket = (SocketIOClient.Socket & {
  command: Command;
}) | null;

export const SocketIOContext = createContext<MySocket>(null);


export const SocketIOProvider: React.FC<{ url?: string, options?: SocketIOClient.ConnectOpts }> = ({ url = window.location.toString(), options, children }) => {
  const socket: MySocket = useMemo(() => {
    const s = io(url, options)
    if (s) {
      // .command not part of SocketIOClient.Socket
      // @ts-ignore
      s.command = (command, ack) => {
        console.log('emitting', command);
        return s.compress(true).emit('command', JSON.stringify(command), ack);
      }

    }
    return s as MySocket;
  }, [url, options]);

  return <SocketIOContext.Provider value={socket}>{children}</SocketIOContext.Provider>;
}

export function useSocketIO() {
  return useContext(SocketIOContext);
}
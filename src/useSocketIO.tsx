import React, { createContext, useMemo, useContext } from 'react';
import io from 'socket.io-client';

export type MySocket = (SocketIOClient.Socket & {
  command: (command: number[]) => MySocket;
}) | null;

export const SocketIOContext = createContext<MySocket>(null);


export const SocketIOProvider: React.FC<{ url?: string, options?: SocketIOClient.ConnectOpts }> = ({ url = window.location.toString(), options, children }) => {
  const socket: MySocket = useMemo(() => {
    const s = io(url, options)
    if (s) {
      // .command not part of SocketIOClient.Socket
      // @ts-ignore
      s.command = (command: number[]) => {
        console.log('emitting', String.fromCodePoint(command[0]), command[1]);
        // 'binary' is not included in the type definition so it is flagged as error, which is not.
        // @ts-ignore
        return s.binary(true).compress(true).emit('command', new Uint8Array(command));
      }

    }
    return s as MySocket;
  }, [url, options]);

  return <SocketIOContext.Provider value={socket}>{children}</SocketIOContext.Provider>;
}

export function useSocketIO() {
  return useContext(SocketIOContext);
}
import React, { createContext, useMemo, useContext } from 'react';
import io from 'socket.io-client';

export const SocketIOContext = createContext<SocketIOClient.Socket | null>(null);

export const SocketIOProvider: React.FC<{ url?: string, options?: SocketIOClient.ConnectOpts }> = ({ url = window.location.toString(), options, children }) => {
  const socket: SocketIOClient.Socket = useMemo(() => io(url, options), [url, options]);
  return <SocketIOContext.Provider value={socket}>{children}</SocketIOContext.Provider>;
}

export function useSocketIO() {
  return useContext(SocketIOContext);
}
type statusMsg = {
  lastCommand: string;
  speed: number;
  turn: number;
  beep: boolean;
  led: boolean;
  x: number;
  y: number;
  current: number;
  remote: boolean;
}

type cmdMsg = {
  speed?: number;
  turn?: number;
  beep?: boolean;
  led?: boolean;
  current?: boolean;
  remote?: boolean;
}


declare module '@serialport/parser-readline';

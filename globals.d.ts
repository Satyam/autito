type statusMsg = {
  lastCommand: string;
  speed: number;
  turn: number;
  beep: boolean;
  led: boolean;
  x: number;
  y: number;
  current: number;
}

declare module '@serialport/parser-readline';

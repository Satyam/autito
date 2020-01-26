type statusMsg = {
  lastCommand: string;
  speed: number;
  turn: number;
  beep: boolean;
  led: boolean;
  x: number;
  y: number;
}

declare module '@serialport/parser-readline';

import React from 'react';
import './App.css';
import Logger from './Logger';
import CommandButton from './CommandButton';

// const GO_FORWARD = 1;
// const GO_BACK = 2;
// const STOP = 3;

// const TURN_LEFT = 11;
// const TURN_RIGHT = 12;
// const GO_STRAIGHT = 13;

const BEEP = 20;

const LED = 30;
const App: React.FC = () => {
  return (
    <div className="App">
      <Logger />
      <CommandButton command={new Uint8Array([LED, 1])} >Led On</CommandButton>
      <CommandButton command={new Uint8Array([LED, 0])} >Led Off</CommandButton>
      <CommandButton command={new Uint8Array([BEEP])}>Beep</CommandButton>
    </div>
  );
}

export default App;

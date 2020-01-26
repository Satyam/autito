import React from 'react';
import './App.css';
import { SocketIOProvider } from './useSocketIO';

import Logger from './Logger';
import CommandButton from './CommandButton';

import { GO_FORWARD, GO_BACK, STOP, TURN_LEFT, TURN_RIGHT, GO_STRAIGHT, LED, BEEP } from './constants';

const App: React.FC = () => {
  return (
    <SocketIOProvider>
      <div className="App">
        <CommandButton command={new Uint8Array([GO_FORWARD, 255])} >Full forward</CommandButton>
        <CommandButton command={new Uint8Array([GO_FORWARD, 127])} >Half forward</CommandButton>
        <CommandButton command={new Uint8Array([STOP])} >Stop</CommandButton>
        <CommandButton command={new Uint8Array([GO_BACK, 127])} >Half back</CommandButton>
        <CommandButton command={new Uint8Array([GO_BACK, 255])} >Full back</CommandButton>
        <hr />
        <CommandButton command={new Uint8Array([TURN_LEFT, 255])} >Full left</CommandButton>
        <CommandButton command={new Uint8Array([TURN_LEFT, 127])} >Half left</CommandButton>
        <CommandButton command={new Uint8Array([GO_STRAIGHT])} >Straight</CommandButton>
        <CommandButton command={new Uint8Array([TURN_RIGHT, 127])} >Half right</CommandButton>
        <CommandButton command={new Uint8Array([TURN_RIGHT, 255])} >Full right</CommandButton>
        <hr />
        <CommandButton command={new Uint8Array([LED, 1])} >Led On</CommandButton>
        <CommandButton command={new Uint8Array([LED, 0])} >Led Off</CommandButton>
        <hr />
        <CommandButton command={new Uint8Array([BEEP])}>Beep</CommandButton>
        <Logger />
      </div>
    </SocketIOProvider>
  );
}

export default App;

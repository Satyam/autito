import React from 'react';
import { SocketIOProvider } from './useSocketIO';
import { MessageProvider } from './useMessage';

import './App.css';

import Knob from './Knob';
import Led from './Led';
import Horn from './Horn';

import CommandButton from './CommandButton';

import { GO_FORWARD, GO_BACK, STOP, TURN_LEFT, TURN_RIGHT, GO_STRAIGHT, LED, BEEP } from './constants';

const App: React.FC = () => {
  return (
    <SocketIOProvider>
      <MessageProvider>
        <div className="App">
          <CommandButton command={[GO_FORWARD, 255]} >Full forward</CommandButton>
          <CommandButton command={[GO_FORWARD, 127]} >Half forward</CommandButton>
          <CommandButton command={[STOP]} >Stop</CommandButton>
          <CommandButton command={[GO_BACK, 127]} >Half back</CommandButton>
          <CommandButton command={[GO_BACK, 255]} >Full back</CommandButton>
          <hr />
          <CommandButton command={[TURN_LEFT, 255]} >Full left</CommandButton>
          <CommandButton command={[TURN_LEFT, 127]} >Half left</CommandButton>
          <CommandButton command={[GO_STRAIGHT]} >Straight</CommandButton>
          <CommandButton command={[TURN_RIGHT, 127]} >Half right</CommandButton>
          <CommandButton command={[TURN_RIGHT, 255]} >Full right</CommandButton>
          <hr />
          <CommandButton command={[LED, 1]} >Led On</CommandButton>
          <CommandButton command={[LED, 0]} >Led Off</CommandButton>
          <hr />
          <CommandButton command={[BEEP]}>Beep</CommandButton>
          <hr />
          <Knob />
          <Led />
          <Horn />
        </div>
      </MessageProvider>
    </SocketIOProvider>
  );
}

export default App;

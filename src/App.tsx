import React from 'react';
import { SocketIOProvider } from './useSocketIO';
import { MessageProvider } from './useMessage';

import './App.css';

import Knob from './Knob';
import Led from './Led';
import Horn from './Horn';
import Current from './Current';
import Remote from './Remote';

import CommandButton from './CommandButton';


const App: React.FC = () => {
  return (
    <SocketIOProvider>
      <MessageProvider>
        <div className="App">
          <CommandButton command={{ speed: 255 }} >Full forward</CommandButton>
          <CommandButton command={{ speed: 127 }} >Half forward</CommandButton>
          <CommandButton command={{ speed: 0 }} >Stop</CommandButton>
          <CommandButton command={{ speed: -127 }} >Half back</CommandButton>
          <CommandButton command={{ speed: -255 }} >Full back</CommandButton>
          <hr />
          <CommandButton command={{ turn: -255 }} >Full left</CommandButton>
          <CommandButton command={{ turn: -127 }} >Half left</CommandButton>
          <CommandButton command={{ turn: 0 }} >Straight</CommandButton>
          <CommandButton command={{ turn: 127 }} >Half right</CommandButton>
          <CommandButton command={{ turn: 255 }} >Full right</CommandButton>
          <hr />
          <CommandButton command={{ led: true }} >Led On</CommandButton>
          <CommandButton command={{ led: false }} >Led Off</CommandButton>
          <hr />
          <CommandButton command={{ beep: true }}>Beep</CommandButton>
          <hr />
          <Remote>Remote</Remote>
          <hr />

          <Knob />
          <Led />
          <Horn />
          <hr />
          <Current />
        </div>
      </MessageProvider>
    </SocketIOProvider>
  );
}

export default App;

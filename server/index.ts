import * as SerialPort from 'serialport';
import * as express from 'express';
import * as Readline from '@serialport/parser-readline';
import { resolve } from 'path';
import { config as envRead } from 'dotenv';

import { Server as WSServer } from 'ws';

import { setTimeout } from 'timers';

const GO_FORWARD = 1;
const GO_BACK = 2;
const STOP = 3;

const TURN_LEFT = 11;
const TURN_RIGHT = 12;
const GO_STRAIGHT = 13;

const BEEP = 20;

const LED = 30;
envRead();

const wss = new WSServer({ port: process.env.REACT_APP_WS_PORT });

const app = express();

const usbPort = new SerialPort(process.env.REACT_APP_USB_PORT, {
  baudRate: 9600,
  // defaults for Arduino serial communication
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: false
})

const remoteLog = [];


const serialReader = usbPort.pipe(new Readline({ delimiter: '\r\n' }));
serialReader.on('data', line => remoteLog.push(line));
usbPort.on('end', () => void console.log('-----'));
// usbPort.on('error', err => void console.error(err));

const MIN = 0;
const MAX = 255;

function inRange(value) {
  if (typeof value === 'undefined') {
    return MAX;
  }
  const v = parseInt(value, 10);
  if (v < MIN) return MIN;
  if (v > MAX) return MAX;
  return v;
}

const PAGE = `
<ul>
  <li><a href="/on">Led on</a></li>
  <li><a href="/off">Led off</a></li>
  <li><a href="/forward">Go Forward full speed</a></li>
  <li><a href="/forward/127">Go Forward half speed</a></li>
  <li><a href="/backward">Go Backward full speed</a></li>
  <li><a href="/backward/127">Go Backward half speed</a></li>
  <li><a href="/stop">Stop</a></li>
  <li><a href="/left">Turn left full</a></li>
  <li><a href="/left/127">Turn left half way</a></li>
  <li><a href="/right">Turn right full</a></li>
  <li><a href="/right/127">Turn right half way</a></li>
  <li><a href="/straight">Go Straight</a></li>
  <li><a href="/beep">beep</a></li>
  <li><a href="/">Full stop, wheels straight</a></li>
</ul>
`;

function sendLog(res, msg?: string) {
  res.write(msg || '<p>-----</p>')
  res.write('<pre>')
  while (remoteLog.length) {
    res.write(remoteLog.shift());
    res.write('\n');
  }
  res.write('</pre>');
}

app.get('/on', (req, res) => {
  sendLog(res);
  usbPort.write([LED, 1]);
  serialReader.once('data', line => {
    res.write(`<p>***${line}***<p>`);
    sendLog(res, `<h3>Led On</h3>`);
    res.end(PAGE);
  })
})

app.get('/off', (req, res) => {
  sendLog(res);
  usbPort.write([LED, 0]);
  serialReader.once('data', line => {
    res.write(`<p>***${line}***<p>`);
    sendLog(res, `<h3>Led Off</h3>`);
    res.end(PAGE);
  })
})

app.get('/forward/:speed?', (req, res) => {
  sendLog(res);
  const value = inRange(req.params.speed);
  usbPort.write([GO_FORWARD, value]);
  setTimeout(() => {
    sendLog(res, `<h3>Going forward at ${value}</h3>`);
    res.end(PAGE);
  }, 1000)
});

app.get('/backward/:speed?', (req, res) => {
  sendLog(res);
  const value = inRange(req.params.speed);
  usbPort.write([GO_BACK, value])
  setTimeout(() => {
    sendLog(res, `<h3>Going backwards at ${value}</h3>`);
    res.end(PAGE);
  }, 1000)
});

app.get('/stop', (req, res) => {
  sendLog(res);
  usbPort.write([STOP]);
  serialReader.once('data', line => {
    res.write(`<p>***${line}***<p>`);
    sendLog(res, `<h3>Stopping</h3>`);
    res.end(PAGE);
  })
})

app.get('/left/:angle?', (req, res) => {
  sendLog(res);
  const value = inRange(req.params.angle);
  usbPort.write([TURN_LEFT, value])
  setTimeout(() => {
    sendLog(res, `<h3>Turning left at ${value}</h3>`);
    res.end(PAGE);
  }, 1000)
});

app.get('/right/:angle?', (req, res) => {
  sendLog(res);
  const value = inRange(req.params.angle);
  usbPort.write([TURN_RIGHT, value])
  setTimeout(() => {
    sendLog(res, `<h3>Turning right at ${value}</h3>`);
    res.end(PAGE);
  }, 1000)
});

app.get('/straight', (req, res) => {
  sendLog(res);
  usbPort.write([GO_STRAIGHT]);
  setTimeout(() => {
    sendLog(res, `<h3>Going straight ahead</h3>`);
    res.end(PAGE);
  }, 1000)
})

app.get('/beep', (req, res) => {
  sendLog(res);
  usbPort.write([BEEP]);
  setTimeout(() => {
    sendLog(res, `<h3>beeping ....</h3>`);
    res.end(PAGE);
  }, 1000)
});

// app.get('/', (req, res) => {
//   sendLog(res);
//   usbPort.write([STOP]);
//   usbPort.write([GO_STRAIGHT]);
//   setTimeout(() => {
//     sendLog(res, `<h3>Stopped, straight</h3>`);
//     res.end(PAGE);
//   }, 1000)
// });

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: resolve(__dirname, '../build'),
    dotfiles: 'deny'
  })
});

app.get('*', (req, res) => {
  res.sendFile(req.path, {
    root: resolve(__dirname, '../build'),
    dotfiles: 'deny'
  })
})


app.listen(process.env.REACT_APP_HTTP_PORT, () => console.log(`Example app listening on port ${process.env.REACT_APP_HTTP_PORT}!`));

wss.on('connection', ws => {
  ws.on('message', message => {
    console.log('received: %s', message);
  });

  ws.send('something');
});

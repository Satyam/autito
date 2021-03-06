import * as express from 'express';
import * as socketIO from 'socket.io';
import * as SerialPort from 'serialport';
import * as Readline from '@serialport/parser-readline';
import { createServer } from 'http';
import { resolve } from 'path';
import { config as envRead } from 'dotenv';


import { setTimeout } from 'timers';

// @ts-n ocheck
const GO_FORWARD = 'f'.codePointAt(0);
const GO_BACK = 'b'.codePointAt(0);
const STOP = 'S'.codePointAt(0);

const TURN_LEFT = 'l'.codePointAt(0);
const TURN_RIGHT = 'r'.codePointAt(0);
const GO_STRAIGHT = '|'.codePointAt(0);

const BEEP = '!'.codePointAt(0);

const LED = '#'.codePointAt(0);

const REMOTE = 'R'.codePointAt(0);

const CURRENT = 'c'.codePointAt(0);


envRead();

const app = express();
const http = createServer(app);
const io = socketIO(http);


const usbPort = new SerialPort(process.env.REACT_APP_USB_PORT, {
  baudRate: 9600,
  // defaults for Arduino serial communication
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  // flowControl: false
})

const remoteLog: string[] = [];

const msg: statusMsg = {
  lastCommand: ' ',
  speed: 0,
  turn: 0,
  beep: false,
  led: false,
  x: 0,
  y: 0,
  current: 0,
  remote: false,
}
io.on('connection', socket => {
  console.log('a user connected');
  socket.emit('reply', msg);

  socket.on('command', (command, ack) => {
    // console.log('command', command);
    const {
      speed,
      turn,
      beep,
      led,
      current,
      remote,
    }: cmdMsg = JSON.parse(command);
    const cmdArray: number[] = [];
    if (typeof speed !== 'undefined') {
      if (speed) {
        cmdArray.push(speed > 0 ? GO_FORWARD : GO_BACK, Math.abs(speed));
      } else cmdArray.push(STOP);
    }
    if (typeof turn !== 'undefined') {
      if (turn) {
        cmdArray.push(turn > 0 ? TURN_RIGHT : TURN_LEFT, Math.abs(turn));
      } else cmdArray.push(GO_STRAIGHT);
    }
    if (typeof beep !== 'undefined') {
      cmdArray.push(BEEP);
    }
    if (typeof led !== 'undefined') {
      cmdArray.push(LED, led ? 1 : 0);
    }
    if (typeof current !== 'undefined') {
      cmdArray.push(CURRENT, current ? 1 : 0);
    }
    if (typeof remote !== 'undefined') {
      cmdArray.push(REMOTE, remote ? 1 : 0);
    }
    usbPort.write(cmdArray);
    serialReader.once('data', (line: string) => {
      if (ack) ack(line);
    });
  })
});


const decode: (line: string) => statusMsg = line => {


  const n: (i: number) => number = i => parseInt(line.substr(i), 10);
  const isNumber = /\d|-/;

  msg.lastCommand = ' ';
  for (let i = 0; i < line.length;) {
    switch (line[i++]) {
      case '>':
        msg.lastCommand = line[i];
        break;
      case '=':
        // argument to command
        break;
      case 's':
        msg.speed = n(i);
        break;
      case 't':
        msg.turn = n(i);
        break;
      case '!':
        msg.beep = line[i] !== '0';
        break;
      case '#':
        msg.led = line[i] !== '0';
        break;
      case 'x':
        msg.x = n(i);
        break;
      case 'y':
        msg.y = n(i);
        break;
      case 'c':
        msg.current = n(i);
        break;
      case 'R':
        msg.remote = line[i] !== '0';
        break;
      default:
        while (isNumber.test(line[i])) i += 1;
        break;
    }
  }
  // console.log(line, msg);

  return msg;
}

const serialReader = usbPort.pipe(new Readline({ delimiter: '\r\n' }));
serialReader.on('data', (line: string) => {
  if (remoteLog.length > 20) remoteLog.shift();
  remoteLog.push(line);
  io.emit('reply', decode(line));
});
usbPort.on('end', () => void console.log('-----'));
// usbPort.on('error', err => void console.error(err));

const MIN = 0;
const MAX = 255;

function inRange(value?: string) {
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
  <li><a href="/web">Full stop, wheels straight</a></li>
</ul>
`;

function sendLog(res: express.Response, msg?: string) {
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
  serialReader.once('data', (line: string) => {
    res.write(`<p>***${line}***<p>`);
    sendLog(res, `<h3>Led On</h3>`);
    res.end(PAGE);
  })
})

app.get('/off', (req, res) => {
  sendLog(res);
  usbPort.write([LED, 0]);
  serialReader.once('data', (line: string) => {
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
  serialReader.once('data', (line: string) => {
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

app.get('/web', (req, res) => {
  sendLog(res);
  usbPort.write([STOP]);
  usbPort.write([GO_STRAIGHT]);
  setTimeout(() => {
    sendLog(res, `<h3>Stopped, straight</h3>`);
    res.end(PAGE);
  }, 1000)
});

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

http.listen(process.env.REACT_APP_HTTP_PORT, () => console.log(`Example app listening on port ${process.env.REACT_APP_HTTP_PORT}!`));


"use strict";
exports.__esModule = true;
var SerialPort = require("serialport");
var express = require("express");
var Readline = require("@serialport/parser-readline");
var path_1 = require("path");
var dotenv_1 = require("dotenv");
var ws_1 = require("ws");
var timers_1 = require("timers");
var GO_FORWARD = 1;
var GO_BACK = 2;
var STOP = 3;
var TURN_LEFT = 11;
var TURN_RIGHT = 12;
var GO_STRAIGHT = 13;
var BEEP = 20;
var LED = 30;
dotenv_1.config();
var wss = new ws_1.Server({ port: process.env.REACT_APP_WS_PORT });
var app = express();
var usbPort = new SerialPort(process.env.REACT_APP_USB_PORT, {
    baudRate: 9600,
    // defaults for Arduino serial communication
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
});
var remoteLog = [];
var serialReader = usbPort.pipe(new Readline({ delimiter: '\r\n' }));
serialReader.on('data', function (line) { return remoteLog.push(line); });
usbPort.on('end', function () { return void console.log('-----'); });
// usbPort.on('error', err => void console.error(err));
var MIN = 0;
var MAX = 255;
function inRange(value) {
    if (typeof value === 'undefined') {
        return MAX;
    }
    var v = parseInt(value, 10);
    if (v < MIN)
        return MIN;
    if (v > MAX)
        return MAX;
    return v;
}
var PAGE = "\n<ul>\n  <li><a href=\"/on\">Led on</a></li>\n  <li><a href=\"/off\">Led off</a></li>\n  <li><a href=\"/forward\">Go Forward full speed</a></li>\n  <li><a href=\"/forward/127\">Go Forward half speed</a></li>\n  <li><a href=\"/backward\">Go Backward full speed</a></li>\n  <li><a href=\"/backward/127\">Go Backward half speed</a></li>\n  <li><a href=\"/stop\">Stop</a></li>\n  <li><a href=\"/left\">Turn left full</a></li>\n  <li><a href=\"/left/127\">Turn left half way</a></li>\n  <li><a href=\"/right\">Turn right full</a></li>\n  <li><a href=\"/right/127\">Turn right half way</a></li>\n  <li><a href=\"/straight\">Go Straight</a></li>\n  <li><a href=\"/beep\">beep</a></li>\n  <li><a href=\"/\">Full stop, wheels straight</a></li>\n</ul>\n";
function sendLog(res, msg) {
    res.write(msg || '<p>-----</p>');
    res.write('<pre>');
    while (remoteLog.length) {
        res.write(remoteLog.shift());
        res.write('\n');
    }
    res.write('</pre>');
}
app.get('/on', function (req, res) {
    sendLog(res);
    usbPort.write([LED, 1]);
    serialReader.once('data', function (line) {
        res.write("<p>***" + line + "***<p>");
        sendLog(res, "<h3>Led On</h3>");
        res.end(PAGE);
    });
});
app.get('/off', function (req, res) {
    sendLog(res);
    usbPort.write([LED, 0]);
    serialReader.once('data', function (line) {
        res.write("<p>***" + line + "***<p>");
        sendLog(res, "<h3>Led Off</h3>");
        res.end(PAGE);
    });
});
app.get('/forward/:speed?', function (req, res) {
    sendLog(res);
    var value = inRange(req.params.speed);
    usbPort.write([GO_FORWARD, value]);
    timers_1.setTimeout(function () {
        sendLog(res, "<h3>Going forward at " + value + "</h3>");
        res.end(PAGE);
    }, 1000);
});
app.get('/backward/:speed?', function (req, res) {
    sendLog(res);
    var value = inRange(req.params.speed);
    usbPort.write([GO_BACK, value]);
    timers_1.setTimeout(function () {
        sendLog(res, "<h3>Going backwards at " + value + "</h3>");
        res.end(PAGE);
    }, 1000);
});
app.get('/stop', function (req, res) {
    sendLog(res);
    usbPort.write([STOP]);
    serialReader.once('data', function (line) {
        res.write("<p>***" + line + "***<p>");
        sendLog(res, "<h3>Stopping</h3>");
        res.end(PAGE);
    });
});
app.get('/left/:angle?', function (req, res) {
    sendLog(res);
    var value = inRange(req.params.angle);
    usbPort.write([TURN_LEFT, value]);
    timers_1.setTimeout(function () {
        sendLog(res, "<h3>Turning left at " + value + "</h3>");
        res.end(PAGE);
    }, 1000);
});
app.get('/right/:angle?', function (req, res) {
    sendLog(res);
    var value = inRange(req.params.angle);
    usbPort.write([TURN_RIGHT, value]);
    timers_1.setTimeout(function () {
        sendLog(res, "<h3>Turning right at " + value + "</h3>");
        res.end(PAGE);
    }, 1000);
});
app.get('/straight', function (req, res) {
    sendLog(res);
    usbPort.write([GO_STRAIGHT]);
    timers_1.setTimeout(function () {
        sendLog(res, "<h3>Going straight ahead</h3>");
        res.end(PAGE);
    }, 1000);
});
app.get('/beep', function (req, res) {
    sendLog(res);
    usbPort.write([BEEP]);
    timers_1.setTimeout(function () {
        sendLog(res, "<h3>beeping ....</h3>");
        res.end(PAGE);
    }, 1000);
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
app.get('/', function (req, res) {
    res.sendFile('index.html', {
        root: path_1.resolve(__dirname, '../build'),
        dotfiles: 'deny'
    });
});
app.get('*', function (req, res) {
    res.sendFile(req.path, {
        root: path_1.resolve(__dirname, '../build'),
        dotfiles: 'deny'
    });
});
app.listen(process.env.REACT_APP_HTTP_PORT, function () { return console.log("Example app listening on port " + process.env.REACT_APP_HTTP_PORT + "!"); });
wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        console.log('received: %s', message);
    });
    ws.send('something');
});

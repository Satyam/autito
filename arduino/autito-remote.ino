#include <Servo.h>
#include <pitches.h>

#define WAIT 100

// Joystick
#define JOY_SWITCH 2
#define JOY_X A0
#define JOY_Y A1

// DC Motor
#define ENABLE 5
#define DIRA 3
#define DIRB 4
#define MAX_SPEED 255

// Servo
#define SERVO 9
#define MAX_SERVO 180

Servo servo;

// Music:
#define BUZZER 8
#define DURATION 300
#define GAP (DURATION + 50)

int melody[] = {
  NOTE_AS4, NOTE_C5, NOTE_GS4, NOTE_GS3, NOTE_DS4
};

// Remote commands

#define GO_FORWARD 'f'
#define GO_BACK 'b'
#define STOP 'S'

#define TURN_LEFT 'l'
#define TURN_RIGHT 'r'
#define GO_STRAIGHT '|'

#define BEEP '!'

#define LED '#'

typedef struct {
  char command = '-';
  byte value = 0;
  char go = STOP;
  byte speed = 0;
  char turn = GO_STRAIGHT;
  byte angle = 0;
  byte beep = false;
  byte led = false;
} Status;

Status status;


void sendStatus() {
  // Serial.write((byte *)&status, sizeof(status));
  Serial.print('>');
  Serial.print(status.command);
  Serial.print(status.value);
  Serial.print(status.go);
  Serial.print(status.speed);
  Serial.print(status.turn);
  Serial.print(status.angle);
  Serial.print('&');
  Serial.print(status.beep);
  Serial.print(status.led);
  Serial.println('<');
}
void setMotor(int speed)  {
  int s = min(abs(speed), MAX_SPEED);

  if (speed < 0) {
    digitalWrite(DIRA, HIGH);
    digitalWrite(DIRB, LOW);

  } else {
    digitalWrite(DIRA, LOW);
    digitalWrite(DIRB, HIGH);
  }
  analogWrite(ENABLE, s);
}

// Play tune
#define QUIET 1
#define START_PLAYING 2
#define PLAYING 3

int note = 0;
int playing = QUIET;
unsigned long timeForNextNote;

// ISR for switch: plays tune
void handleSwitch() {
  if (playing == QUIET) playing = START_PLAYING;
}


// Variables to hold values for centered joystick
int centerX;
int centerY;

void setup() {
  Serial.begin(9600);

  // Joystick
  pinMode(JOY_SWITCH, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(JOY_SWITCH), handleSwitch, LOW);

  // DC Motor
  pinMode(ENABLE, OUTPUT);
  pinMode(DIRA, OUTPUT);
  pinMode(DIRB, OUTPUT);

  // Read the values for the joystick at idle (center) position
  centerX = analogRead(JOY_X);
  centerY = analogRead(JOY_Y);


  // Servo
  servo.attach(SERVO);
  servo.write(MAX_SERVO / 2);

  // Built in LED
  pinMode(LED_BUILTIN, OUTPUT);

  sendStatus();
}

int lastX;
int lastY;

byte remoteCommand = 0;
byte firstByte = 0;

void loop() {
  if (Serial.available()) {
    remoteCommand = (byte)Serial.read();
    status.command = remoteCommand;
    switch (remoteCommand) {
      case GO_FORWARD:
        firstByte = (byte)Serial.read();
        setMotor(firstByte);

        status.go = GO_FORWARD;
        status.speed = firstByte;
        status.value = firstByte;

        break;
      case GO_BACK:
        firstByte = (byte)Serial.read();
        setMotor(-firstByte);

        status.go = GO_BACK;
        status.speed = firstByte;
        status.value = firstByte;
        break;
      case STOP:
        setMotor(0);

        status.go = STOP;
        status.speed = 0;
        status.value = 0;
        break;
      case TURN_LEFT:
        firstByte = (byte)Serial.read();
        servo.write((255 - long(firstByte)) * MAX_SERVO / 512 );

        status.turn = TURN_LEFT;
        status.angle = firstByte;
        status.value = firstByte;
        break;
      case TURN_RIGHT:
        firstByte = (byte)Serial.read();
        servo.write((long(firstByte) + 255) * MAX_SERVO / 512);

        status.turn = TURN_RIGHT;
        status.angle = firstByte;
        status.value = firstByte;
        break;
      case GO_STRAIGHT:
        servo.write(90);

        status.turn = GO_STRAIGHT;
        status.angle = 0;
        status.value = 0;
        break;
      case BEEP:
        if (playing == QUIET) {
          playing = START_PLAYING;
          status.beep = true;
        }
        status.value = 0;
        break;
      case LED:
        firstByte = (byte)Serial.read();
        status.led = firstByte;
        digitalWrite(LED_BUILTIN, firstByte ? HIGH : LOW );
        break;

      default:
        break;
    }
    sendStatus();
  }
  int x = analogRead(JOY_X);
  int y = analogRead(JOY_Y);

  // Check for significant movement on Y axis
  if (abs(y - lastY) > 2) {
    lastY = y;

    long s = long(y - centerY) * MAX_SPEED / centerY;
    setMotor(s);

    if (s > 0) {
      status.go = GO_FORWARD;
    } else if (s == 0) {
      status.go = STOP;
    } else {
      status.go = GO_BACK;
    }
    status.speed = min(abs(s), 255);
    status.command = '-';
    status.value = 0;
    sendStatus();
  }

  // Check for significant movement on X axis
  if (abs(x - lastX) > 2) {
    lastX = x;

    long a = long(x) * MAX_SERVO / centerX / 2;
    servo.write(a);

    if (a > 90) {
      status.turn = TURN_RIGHT;
    } else if (a == 90) {
      status.turn == GO_STRAIGHT;
    } else {
      status.turn = TURN_LEFT;
    }
    status.angle = abs(a - 90);
    status.command = '-';
    status.value = 0;
    sendStatus();
  }

  // Check on tune playing
  switch (playing) {
    case START_PLAYING:
      playing = PLAYING;
      note = 0;
      timeForNextNote = millis() + GAP;
      tone(BUZZER, melody[note], DURATION);

      status.beep = true;
      status.command = '-';
      status.value = 0;
      sendStatus();
      break;
    case PLAYING:
      if (millis() > timeForNextNote) {
        note++;
        if (note == 4) {
          playing = QUIET;
          tone(BUZZER, melody[note], 3 * DURATION);

          status.beep = false;
          status.command = '-';
          status.value = 0;
          sendStatus();
        } else {
          tone(BUZZER, melody[note], DURATION);
          timeForNextNote = millis() + GAP;
        }
      }
      break;
      // No need to do anything for playing == QUIET

  }

  // wait for a while
  delay(WAIT);
}

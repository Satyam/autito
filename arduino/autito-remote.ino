#include <Servo.h>
#include <pitches.h>

#define WAIT 100

#define MAX_BYTE 255

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
#define MAX_SERVO 90

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


// Variables to hold values for centered joystick
int centerX;
int centerY;
// Variables to hold last known state of joystick
int lastX;
int lastY;

int readJoystick(int pin, int center) {
  return (analogRead(pin) >> 1) - center;
}

void setMotor(int speed)  {
  if (speed < 0) {
    digitalWrite(DIRA, HIGH);
    digitalWrite(DIRB, LOW);

  } else {
    digitalWrite(DIRA, LOW);
    digitalWrite(DIRB, HIGH);
  }
  analogWrite(ENABLE, abs(speed));
}

void setTurn(int turn) {
  // Scale range of -255 to 255 into 0 to 180 for servo
  servo.write(long(turn) * MAX_SERVO / MAX_BYTE + MAX_SERVO);
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
  if (playing == QUIET) {
    playing = START_PLAYING;
    Serial.println("!1");
  }
}


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
  // Values scaled from 0 to 1025 into 0 to 512 so they will
  centerX = readJoystick(JOY_X, 0);
  centerY = readJoystick(JOY_Y, 0);


  // Servo
  servo.attach(SERVO);
  setTurn(0);

  // Built in LED
  pinMode(LED_BUILTIN, OUTPUT);

  Serial.println("s0t0!0#0");
}

byte remoteCommand = 0;
byte firstByte = 0;

void loop() {
  if (Serial.available()) {
    remoteCommand = (byte)Serial.read();
    Serial.print('>');
    Serial.print(char(remoteCommand));
    switch (remoteCommand) {

      case GO_FORWARD:
        firstByte = (byte)Serial.read();
        setMotor(firstByte);

        Serial.print('s');
        Serial.println(firstByte);
        break;

      case GO_BACK:
        firstByte = (byte)Serial.read();
        setMotor(-firstByte);

        Serial.print('s');
        Serial.println(-firstByte);
        break;

      case STOP:
        setMotor(0);

        Serial.print('s');
        Serial.println(0);
        break;

      case TURN_LEFT:
        firstByte = (byte)Serial.read();
        setTurn(-firstByte);

        Serial.print('t');
        Serial.println(-firstByte);
        break;

      case TURN_RIGHT:
        firstByte = (byte)Serial.read();
        setTurn(firstByte);

        Serial.print('t');
        Serial.println(firstByte);
        break;

      case GO_STRAIGHT:
        setTurn(0);

        Serial.print('t');
        Serial.println(0);
        break;

      case BEEP:
        if (playing == QUIET) {
          playing = START_PLAYING;

          Serial.print('!');
          Serial.println(true);
        }
        break;

      case LED:
        firstByte = (byte)Serial.read();
        digitalWrite(LED_BUILTIN, firstByte ? HIGH : LOW );

        Serial.print('#');
        Serial.println(firstByte);
        break;

      default:
        break;
    }
  }

  int y = readJoystick(JOY_Y, centerY);

  // Check for significant movement on Y axis
  if (y != lastY) {
    lastY = y;

    // The minus sigh reflects the orientation of the joystick.
    int s = - min(y, MAX_BYTE);
    setMotor(s);

    Serial.print('s');
    Serial.print(s);
    Serial.print('y');
    Serial.println(s);
  }

  int x = readJoystick(JOY_X, centerX);
  // Check for significant movement on X axis
  if (x != lastX) {
    lastX = x;

    int a = min(x, MAX_BYTE);

    setTurn(a);

    Serial.print('t');
    Serial.print(a);
    Serial.print('x');
    Serial.println(a);
  }

  // Check on tune playing
  switch (playing) {

  case START_PLAYING:
    playing = PLAYING;
    note = 0;
    timeForNextNote = millis() + GAP;
      tone(BUZZER, melody[note], DURATION);
      break;

    case PLAYING:
      if (millis() > timeForNextNote) {
        note++;
        if (note == 4) {
          playing = QUIET;
          tone(BUZZER, melody[note], 3 * DURATION);
          Serial.println("!0");
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

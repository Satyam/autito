import React, { useReducer, useEffect, useCallback } from 'react';
import { useMessage } from './useMessage';
import { useSocketIO } from './useSocketIO'
import CommandButton from './CommandButton';

const MAX_X = 200;
const MAX_Y = 120;

const OVERCURRENT_FACTOR = 0.1;
const OVERCURRENT_COUNT = 8;
const PEAK_DURATION = 500;

type AppState = {
  values: number[];
  isActive: boolean;
  peakEndTime: number;
  sum: number;
  count: number;
  overCurrentCount: number;
  stop: boolean;
  speed: number;
};


type Action =
  | { type: "CURRENT"; current: number }
  | { type: "SPEED"; speed: number }
  | { type: "ACTIVE"; isActive: boolean }
  ;

const initialState: AppState = {
  values: [],
  isActive: true,
  peakEndTime: 0,
  sum: 0,
  count: 0,
  overCurrentCount: 0,
  stop: false,
  speed: 0,
}

function reducer(state: AppState, action: Action): AppState {
  let {
    values,
    isActive,
    peakEndTime,
    sum,
    count,
    overCurrentCount,
    stop,
    speed,
  } = state;
  switch (action.type) {
    case "CURRENT":
      const current = action.current;
      // ?? setActive(true);
      if (values.length > MAX_X) values.shift();
      values.push(-current);
      if (speed && Date.now() > peakEndTime && count < 100) {
        sum += current;
        count += 1;
      }
      if (count > 10) {
        const avg = sum / count;
        if (speed > 0) {
          if ((current - avg) > avg * OVERCURRENT_FACTOR) {
            overCurrentCount += 1;
          } else {
            overCurrentCount = 0;
          }
        } else {
          if ((current - avg) < avg * OVERCURRENT_FACTOR) {
            overCurrentCount += 1;
          } else {
            overCurrentCount = 0;
          }
        }
      }
      stop = overCurrentCount > OVERCURRENT_COUNT;

      return {
        values,
        isActive,
        peakEndTime,
        sum,
        count,
        overCurrentCount,
        stop,
        speed,
      }
    case "SPEED":
      speed = action.speed;
      if (speed) {
        peakEndTime = Date.now() + PEAK_DURATION;
      } else {
        peakEndTime = 0;
        sum = 0;
        count = 0;
        overCurrentCount = 0;
      }
      return {
        values,
        isActive,
        peakEndTime,
        sum,
        count,
        overCurrentCount,
        stop,
        speed,
      }
    case "ACTIVE":
      return {
        ...state,
        isActive: !state.isActive,
      }
    default:
      return state;
  }
}

const Current: React.FC<{ width?: number, height?: number }> = ({ width = 400, height = 80 }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { current, speed } = useMessage();
  const socket = useSocketIO();

  useEffect(() => {
    dispatch({ type: "SPEED", speed });
  }, [speed]);

  useEffect(() => {
    dispatch({ type: "CURRENT", current });
  }, [current]);


  const clickHandler = useCallback<React.MouseEventHandler<HTMLButtonElement>>(() => {
    if (socket) {
      dispatch({ type: "ACTIVE", isActive: !state.isActive });
      socket.command({ current: state.isActive })
    }
  }, [state, socket]);


  return (<>
    <svg
      width={width}
      height={height}
      viewBox={`0 -${MAX_Y} ${MAX_X} ${2 * MAX_Y}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      className="Current"
    >
      <rect width="100%" height="100%" x="0" y={-MAX_Y} fill={state.stop ? "pink" : "white"} stroke="gray" stroke-width={1} />
      <line x1="0" y1="0" x2="200" y2="0" stroke="blue" />
      <line x1="0" y1={-MAX_Y / 2} x2="200" y2={-MAX_Y / 2} stroke="silver" />
      <line x1="0" y1={MAX_Y / 2} x2="200" y2={MAX_Y / 2} stroke="silver" />

      <polyline points={state.values.map((y, x) => `${x},${y}`).join(' ')} stroke="black" fill="none" stroke-width={1} />
    </svg>
    {/* <p style={{ textAlign: 'left', marginLeft: '30em' }}>Speed: {speed} Sum: {sum} Count: {count} Avg: {count && Math.floor(sum / count)} StopCnt: {overCurrentCount} Current: {current} </p>
    */}
    <button onClick={clickHandler}>{state.isActive ? 'Pause' : 'Resume'}</button>
    <CommandButton command={{ speed: 255 }} >Full forward</CommandButton>
    <CommandButton command={{ speed: 0 }} >Stop</CommandButton>
    <CommandButton command={{ speed: -255 }} >Full back</CommandButton>

  </>);
}

export default Current;
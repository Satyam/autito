import React, { useState, useEffect, useCallback } from 'react';
import { useMessage } from './useMessage';
import { useSocketIO } from './useSocketIO'
import CommandButton from './CommandButton';

const MAX_X = 200;
const MAX_Y = 120;

const Current: React.FC<{ width?: number, height?: number }> = ({ width = 400, height = 80 }) => {
  const [values, setValues] = useState<number[]>([]);
  const [active, setActive] = useState<boolean>(true);
  const [transient, setTransient] = useState<number>(0);
  const [sum, setSum] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [stopCnt, setStopCnt] = useState<number>(0);
  const { current, speed } = useMessage();
  const socket = useSocketIO();

  useEffect(() => {
    setValues(v => {
      setActive(true);
      if (v.length > MAX_X) v.shift();
      return v.concat(-current);
    })
  }, [current]);

  useEffect(() => {
    if (speed) {
      setTransient(Date.now() + 500);
    } else {
      setTransient(0);
      setSum(0);
      setCount(0);
      setStopCnt(0);
    }
  }, [speed]);

  useEffect(() => {
    if (speed && Date.now() > transient && count < 100) {
      setSum(acc => acc + current);
      setCount(cnt => cnt + 1);
    }
  }, [current, transient, speed, count]);

  useEffect(() => {
    if (count > 10) {
      const avg = sum / count;
      if (speed > 0) {
        if ((current - avg) > avg / 10) {
          setStopCnt(cnt => cnt + 1);
        } else {
          setStopCnt(0);
        }
      } else {
        if ((current - avg) < avg / 10) {
          setStopCnt(cnt => cnt + 1);
        } else {
          setStopCnt(0);
        }

      }
    }
    if (stopCnt > 8 && socket) {
      socket.command({ speed: 0 })
    }

  }, [sum, count, current, speed, stopCnt, socket]);

  const clickHandler = useCallback<React.MouseEventHandler<HTMLButtonElement>>(() => {
    if (socket) {
      socket.command({ current: !active })
      setActive(!active);
    }
  }, [active, socket]);


  return (<>
    <svg
      width={width}
      height={height}
      viewBox={`0 -${MAX_Y} ${MAX_X} ${2 * MAX_Y}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      className="Current"
    >
      <rect width="100%" height="100%" x="0" y={-MAX_Y} fill="white" stroke={stopCnt > 8 ? 'red' : "gray"} stroke-width={1} />
      <line x1="0" y1="0" x2="200" y2="0" stroke="blue" />
      <line x1="0" y1={-MAX_Y / 2} x2="200" y2={-MAX_Y / 2} stroke="silver" />
      <line x1="0" y1={MAX_Y / 2} x2="200" y2={MAX_Y / 2} stroke="silver" />

      <polyline points={values.map((y, x) => `${x},${y}`).join(' ')} stroke="black" fill="none" stroke-width={1} />
    </svg>
    <p style={{ textAlign: 'left', marginLeft: '30em' }}>Speed: {speed} Sum: {sum} Count: {count} Avg: {count && Math.floor(sum / count)} StopCnt: {stopCnt} Current: {current} </p>
    <button onClick={clickHandler}>{active ? 'Pause' : 'Resume'}</button>
    <CommandButton command={{ speed: 255 }} >Full forward</CommandButton>
    <CommandButton command={{ speed: 0 }} >Stop</CommandButton>
    <CommandButton command={{ speed: -255 }} >Full back</CommandButton>

  </>);
}

export default Current;
import React, { useState, useEffect } from 'react';
import { useMessage } from './useMessage';

const MAX_X = 200;
const MAX_Y = 120;

const Current: React.FC<{ width?: number, height?: number }> = ({ width = 400, height = 80 }) => {
  const [values, setValues] = useState<number[]>([]);

  const { current } = useMessage();

  useEffect(() => {
    setValues(v => {
      if (v.length > MAX_X) v.shift();
      return v.concat(-current);
    })
  }, [current])

  return (<>
    <svg
      width={width}
      height={height}
      viewBox={`0 -${MAX_Y} ${MAX_X} ${2 * MAX_Y}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      className="Current"
    >
      <rect width="100%" height="100%" x="0" y={-MAX_Y} fill="white" stroke="gray" stroke-width={1} />
      <line x1="0" y1="0" x2="200" y2="0" stroke="blue" />
      <line x1="0" y1={-MAX_Y / 2} x2="200" y2={-MAX_Y / 2} stroke="silver" />
      <line x1="0" y1={MAX_Y / 2} x2="200" y2={MAX_Y / 2} stroke="silver" />

      <polyline points={values.map((y, x) => `${x},${y}`).join(' ')} stroke="black" fill="none" stroke-width={1} />
    </svg>
    <p>Last value: {current}</p><p>Average past 20 values: {values.slice(- 20).reduce((acc, v) => acc + v, 0) / 20}</p>
  </>);
}

export default Current;
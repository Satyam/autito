import React from 'react';

const Knob: React.FC<{ remote: boolean, x: number, y: number, width: number, height: number }> = ({ remote, x, y, width, height }) => {
  return (
    <svg width={width} height={height} viewBox="-300 -300 600 600" xmlns="http://www.w3.org/2000/svg" >
      <circle cx={x} cy={-y} r="20" fill="grey" />
      {remote && (<circle cx={x} cy={-y} r="5" fill="green" />)}
    </svg>
  )
}

export default Knob;

import React from 'react';
import { useMessage } from './useMessage';


const Current: React.FC<{ size?: number }> = ({ size = 50 }) => {
  const { current } = useMessage();


  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className="Current"
    >
      <rect width="100%" height="100%" x="0" y="0" rx="10" ry="10" fill="silver" stroke="gray" />
      <rect width="80" height="100" x="10" y="10" fill="silver" stroke="gray" />
      {current > 0 && (<rect width="80" height={current * 2} x="10" y="60" fill="green" stroke="gray" />)}
      {current < 0 && (<rect width="80" height={-current * 2} x="10" y={60 + current * 2} fill="red" stroke="gray" />)}
    </svg>);
}

export default Current;
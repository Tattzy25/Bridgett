import React from 'react';

interface BlueIndProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  fill?: string;
  stroke?: string;
}

const BlueInd: React.FC<BlueIndProps> = ({
  size = 24,
  width,
  height,
  color = 'currentColor',
  fill = 'currentColor',
  stroke,
  className,
  style,
  ...props
}) => {
  return (
    <svg
      width={width || size}
      height={height || size}
      viewBox="0 0 810 1439.999935"
      fill={fill}
      stroke={stroke}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        color,
        ...style,
      }}
      {...props}
    >
      <defs>
        <clipPath id="c9bc09183c">
          <path d="M 276 591 L 533.816406 591 L 533.816406 848.816406 L 276 848.816406 Z M 276 591 " />
        </clipPath>
      </defs>
      <g id="923710e386"></g>
    </svg>
  );
};

export default BlueInd;

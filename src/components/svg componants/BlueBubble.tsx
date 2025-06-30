import React from 'react';

interface BlueBubbleProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  fill?: string;
  stroke?: string;
}

const BlueBubble: React.FC<BlueBubbleProps> = ({
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
        <clipPath id="4e2ba561d6">
          <path d="M 356 671.074219 L 454 671.074219 L 454 768.574219 L 356 768.574219 Z M 356 671.074219 " />
        </clipPath>
      </defs>
      <g id="e1753f2e46"></g>
    </svg>
  );
};

export default BlueBubble;

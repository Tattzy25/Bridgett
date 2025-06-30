import React from 'react';

interface PinkIndProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  fill?: string;
  stroke?: string;
}

const PinkInd: React.FC<PinkIndProps> = ({
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
        <clipPath id="c52add0a2f">
          <path d="M 277.316406 592.316406 L 532 592.316406 L 532 847 L 277.316406 847 Z M 277.316406 592.316406 " />
        </clipPath>
      </defs>
      <g id="820f6ed07a"></g>
    </svg>
  );
};

export default PinkInd;

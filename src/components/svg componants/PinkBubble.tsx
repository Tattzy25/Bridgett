import React from 'react';

interface PinkBubbleProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  fill?: string;
  stroke?: string;
}

const PinkBubble: React.FC<PinkBubbleProps> = ({
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
        <clipPath id="da1d514ec6">
          <path d="M 355.132812 670.132812 L 454.882812 670.132812 L 454.882812 769.882812 L 355.132812 769.882812 Z M 355.132812 670.132812 " />
        </clipPath>
      </defs>
      <g id="06456c5d7d"></g>
    </svg>
  );
};

export default PinkBubble;

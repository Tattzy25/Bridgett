import React from 'react';

interface BlueButtonProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  fill?: string;
  stroke?: string;
}

const BlueButton: React.FC<BlueButtonProps> = ({
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
        <clipPath id="5aae198d2c">
          <path d="M 188 503 L 621.960938 503 L 621.960938 936.960938 L 188 936.960938 Z M 188 503 " />
        </clipPath>
      </defs>
      <g id="09be770755"></g>
    </svg>
  );
};

export default BlueButton;

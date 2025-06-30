import React from 'react';

interface BForBridgitProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  fill?: string;
  stroke?: string;
}

const BForBridgit: React.FC<BForBridgitProps> = ({
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
      viewBox="0 0 375 374.999991"
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
      <defs />
      <g id="88d75b0eb9">
        <rect
          x="0"
          width="375"
          y="0"
          height="374.999991"
          style="fill:#ffffff;fill-opacity:1;stroke:none;"
        />
        <rect
          x="0"
          width="375"
          y="0"
          height="374.999991"
          style="fill:#ffffff;fill-opacity:1;stroke:none;"
        />
      </g>
    </svg>
  );
};

export default BForBridgit;

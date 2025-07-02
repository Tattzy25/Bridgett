import React from 'react';

interface SwapButtonProps {
  onClick: () => void;
}

const SwapButton: React.FC<SwapButtonProps> = ({ onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mx-2 sm:mx-4 transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        background: '#e0e0e0',
        boxShadow: '4px 4px 8px #bebebe, -4px -4px 8px #ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        flexShrink: 0,
        border: 'none',
        cursor: 'pointer',
        pointerEvents: 'auto'
      }}
      aria-label="Swap languages"
    >
      <span 
        style={{ 
          color: '#666', 
          fontSize: '14px',
          pointerEvents: 'none',
          userSelect: 'none'
        }} 
        className="sm:text-base"
      >
        ⇄
      </span>
    </button>
  );
};

export default SwapButton;
import React from 'react';

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  size: 'large' | 'small';
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  value,
  onChange,
  placeholder,
  size,
  className = ''
}) => {
  const isLarge = size === 'large';
  
  const baseStyle = {
    borderRadius: isLarge ? '20px' : '15px',
    background: '#e0e0e0',
    boxShadow: isLarge 
      ? 'inset 8px 8px 16px #bebebe, inset -8px -8px 16px #ffffff'
      : 'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff',
    display: 'flex',
    alignItems: 'center',
    padding: isLarge ? '0 15px' : '0 12px',
    border: 'none',
    outline: 'none',
    width: '100%',
    color: '#333',
    fontSize: isLarge ? '14px' : '12px'
  };

  const heightClass = isLarge 
    ? 'h-[60px] sm:h-[80px]' 
    : 'h-[50px] sm:h-[60px]';

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${heightClass} ${className} sm:text-base focus:shadow-inner transition-all duration-200`}
      style={baseStyle}
    />
  );
};

export default InputField;
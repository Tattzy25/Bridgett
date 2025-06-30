import React from 'react';

interface BridgitButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'bubble';
  size?: 'sm' | 'md' | 'lg';
}

const BridgitButton: React.FC<BridgitButtonProps> = ({
  onClick,
  disabled = false,
  className = '',
  children,
  variant = 'primary',
  size = 'md'
}) => {
  const baseClasses = 'transition-all duration-300 font-medium flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 shadow-md',
    secondary: 'bg-white/80 backdrop-blur-sm border border-white/20 text-gray-800 hover:bg-white shadow-sm',
    bubble: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 rounded-full shadow-lg'
  };
  
  const sizeClasses = {
    sm: 'text-xs py-1.5 px-3 rounded-lg',
    md: 'text-sm py-2.5 px-5 rounded-xl',
    lg: 'text-base py-3.5 px-7 rounded-2xl'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default BridgitButton;
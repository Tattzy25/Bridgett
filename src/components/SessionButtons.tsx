import React from 'react';

interface SessionButtonsProps {
  onHost?: () => void;
  onJoin?: () => void;
  onEnd?: () => void;
  onCode?: () => void;
  disabled?: boolean;
  className?: string;
}

const SessionButtons: React.FC<SessionButtonsProps> = ({
  onHost,
  onJoin,
  onEnd,
  onCode,
  disabled = false,
  className = ''
}) => {
  const buttonBaseClass = `
    relative overflow-hidden rounded-xl px-6 py-3 font-medium text-white
    transition-all duration-300 ease-in-out transform
    hover:scale-105 hover:shadow-lg active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const gradientClasses = {
    host: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500',
    join: 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 focus:ring-green-500',
    end: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 focus:ring-red-500',
    code: 'bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 focus:ring-gray-500'
  };

  const Button = ({ 
    onClick, 
    gradient, 
    children, 
    icon 
  }: { 
    onClick?: () => void; 
    gradient: string; 
    children: React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${buttonBaseClass} ${gradient}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon}
        {children}
      </span>
      <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300" />
    </button>
  );

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {onHost && (
        <Button onClick={onHost} gradient={gradientClasses.host}>
          Host
        </Button>
      )}
      
      {onJoin && (
        <Button onClick={onJoin} gradient={gradientClasses.join}>
          Join
        </Button>
      )}
      
      {onEnd && (
        <Button onClick={onEnd} gradient={gradientClasses.end}>
          End
        </Button>
      )}
      
      {onCode && (
        <Button 
          onClick={onCode} 
          gradient={gradientClasses.code}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          }
        >
          Code
        </Button>
      )}
    </div>
  );
};

export default SessionButtons;
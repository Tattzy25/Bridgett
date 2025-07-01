import React from 'react';

interface NeumorphicCardProps {
  children: React.ReactNode;
  className?: string;
  width?: string;
  height?: string;
}

const NeumorphicCard: React.FC<NeumorphicCardProps> = ({ 
  children, 
  className = '', 
  width = 'auto', 
  height = 'auto' 
}) => {
  return (
    <div 
      className={`${className} flex flex-col`}
      style={{
        minWidth: '350px',
        maxWidth: '450px',
        minHeight: '400px',
        width: width === 'auto' ? '100%' : width,
        height: height === 'auto' ? 'auto' : height,
        borderRadius: '50px',
        background: '#e0e0e0',
        boxShadow: '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
        padding: '30px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {children}
    </div>
  );
};

export default NeumorphicCard;
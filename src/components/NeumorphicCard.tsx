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
  width = '400px', 
  height = '500px' 
}) => {
  return (
    <div 
      className={`${className}`}
      style={{
        width,
        height,
        borderRadius: '50px',
        background: '#e0e0e0',
        boxShadow: '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {children}
    </div>
  );
};

export default NeumorphicCard;
import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1 p-2">
      <div 
        className="w-2 h-2 rounded-full animate-pulse" 
        style={{ backgroundColor: 'var(--typing-indicator-dot)', animationDelay: '0s' }}
      ></div>
      <div 
        className="w-2 h-2 rounded-full animate-pulse" 
        style={{ backgroundColor: 'var(--typing-indicator-dot)', animationDelay: '0.2s' }}
      ></div>
      <div 
        className="w-2 h-2 rounded-full animate-pulse" 
        style={{ backgroundColor: 'var(--typing-indicator-dot)', animationDelay: '0.4s' }}
      ></div>
    </div>
  );
};

export default TypingIndicator;
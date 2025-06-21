
import React from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 10 }) => {
  const sizeClasses = `w-${size} h-${size}`;
  if (!src) {
    const initial = alt.charAt(0).toUpperCase();
    return (
      <div 
        className={`${sizeClasses} rounded-full flex items-center justify-center font-semibold text-lg`}
        // Fallback uses AI message BG/Text colors. These are now palette colors.
        style={{
            backgroundColor: 'var(--message-ai-bg)', 
            color: 'var(--message-ai-text)',
            border: '1px solid var(--outline-primary)'
        }}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses} rounded-full object-cover shadow-sm`}
      style={{ border: '1px solid var(--outline-primary)' }}
    />
  );
};

export default Avatar;
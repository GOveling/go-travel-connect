
import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: 'fade-in' | 'scale-in' | 'slide-up';
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({ 
  children, 
  className = '', 
  animation = 'fade-in',
  ...props 
}) => {
  return (
    <div
      className={cn(
        'animated-container',
        `animate-${animation}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer;

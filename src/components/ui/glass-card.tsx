
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  ...props 
}) => {
  return (
    <div
      className={cn(
        'glass-card',
        hover && 'glass-card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;

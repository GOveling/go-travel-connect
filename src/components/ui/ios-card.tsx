
import React from 'react';
import { cn } from '@/lib/utils';

interface IOSCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'grouped' | 'inset';
  children: React.ReactNode;
}

const IOSCard = React.forwardRef<HTMLDivElement, IOSCardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-100 rounded-2xl shadow-sm',
      grouped: 'bg-white border-0 rounded-2xl shadow-sm',
      inset: 'bg-gray-50 border-0 rounded-xl'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'transition-all duration-200 ease-out',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

IOSCard.displayName = 'IOSCard';

export { IOSCard };


import React from 'react';
import { cn } from '@/lib/utils';

interface IOSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const IOSButton = React.forwardRef<HTMLButtonElement, IOSButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-500 hover:bg-blue-600 text-white font-medium',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium',
      tertiary: 'bg-transparent hover:bg-gray-50 text-blue-500 font-medium',
      destructive: 'bg-red-500 hover:bg-red-600 text-white font-medium'
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-xl',
      md: 'px-6 py-3 text-base rounded-2xl',
      lg: 'px-8 py-4 text-lg rounded-2xl'
    };

    return (
      <button
        ref={ref}
        className={cn(
          'transition-all duration-200 ease-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IOSButton.displayName = 'IOSButton';

export { IOSButton };

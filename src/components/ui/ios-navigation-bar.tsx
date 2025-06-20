
import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';

interface IOSNavigationBarProps {
  title: string;
  leftAction?: {
    icon?: React.ReactNode;
    label?: string;
    onClick: () => void;
  };
  rightAction?: {
    icon?: React.ReactNode;
    label?: string;
    onClick: () => void;
  };
  className?: string;
}

const IOSNavigationBar = ({ 
  title, 
  leftAction, 
  rightAction, 
  className 
}: IOSNavigationBarProps) => {
  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-lg border-b border-gray-100',
      className
    )}>
      <div className="flex-1">
        {leftAction && (
          <button
            onClick={leftAction.onClick}
            className="flex items-center space-x-1 text-blue-500 font-medium text-base active:opacity-60 transition-opacity"
          >
            {leftAction.icon}
            {leftAction.label && <span>{leftAction.label}</span>}
          </button>
        )}
      </div>
      
      <h1 className="text-lg font-semibold text-gray-900 text-center flex-1">
        {title}
      </h1>
      
      <div className="flex-1 flex justify-end">
        {rightAction && (
          <button
            onClick={rightAction.onClick}
            className="flex items-center space-x-1 text-blue-500 font-medium text-base active:opacity-60 transition-opacity"
          >
            {rightAction.label && <span>{rightAction.label}</span>}
            {rightAction.icon}
          </button>
        )}
      </div>
    </div>
  );
};

export { IOSNavigationBar };

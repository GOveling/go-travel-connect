
import React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';

interface GradientButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary';
}

const GradientButton: React.FC<GradientButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  ...props 
}) => {
  return (
    <Button
      className={cn(
        'gradient-button',
        variant === 'primary' ? 'gradient-button-primary' : 'gradient-button-secondary',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

export default GradientButton;

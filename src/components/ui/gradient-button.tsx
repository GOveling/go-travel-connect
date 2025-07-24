import React from "react";
import { Button, ButtonProps } from "./button";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: "primary" | "secondary";
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    const gradientClasses = {
      primary:
        "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white",
      secondary:
        "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "transition-all duration-300 transform hover:scale-105 hover:shadow-lg",
          gradientClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

GradientButton.displayName = "GradientButton";

export { GradientButton };

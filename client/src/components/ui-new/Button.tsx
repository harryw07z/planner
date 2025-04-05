import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  outline?: boolean;
  isLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    children, 
    variant = 'primary', 
    size = 'md', 
    outline = false,
    isLoading = false,
    iconLeft,
    iconRight,
    disabled,
    ...props 
  }, ref) => {
    // Map size to daisyUI classes
    const sizeClass = {
      xs: 'daisy-btn-xs',
      sm: 'daisy-btn-sm',
      md: 'daisy-btn-md',
      lg: 'daisy-btn-lg',
    }[size];

    return (
      <button
        className={cn(
          'daisy-btn',
          {
            [`daisy-btn-${variant}`]: variant && !outline,
            'daisy-btn-outline': outline,
            [`daisy-btn-outline daisy-btn-${variant}`]: outline && variant,
            'opacity-50 pointer-events-none': isLoading,
          },
          sizeClass,
          className
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <span className="daisy-loading daisy-loading-spinner mr-2"></span>
        )}
        {iconLeft && !isLoading && <span className="mr-2">{iconLeft}</span>}
        {children}
        {iconRight && <span className="ml-2">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
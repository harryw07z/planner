import React from 'react';
import { cn } from '@/lib/utils';

export interface DaisyBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  outline?: boolean;
}

const DaisyBadge = React.forwardRef<HTMLDivElement, DaisyBadgeProps>(
  ({ className, children, variant = 'default', size = 'md', outline = false, ...props }, ref) => {
    // Map size to daisyUI classes
    const sizeClass = {
      xs: 'daisy-badge-xs',
      sm: 'daisy-badge-sm',
      md: '',
      lg: 'daisy-badge-lg',
    }[size];

    // Map variant to daisyUI classes
    const variantClass = {
      default: '',
      primary: 'daisy-badge-primary',
      secondary: 'daisy-badge-secondary',
      accent: 'daisy-badge-accent',
      info: 'daisy-badge-info',
      success: 'daisy-badge-success',
      warning: 'daisy-badge-warning',
      error: 'daisy-badge-error',
    }[variant];

    const outlineClass = outline ? 'daisy-badge-outline' : '';

    return (
      <div
        className={cn(
          'daisy-badge',
          sizeClass,
          variantClass,
          outlineClass,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DaisyBadge.displayName = 'DaisyBadge';

export { DaisyBadge };
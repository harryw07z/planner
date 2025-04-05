import React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'> {
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info' | 'error';
  labelClassName?: string;
}

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, children, label, size = 'md', color = 'primary', labelClassName, ...props }, ref) => {
    // Map size to daisyUI classes
    const sizeClass = {
      xs: 'daisy-toggle-xs',
      sm: 'daisy-toggle-sm',
      md: '',
      lg: 'daisy-toggle-lg',
    }[size];

    // Map color to daisyUI classes
    const colorClass = {
      primary: 'daisy-toggle-primary',
      secondary: 'daisy-toggle-secondary',
      accent: 'daisy-toggle-accent',
      success: 'daisy-toggle-success',
      warning: 'daisy-toggle-warning',
      info: 'daisy-toggle-info',
      error: 'daisy-toggle-error',
    }[color];

    return (
      <div className="form-control">
        <label className={cn("daisy-label cursor-pointer flex items-center gap-2", labelClassName)}>
          {label && <span className="daisy-label-text">{label}</span>}
          <input
            type="checkbox"
            className={cn(
              'daisy-toggle',
              sizeClass,
              colorClass,
              className
            )}
            ref={ref}
            {...props}
          />
          {children}
        </label>
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };
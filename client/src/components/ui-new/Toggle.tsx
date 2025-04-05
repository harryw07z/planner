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
      xs: 'toggle-xs',
      sm: 'toggle-sm',
      md: '',
      lg: 'toggle-lg',
    }[size];

    // Map color to daisyUI classes
    const colorClass = {
      primary: 'toggle-primary',
      secondary: 'toggle-secondary',
      accent: 'toggle-accent',
      success: 'toggle-success',
      warning: 'toggle-warning',
      info: 'toggle-info',
      error: 'toggle-error',
    }[color];

    return (
      <div className="form-control">
        <label className={cn("label cursor-pointer flex items-center gap-2", labelClassName)}>
          {label && <span className="label-text">{label}</span>}
          <input
            type="checkbox"
            className={cn(
              'toggle',
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
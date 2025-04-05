import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  label?: string;
  error?: string;
  selectSize?: 'xs' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  ghost?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, options, label, error, selectSize = 'md', bordered = true, ghost = false, ...props }, ref) => {
    const id = useId();
    
    // Map size to daisyUI classes
    const sizeClass = {
      xs: 'daisy-select-xs',
      sm: 'daisy-select-sm',
      md: '',
      lg: 'daisy-select-lg',
    }[selectSize];
    
    const variantClass = bordered 
      ? 'daisy-select-bordered' 
      : ghost 
        ? 'daisy-select-ghost' 
        : '';

    return (
      <div className={cn('space-y-1.5', className)}>
        {label && (
          <label
            htmlFor={id}
            className="daisy-label text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={id}
            className={cn(
              'daisy-select w-full bg-base-100',
              sizeClass,
              variantClass,
              error && 'border-error',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            ref={ref}
            {...props}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none h-4 w-4 opacity-50" />
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
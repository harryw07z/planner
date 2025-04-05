import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  bordered?: boolean;
  ghost?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, children, label, error, bordered = true, ghost = false, ...props }, ref) => {
    const id = useId();
    
    const variantClass = bordered 
      ? 'daisy-textarea-bordered' 
      : ghost 
        ? 'daisy-textarea-ghost' 
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
          <textarea
            id={id}
            className={cn(
              'daisy-textarea w-full bg-base-100',
              variantClass,
              error && 'border-error',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
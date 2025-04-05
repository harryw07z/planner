import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends Omit<React.ProgressHTMLAttributes<HTMLProgressElement>, 'color'> {
  color?: 'default' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
}

const Progress = React.forwardRef<HTMLProgressElement, ProgressProps>(
  ({ className, color = 'default', size = 'md', indeterminate = false, ...props }, ref) => {
    // Map size to classes
    const sizeClass = {
      xs: 'h-1',
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    }[size];

    // Map color to daisyUI classes
    const colorClass = color !== 'default' ? `daisy-progress-${color}` : '';

    // Set indeterminate animation
    const indeterminateClass = indeterminate ? 'animate-progress' : '';
    
    return (
      <progress
        ref={ref}
        className={cn(
          'daisy-progress w-full',
          sizeClass,
          colorClass,
          indeterminateClass,
          className
        )}
        {...props}
      />
    );
  }
);

Progress.displayName = 'Progress';

// Add a style to the document for the indeterminate progress animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes progress {
      0% { --daisy-value: 0; }
      100% { --daisy-value: 100; }
    }
    .animate-progress {
      animation: progress 1.5s infinite linear;
    }
  `;
  document.head.appendChild(style);
}

export { Progress };
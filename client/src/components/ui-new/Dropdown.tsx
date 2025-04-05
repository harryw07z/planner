import React from 'react';
import { cn } from '@/lib/utils';

// Dropdown component
export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  hover?: boolean;
  end?: boolean;
  top?: boolean;
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({ className, children, open, hover, end, top, ...props }, ref) => {
    return (
      <div
        className={cn(
          'daisy-dropdown',
          {
            'daisy-dropdown-open': open,
            'daisy-dropdown-hover': hover,
            'daisy-dropdown-end': end,
            'daisy-dropdown-top': top,
          },
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

Dropdown.displayName = 'Dropdown';

// Dropdown Trigger component
export interface DropdownTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownTrigger = React.forwardRef<HTMLDivElement, DropdownTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('daisy-dropdown-label', className)}
        tabIndex={0}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownTrigger.displayName = 'DropdownTrigger';

// Dropdown Content component
export interface DropdownContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownContent = React.forwardRef<HTMLDivElement, DropdownContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('daisy-dropdown-content z-50 p-2 shadow-lg bg-base-100 rounded-box', className)}
        tabIndex={0}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownContent.displayName = 'DropdownContent';

export { Dropdown, DropdownTrigger, DropdownContent };
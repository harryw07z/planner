import React from 'react';
import { cn } from '@/lib/utils';

// Card component
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
  compact?: boolean;
  bgColor?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'neutral';
  noPadding?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, bordered = false, compact = false, bgColor, noPadding = false, ...props }, ref) => {
    return (
      <div
        className={cn(
          'daisy-card bg-base-100 shadow-xl',
          {
            'daisy-card-bordered': bordered,
            'daisy-card-compact': compact,
            [`bg-${bgColor}`]: bgColor,
            'p-0': noPadding,
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

Card.displayName = 'Card';

// Card Title component
export interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('daisy-card-title', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Body component
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('daisy-card-body', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

// Card Actions component
export interface CardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  vertical?: boolean;
}

const CardActions = React.forwardRef<HTMLDivElement, CardActionsProps>(
  ({ className, children, vertical = false, ...props }, ref) => {
    return (
      <div
        className={cn(
          'daisy-card-actions',
          {
            'daisy-card-actions-vertical': vertical,
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

CardActions.displayName = 'CardActions';

export { Card, CardTitle, CardBody, CardActions };
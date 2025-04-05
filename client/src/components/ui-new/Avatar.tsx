import React from 'react';
import { cn } from '@/lib/utils';

// Avatar component
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  placeholder?: string;
  image?: string;
  alt?: string;
  online?: boolean;
  offline?: boolean;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, children, size = 'md', placeholder, image, alt, online, offline, ...props }, ref) => {
    // Map size to daisyUI classes
    const sizeClass = {
      xs: 'daisy-avatar-xs',
      sm: 'daisy-avatar-sm',
      md: 'w-10 h-10', // Default size (equivalent to md)
      lg: 'daisy-avatar-lg',
      xl: 'daisy-avatar-xl',
    }[size];

    const statusClass = online ? 'daisy-online' : offline ? 'daisy-offline' : '';

    return (
      <div
        className={cn(
          'daisy-avatar',
          size !== 'md' && sizeClass,
          statusClass,
          className
        )}
        ref={ref}
        {...props}
      >
        {image ? (
          <div className="rounded-full w-full h-full">
            <img src={image} alt={alt || "Avatar"} />
          </div>
        ) : (
          children
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// AvatarFallback component
export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('daisy-placeholder rounded-full bg-neutral flex items-center justify-center overflow-hidden', className)}
        ref={ref}
        {...props}
      >
        <span className="text-neutral-content">{children}</span>
      </div>
    );
  }
);

AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarFallback };
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  color?: 'default' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
  open?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Tooltip({
  text,
  position = 'top',
  color = 'default',
  open,
  className,
  children
}: TooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Map position to daisyUI classes
  const positionClass = {
    top: 'tooltip-top',
    bottom: 'tooltip-bottom',
    left: 'tooltip-left',
    right: 'tooltip-right',
  }[position];

  // Map color to daisyUI classes
  const colorClass = color !== 'default' ? `tooltip-${color}` : '';
  
  // Determine open state (from prop or hover)
  const isOpen = open !== undefined ? open : isHovered;
  const openClass = isOpen ? 'tooltip-open' : '';

  return (
    <div
      className={cn(
        'tooltip',
        positionClass,
        colorClass,
        openClass,
        className
      )}
      data-tip={text}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
}
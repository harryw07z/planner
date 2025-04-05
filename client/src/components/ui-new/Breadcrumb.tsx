import React from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export function Breadcrumb({ items, separator = '/', className }: BreadcrumbProps) {
  return (
    <div className={cn('breadcrumbs text-sm', className)}>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <Link href={item.href}>
                <div className="flex items-center">
                  {item.icon && <span className="mr-1.5">{item.icon}</span>}
                  {item.label}
                </div>
              </Link>
            ) : item.onClick ? (
              <button 
                type="button" 
                onClick={item.onClick}
                className="flex items-center"
              >
                {item.icon && <span className="mr-1.5">{item.icon}</span>}
                {item.label}
              </button>
            ) : (
              <span className="flex items-center">
                {item.icon && <span className="mr-1.5">{item.icon}</span>}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
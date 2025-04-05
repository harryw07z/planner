import React from 'react';
import { cn } from '@/lib/utils';

// Table component
export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  compact?: boolean;
  zebra?: boolean;
  bordered?: boolean;
  hover?: boolean;
  noDividers?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, compact, zebra, bordered, hover, noDividers, ...props }, ref) => {
    return (
      <table
        className={cn(
          'daisy-table',
          {
            'daisy-table-compact': compact,
            'daisy-table-zebra': zebra,
            'daisy-table-bordered': bordered,
            'daisy-table-hover': hover,
            'daisy-table-no-dividers': noDividers,
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </table>
    );
  }
);

Table.displayName = 'Table';

// Table Head component
export interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableHead = React.forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead
        className={cn(className)}
        ref={ref}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

TableHead.displayName = 'TableHead';

// Table Body component
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody
        className={cn(className)}
        ref={ref}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

// Table Row component
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  active?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, active, ...props }, ref) => {
    return (
      <tr
        className={cn(
          {
            'daisy-active': active,
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

// Table Header Cell component
export interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | null;
}

const TableHeader = React.forwardRef<HTMLTableCellElement, TableHeaderProps>(
  ({ className, children, sortable, sorted, ...props }, ref) => {
    return (
      <th
        className={cn(
          {
            'cursor-pointer': sortable,
          },
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="flex items-center">
          {children}
          {sortable && sorted && (
            <span className="ml-1">
              {sorted === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    );
  }
);

TableHeader.displayName = 'TableHeader';

// Table Cell component
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <td
        className={cn(className)}
        ref={ref}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

export {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
};
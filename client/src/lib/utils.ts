import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CalendarDay, Feature, PriorityLevel } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a file size in bytes to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }
}

/**
 * Formats a date to a human-readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Returns the color class for a priority level
 */
export function getPriorityColorClass(priority: PriorityLevel): string {
  switch (priority) {
    case 'high':
      return 'bg-primary bg-opacity-10 text-primary';
    case 'medium':
      return 'bg-secondary bg-opacity-10 text-secondary';
    case 'low':
      return 'bg-neutral-100 text-text';
    default:
      return 'bg-neutral-100 text-text';
  }
}

/**
 * Generates calendar days for a given month
 */
export function generateCalendarDays(year: number, month: number): CalendarDay[] {
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days: CalendarDay[] = [];
  
  // Add days from previous month to fill first week
  const daysFromPrevMonth = firstDay.getDay();
  const prevMonth = new Date(year, month - 1, 0);
  
  for (let i = prevMonth.getDate() - daysFromPrevMonth + 1; i <= prevMonth.getDate(); i++) {
    const date = new Date(year, month - 1, i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      events: []
    });
  }
  
  // Add days from current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      events: []
    });
  }
  
  // Add days from next month to fill last week
  const daysFromNextMonth = 42 - days.length; // 6 rows of 7 days
  for (let i = 1; i <= daysFromNextMonth; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      events: []
    });
  }
  
  return days;
}

/**
 * Checks if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Checks if a date is between two other dates
 */
export function isDateBetween(date: Date, startDate: Date, endDate: Date): boolean {
  const d = date.getTime();
  return d >= startDate.getTime() && d <= endDate.getTime();
}

/**
 * Calculates duration in weeks based on days
 */
export function getDurationInWeeks(days: number): string {
  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'}`;
  }
  
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  
  if (remainingDays === 0) {
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  } else {
    return `${weeks} week${weeks === 1 ? '' : 's'}, ${remainingDays} day${remainingDays === 1 ? '' : 's'}`;
  }
}

/**
 * Truncates text to a certain length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Gets file extension from file name
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Gets file icon based on file type
 */
export function getFileIconColor(type: string): string {
  if (type.includes('pdf')) {
    return 'text-red-500';
  } else if (type.includes('excel') || type.includes('spreadsheet')) {
    return 'text-green-500';
  } else if (type.includes('word') || type.includes('document')) {
    return 'text-blue-500';
  } else if (type.includes('image')) {
    return 'text-purple-500';
  } else {
    return 'text-neutral-500';
  }
}

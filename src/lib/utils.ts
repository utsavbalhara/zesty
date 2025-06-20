import { type ClassValue, clsx } from "clsx"
import { formatDistanceToNow } from "date-fns"

// Simple tailwind merge function since we don't have tailwind-merge
export function twMerge(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(date: Date): string {
  // Handle invalid dates gracefully
  if (!date || isNaN(date.getTime())) {
    console.warn('Invalid date passed to formatTimeAgo:', date)
    return 'Invalid date'
  }
  
  try {
    return formatDistanceToNow(date, { addSuffix: true })
  } catch (error) {
    console.error('Error formatting date:', error, date)
    return 'Unknown time'
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
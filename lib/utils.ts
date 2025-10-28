import { clsx, type ClassValue } from "clsx"
import { DateRange } from "react-day-picker"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const parseJsonDateRange = (jsonData: any): DateRange | undefined => {
  if (!jsonData) return undefined;

  try {
    // Jika data sudah berupa object
    if (typeof jsonData === 'object') {
      return {
        from: jsonData.from ? new Date(jsonData.from) : new Date(),
        to: jsonData.to ? new Date(jsonData.to) : new Date()
      };
    }

    // Jika data berupa string JSON
    if (typeof jsonData === 'string') {
      const parsed = JSON.parse(jsonData);
      return {
        from: parsed.from ? new Date(parsed.from) : new Date(),
        to: parsed.to ? new Date(parsed.to) : new Date()
      };
    }

    return undefined;
  } catch (error) {
    console.error('Error parsing JSON date range:', error);
    return undefined;
  }
};

// Convert your string format to DateRange
export const stringToDateRange = (dateString: string): DateRange | undefined => {
  if (!dateString.includes('-')) return undefined

  const [fromString, toString] = dateString.split('-')

  try {
    const parsed = JSON.parse(dateString)
    const from = new Date(fromString)
    const to = new Date(toString)

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return undefined
    }

    return { from, to }
  } catch {
    return undefined
  }
}

// Convert DateRange back to your string format
export const dateRangeToString = (dateRange: DateRange | undefined): string => {
  if (!dateRange?.from || !dateRange?.to) return ''

  return `${dateRange.from.toISOString()}-${dateRange.to.toISOString()}`
}

export function formatDate(date: string, format: string, loc?: string) {
  const validFormats: ('medium' | 'full' | 'long' | 'short')[] = ['medium', 'full', 'long', 'short'];
  const dateStyle: 'medium' | 'full' | 'long' | 'short' = validFormats.includes(format as any)
    ? (format as 'medium' | 'full' | 'long' | 'short')
    : 'medium';
  const locs = loc ?? 'id-ID';
  const options: Intl.DateTimeFormatOptions = { dateStyle };
  return new Intl.DateTimeFormat(locs, options).format(new Date(date));
}

export function formatCurrency(value: number, currency: 'IDR' | 'USD' | 'EUR' = 'IDR') {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(value);
}
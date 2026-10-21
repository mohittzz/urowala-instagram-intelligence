// Formatters with Asia/Kolkata timezone support and clean Indian & International numeric notations

export const TIMEZONE_IST = 'Asia/Kolkata';

/**
 * Format date in Asia/Kolkata IST
 */
export function formatISTDate(dateInput: string | Date | number, formatStr: 'full' | 'short' | 'time' | 'dateOnly' = 'short'): string {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';

  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE_IST,
  };

  if (formatStr === 'short') {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE_IST, year: 'numeric', month: '2-digit', day: '2-digit' });
    const targetDay = formatter.format(date);
    const today = formatter.format(now);

    const timeFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: TIMEZONE_IST,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const timeStr = timeFormatter.format(date);

    if (targetDay === today) {
      return `Today at ${timeStr} IST`;
    }

    // Check yesterday
    const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterday = formatter.format(yesterdayDate);
    if (targetDay === yesterday) {
      return `Yesterday at ${timeStr} IST`;
    }

    const dayMonthFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: TIMEZONE_IST,
      day: 'numeric',
      month: 'short',
    });
    return `${dayMonthFormatter.format(date)}, ${timeStr} IST`;
  }

  switch (formatStr) {
    case 'full':
      options.year = 'numeric';
      options.month = 'short';
      options.day = 'numeric';
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = true;
      break;
    case 'dateOnly':
      options.year = 'numeric';
      options.month = 'short';
      options.day = 'numeric';
      break;
    case 'time':
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = true;
      break;
  }

  return new Intl.DateTimeFormat('en-IN', options).format(date) + ' IST';
}

/**
 * Format numbers with compact notation (e.g. 14.5K, 1.2M)
 */
export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  if (value === 0) return '0';

  if (Math.abs(value) >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (Math.abs(value) >= 1_000) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return value.toLocaleString('en-IN');
}

/**
 * Format exact standard integers with Indian comma separation
 */
export function formatExactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString('en-IN');
}

/**
 * Format percentages with customizable decimals
 */
export function formatPercent(value: number | null | undefined, decimals = 1, showPlus = false): string {
  if (value === null || value === undefined) return 'N/A';
  const prefix = showPlus && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(decimals)}%`;
}

/**
 * Format watch time in seconds to mm:ss or seconds format
 */
export function formatWatchTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

/**
 * Clean caption snippet for compact card displays
 */
export function truncateCaption(caption: string, maxLen = 85): string {
  if (!caption) return 'Untitled Reel';
  // Strip excess hashtags at the end for clean reading
  const clean = caption.replace(/#\w+/g, '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean || caption.slice(0, maxLen);
  return clean.slice(0, maxLen) + '...';
}

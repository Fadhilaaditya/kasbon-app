import { formatDistanceToNow, isToday, isYesterday, differenceInDays, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatRelativeTime(dateInput: string | Date): string {
  if (!dateInput) return '-';
  
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  if (isToday(date)) {
    return 'Hari ini';
  }

  if (isYesterday(date)) {
    return 'Kemarin';
  }

  const daysAgo = differenceInDays(new Date(), date);
  if (daysAgo > 0 && daysAgo <= 30) {
    return `${daysAgo} hari lalu`;
  }

  if (daysAgo < 0 && daysAgo >= -30) {
    return `${Math.abs(daysAgo)} hari lagi`;
  }

  return formatDistanceToNow(date, { addSuffix: true, locale: id });
}

export function formatDateStandard(dateInput: string | Date): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';
  
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

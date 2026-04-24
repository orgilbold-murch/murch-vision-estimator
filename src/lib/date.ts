import { format as dfFormat, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { mn } from 'date-fns/locale';

export function formatDateMN(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? parseISO(isoOrDate) : isoOrDate;
  return dfFormat(d, "yyyy 'оны' MMMM'ын' d", { locale: mn });
}

export function formatDateShortMN(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? parseISO(isoOrDate) : isoOrDate;
  return dfFormat(d, 'yyyy.MM.dd', { locale: mn });
}

export function formatDateTimeMN(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? parseISO(isoOrDate) : isoOrDate;
  return dfFormat(d, 'yyyy.MM.dd HH:mm', { locale: mn });
}

export function formatRelativeMN(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? parseISO(isoOrDate) : isoOrDate;
  return formatDistanceToNowStrict(d, { locale: mn, addSuffix: true });
}

export function daysAgo(isoOrDate: string | Date): number {
  const d = typeof isoOrDate === 'string' ? parseISO(isoOrDate) : isoOrDate;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

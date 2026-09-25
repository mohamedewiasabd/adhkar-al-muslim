import { WallParts } from './types';
import { formatHM } from './fmt';

let wallFormatterCache: Record<string, Intl.DateTimeFormat> = {};

function wallFormatter(tz: string): Intl.DateTimeFormat {
  const cached = wallFormatterCache[tz];
  if (cached) return cached;
  const nf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  wallFormatterCache[tz] = nf;
  return nf;
}

/** الساعة الجدارية (الوقت الفعلي في المنطقة الزمنية) لموقع الصلاة — تعالج DST تلقائياً. */
export function wallRoundedParts(date: Date, tz: string): WallParts {
  const parts: Record<string, string> = {};
  for (const p of wallFormatter(tz).formatToParts(date)) parts[p.type] = p.value;
  let h = parseInt(parts.hour, 10) || 0;
  if (h >= 24) h = h - 24;
  return {
    y: parseInt(parts.year, 10) || 1970,
    m: parseInt(parts.month, 10) || 1,
    d: parseInt(parts.day, 10) || 1,
    h,
    minute: parseInt(parts.minute, 10) || 0,
  };
}

/** الدقائق منذ منتصف الليل حسب ساعة المنطقة الزمنية للموقع. */
export function wallMinutesInTz(date: Date, tz: string): number {
  const p = wallRoundedParts(date, tz);
  return p.h * 60 + p.minute;
}

/** صيغة HH:MM للوقت الجداري في منطقة زمنية محددة. */
export function fmtWall(d: Date, tz: string): string {
  const p = wallRoundedParts(d, tz);
  return formatHM(p.h, p.minute);
}
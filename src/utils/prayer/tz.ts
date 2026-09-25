import { PrayerSettings } from './types';
import { wallRoundedParts } from './wall';

/** تقدير المنطقة الزمنية من الإحداثيات (مصر → القاهرة، وإلا إزاحة ثابتة من خط الطول). */
export function guessTimezone(lat: number, lng: number): string {
  if (typeof lat === 'number' && typeof lng === 'number' && lat >= 21 && lat <= 32 && lng >= 24 && lng <= 36) {
    return 'Africa/Cairo';
  }
  const off = Math.round(lng / 15);
  if (!Number.isFinite(off)) return 'Africa/Cairo';
  if (off === 0) return 'Etc/GMT';
  return off > 0 ? 'Etc/GMT-' + Math.abs(off) : 'Etc/GMT+' + Math.abs(off);
}

/** يضمن وجود منطقة زمنية صالحة (ردّ افتراضي إن لم تكن موجودة في إعدادات قديمة). */
export function normalizeTimezone(tz: string | undefined, settings?: Partial<PrayerSettings>): string {
  if (tz && tz.trim()) return tz.trim();
  return guessTimezone(settings?.lat ?? 0, settings?.lng ?? 0);
}

/** يستنتج لحظة زمنية مطلقة يكون فيها وقت الساعة الجدارية في المنطقة الزمنية هو HH:MM في التاريخ المحدد. */
export function zonedDateTimeUtc(y: number, m: number, d: number, hh: number, mm: number, tz: string): Date {
  const base = new Date(y, m - 1, d, hh, mm, 0, 0);
  for (let k = -28; k <= 28; k++) {
    const cand = new Date(base.getTime() + k * 30 * 60 * 1000);
    const p = wallRoundedParts(cand, tz);
    if (p.y === y && p.m === m && p.d === d && p.h === hh && p.minute === mm) {
      return cand;
    }
  }
  return base;
}
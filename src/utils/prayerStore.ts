import { registerPlugin } from '@capacitor/core';
import { isAndroidPlatform } from './platform';
import { DailyPrayerTimes, DEFAULT_SETTINGS, guessTimezone, PrayerSettings } from './prayerTimes';

const STORE_KEY = 'prayer_settings_v1';

interface PrayerWidgetsApi {
  setTimes(options: { date: string; times: Record<string, string> }): Promise<void>;
  forceUpdate(): Promise<void>;
}

const PrayerWidgets = registerPlugin<PrayerWidgetsApi>('PrayerWidgets');

export function prayerNativeSupported(): boolean {
  return isAndroidPlatform;
}

export function loadPrayerSettings(): PrayerSettings {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<PrayerSettings>;
    let tz = parsed.tz?.trim();
    if (!tz) tz = guessTimezone(typeof parsed.lat === 'number' ? parsed.lat : DEFAULT_SETTINGS.lat, typeof parsed.lng === 'number' ? parsed.lng : DEFAULT_SETTINGS.lng);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      tz,
      adhanPerPrayer: { ...DEFAULT_SETTINGS.adhanPerPrayer, ...(parsed.adhanPerPrayer || {}) },
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function savePrayerSettings(settings: PrayerSettings): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export async function pushTimesToWidget(times: DailyPrayerTimes): Promise<void> {
  if (!prayerNativeSupported()) return;
  try {
    await PrayerWidgets.setTimes({ date: times.date, times: times as unknown as Record<string, string> });
  } catch {
    // widget may not be placed yet; it will read prefs when rendered
  }
}

export async function forceWidgetUpdate(): Promise<void> {
  if (!prayerNativeSupported()) return;
  try {
    await PrayerWidgets.forceUpdate();
  } catch {
    // ignore
  }
}
import { computePrayerTimes, normalizeTimezone, PRAYER_ORDER, PrayerSettings, wallMinutesInTz } from './prayerTimes';

const LAST_KEY = 'last_adhan_played_v1';

let adhanEl: HTMLAudioElement | null = null;

export function loadAdhanAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!adhanEl) {
    try {
      adhanEl = new Audio('adhan.mp3');
      adhanEl.preload = 'auto';
    } catch {
      adhanEl = null;
    }
  }
  return adhanEl;
}

export function playAdhanNow(): void {
  const el = loadAdhanAudio();
  if (!el) return;
  try {
    el.currentTime = 0;
    const p = el.play();
    if (p && typeof p.then === 'function') {
      p.catch(() => {
        // autoplay policy may block; the native notification covers background case
      });
    }
  } catch {
    // ignore
  }
}

export function stopAdhan(): void {
  const el = loadAdhanAudio();
  if (el) {
    try {
      el.pause();
      el.currentTime = 0;
    } catch {
      // ignore
    }
  }
}

function wasPlayed(date: string, prayer: string): boolean {
  try {
    const saved = localStorage.getItem(LAST_KEY);
    return saved === `${date}|${prayer}`;
  } catch {
    return false;
  }
}

function markPlayed(date: string, prayer: string): void {
  try {
    localStorage.setItem(LAST_KEY, `${date}|${prayer}`);
  } catch {
    // ignore
  }
}

/**
 * يُستدعى من مؤقّت كل دقيقة داخل التطبيق؛ إذا دخل وقت صلاة وتم تفعيل الأذان
 * في التطبيق لم تُشغّل أذاناً من قبل لهذه الصلاة في هذا اليوم، يشغّل الأذان.
 */
export function checkAndPlayAdhanInApp(now: Date, settings: PrayerSettings): boolean {
  if (!settings.adhanEnabled) return false;
  try {
    const tz = normalizeTimezone(settings.tz, settings);
    const times = computePrayerTimes(now, settings);
    const curMin = wallMinutesInTz(now, tz);

    for (const name of PRAYER_ORDER) {
      if (!settings.adhanPerPrayer[name]) continue;
      const [th, tm] = times[name].split(':').map(Number);
      if ((th * 60 + tm) === curMin) {
        if (!wasPlayed(times.date, name)) {
          markPlayed(times.date, name);
          playAdhanNow();
          return true;
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}
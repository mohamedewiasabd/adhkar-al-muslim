import { DailyPrayerTimes, NextPrayer, PRAYER_ARABIC, PRAYER_ORDER, PrayerName } from './types';
import { wallMinutesInTz } from './wall';
import { minutesOfHM } from './fmt';

export function nowMinutes(): number {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

export function nextPrayerInfo(now: Date, times: DailyPrayerTimes, tz: string): NextPrayer {
  const nowMin = wallMinutesInTz(now, tz);

  let best: PrayerName | null = null;
  let bestMin = 0;

  for (const name of PRAYER_ORDER) {
    const m = minutesOfHM(times[name]);
    if (m > nowMin) {
      best = name;
      bestMin = m;
      break;
    }
  }

  if (!best) {
    best = 'fajr';
    bestMin = minutesOfHM(times.fajr) + 1440;
    return {
      name: best,
      arabic: PRAYER_ARABIC[best],
      time: times.fajr,
      minutesLeft: bestMin - nowMin,
      isTomorrow: true,
      date: times.date,
    };
  }

  return {
    name: best,
    arabic: PRAYER_ARABIC[best],
    time: times[best],
    minutesLeft: bestMin - nowMin,
    isTomorrow: false,
    date: times.date,
  };
}

export function nextPrayerTimeMySQLStyle(times: DailyPrayerTimes): { HH: number; MM: number } {
  return { HH: 0, MM: 0 };
}

export function formatCountdown(totalMinutes: number): string {
  if (totalMinutes <= 0) return 'حان الوقت الآن';
  if (totalMinutes < 60) return `بعد ${totalMinutes} دقيقة`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m === 0 ? `بعد ${h} ساعة` : `بعد ${h} ساعة و ${m} دقيقة`;
}
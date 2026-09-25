import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  computePrayerTimes, guessTimezone, nextPrayerInfo, wallRoundedParts, zonedDateTimeUtc
} from '../utils/prayerTimes';
import { DailyPrayerTimes, NextPrayer, PrayerSettings } from '../utils/prayer/types';
import { loadPrayerSettings, pushTimesToWidget, savePrayerSettings } from '../utils/prayerStore';
import {
  prayerNotificationStatus, requestPrayerNotificationPermission, schedulePrayerNotifications
} from '../utils/prayerNotifications';
import { canScheduleExactAlarms, requestExactAlarmPermission } from '../utils/exactAlarm';

export type NotifState = 'pending' | 'granted' | 'denied';
export type ExactState = 'pending' | 'granted' | 'denied';

function timeToTarget(next: NextPrayer, tz: string): Date | null {
  try {
    const [h, m] = next.time.split(':').map(Number);
    const p = wallRoundedParts(new Date(), tz);
    const d = new Date(p.y, p.m - 1, p.d);
    if (next.isTomorrow) d.setDate(d.getDate() + 1);
    return zonedDateTimeUtc(d.getFullYear(), d.getMonth() + 1, d.getDate(), h, m, tz);
  } catch {
    return null;
  }
}

export interface UsePrayerTimesResult {
  settings: PrayerSettings;
  applySettings: (patch: Partial<PrayerSettings>) => void;
  now: Date;
  times: DailyPrayerTimes;
  next: NextPrayer;
  countdown: string;
  notifState: NotifState;
  exactState: ExactState;
  toast: { msg: string; err?: boolean } | null;
  scheduling: boolean;
  requestPerms: () => Promise<void>;
  requestExactPerms: () => Promise<void>;
  rescheduleNow: () => Promise<void>;
}

export const usePrayerTimes = (): UsePrayerTimesResult => {
  const [settings, setSettings] = useState<PrayerSettings>(() => loadPrayerSettings());
  const [now, setNow] = useState(() => new Date());
  const [notifState, setNotifState] = useState<NotifState>('pending');
  const [exactState, setExactState] = useState<ExactState>('pending');
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null);
  const [scheduling, setScheduling] = useState(false);

  const tz = settings.tz || guessTimezone(settings.lat, settings.lng);
  const wallNow = useMemo(() => wallRoundedParts(now, tz), [now, tz]);
  const minuteKey = wallNow.h * 60 + wallNow.minute;
  const dateKeyString = wallNow.y + '-' + String(wallNow.m).padStart(2, '0') + '-' + String(wallNow.d).padStart(2, '0');

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const todayInTz = useMemo(() => new Date(wallNow.y, wallNow.m - 1, wallNow.d), [dateKeyString]);
  const times = useMemo(() => computePrayerTimes(todayInTz, settings), [minuteKey, todayInTz, settings]);

  const next = useMemo(() => nextPrayerInfo(now, times, tz), [now, times, tz]);

  const target = useMemo(() => timeToTarget(next, tz), [next, tz]);

  const countdown = useMemo(() => {
    if (!target) return '—';
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return 'حان الوقت الآن';
    const totalSec = Math.floor(diff / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const p = (n: number) => String(n).padStart(2, '0');
    return h > 0 ? `${p(h)}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
  }, [target, now]);

  useEffect(() => {
    prayerNotificationStatus().then(setNotifState).catch(() => setNotifState('pending'));
    canScheduleExactAlarms().then(ok => setExactState(ok ? 'granted' : 'denied')).catch(() => setExactState('granted'));
    schedulePrayerNotifications(settings).catch(() => {});
  }, []);

  useEffect(() => {
    const onFocus = () => {
      canScheduleExactAlarms().then(ok => setExactState(ok ? 'granted' : 'denied')).catch(() => {});
      prayerNotificationStatus().then(setNotifState).catch(() => {});
      if (notifState === 'granted') schedulePrayerNotifications(settingsRef.current).catch(() => {});
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [notifState]);

  useEffect(() => {
    pushTimesToWidget(times);
  }, [minuteKey, settings]);

  const showToast = useCallback((msg: string, err?: boolean) => {
    setToast({ msg, err });
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, []);

  const settingsRef = useRef(settings);
  const debounceRef = useRef<number>(0);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const rescheduleNow = useCallback(async () => {
    const s = settingsRef.current;
    setScheduling(true);
    try {
      const n = await schedulePrayerNotifications(s);
      showToast(n > 0 ? `تمت جدولة ${n} إشعاراً لمواقيت الصلاة` : 'تمت إعادة جدولة الإشعارات');
    } catch {
      showToast('تعذرت جدولة الإشعارات', true);
    } finally {
      setScheduling(false);
    }
  }, [showToast]);

  const persist = useCallback((patch: Partial<PrayerSettings>) => {
    const nextSettings = { ...settingsRef.current, ...patch };
    if (patch.lat !== undefined || patch.lng !== undefined) {
      nextSettings.tz = guessTimezone(nextSettings.lat, nextSettings.lng);
    }
    settingsRef.current = nextSettings;
    setSettings(nextSettings);
    savePrayerSettings(nextSettings);
    pushTimesToWidget(computePrayerTimes(new Date(), nextSettings));
  }, []);

  const applySettings = useCallback((patch: Partial<PrayerSettings>) => {
    persist(patch);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      rescheduleNow();
    }, 900);
  }, [persist, rescheduleNow]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const requestPerms = useCallback(async () => {
    const ok = await requestPrayerNotificationPermission();
    setNotifState(ok ? 'granted' : 'denied');
    if (ok) {
      const exact = await requestExactAlarmPermission();
      setExactState(exact ? 'granted' : 'denied');
      rescheduleNow();
    }
  }, [rescheduleNow]);

  const requestExactPerms = useCallback(async () => {
    const exact = await requestExactAlarmPermission();
    setExactState(exact ? 'granted' : 'denied');
  }, []);

  return { settings, applySettings, now, times, next, countdown, notifState, exactState, toast, scheduling, requestPerms, requestExactPerms, rescheduleNow };
};
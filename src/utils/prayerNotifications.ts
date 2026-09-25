import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { addMinutesToHM, computePrayerTimes, normalizeTimezone, PRAYER_ARABIC, PRAYER_ORDER, PrayerName, PrayerSettings, wallRoundedParts, zonedDateTimeUtc } from './prayerTimes';

const isNative = (): boolean => Capacitor.isNativePlatform();

const IDS_KEY = 'prayer_scheduled_ids_v1';
const SIG_KEY = 'prayer_scheduled_sig_v1';

function localDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildSig(day: string, count: number, settings: PrayerSettings): string {
  return `${day}|${count}|${JSON.stringify(settings)}`;
}

/** يرجع الجدولة الحالية إن كانت مطابقة (نفس اليوم ونفس الإعدادات) دون إعادة بنائها. */
function savedSig(settings: PrayerSettings): { match: boolean; count: number } {
  try {
    const raw = localStorage.getItem(SIG_KEY);
    if (!raw) return { match: false, count: 0 };
    const parts = raw.split('|');
    if (parts.length < 3) return { match: false, count: 0 };
    if (parts[0] !== localDayKey(new Date())) return { match: false, count: 0 };
    const count = parseInt(parts[1], 10) || 0;
    if (parts.slice(2).join('|') !== JSON.stringify(settings)) return { match: false, count: 0 };
    return { match: true, count };
  } catch {
    return { match: false, count: 0 };
  }
}

function saveSig(day: string, count: number, settings: PrayerSettings): void {
  try {
    localStorage.setItem(SIG_KEY, buildSig(day, count, settings));
  } catch {
    // ignore
  }
}

/** مفتاح تشفير مختلف عن مفتاح إشعارات الأذكار لضمان عدم تصادم المعرّفات. */
function prayHash(str: string): number {
  let h = 7;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return 900_000_000 + (h % 1_000_000_000);
}

function loadSavedIds(): number[] {
  try {
    const raw = localStorage.getItem(IDS_KEY);
    return raw ? JSON.parse(raw) as number[] : [];
  } catch {
    return [];
  }
}

function saveIds(ids: number[]): void {
  try {
    localStorage.setItem(IDS_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export async function prayerNotificationStatus(): Promise<'granted' | 'denied' | 'pending'> {
  if (!isNative()) return 'pending';
  try {
    const s = await LocalNotifications.checkPermissions();
    return (s.display as string) === 'granted' ? 'granted' : (s.display as string) === 'denied' ? 'denied' : 'pending';
  } catch {
    return 'pending';
  }
}

export async function requestPrayerNotificationPermission(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const s = await LocalNotifications.requestPermissions();
    return (s.display as string) === 'granted';
  } catch {
    return false;
  }
}

async function ensureChannels(): Promise<void> {
  if (!isNative()) return;
  try {
    await LocalNotifications.createChannel({
      id: 'prayer-times',
      name: 'مواقيت الصلاة',
      description: 'تذكير باقتراب مواقيت الصلاة',
      importance: 5,
      visibility: 1,
      sound: 'default',
      vibration: true,
      lights: true,
    });
    await LocalNotifications.createChannel({
      id: 'prayer-adhan',
      name: 'الأذان',
      description: 'صوت الأذان في دخول وقت الصلاة',
      importance: 5,
      visibility: 1,
      sound: 'adhan',
      vibration: true,
      lights: true,
    });
  } catch {
    // channels may already exist or not supported
  }
}

async function cancelPrevious(): Promise<void> {
  const ids = loadSavedIds();
  if (ids.length === 0) return;
  try {
    await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem(IDS_KEY);
  } catch {
    // ignore
  }
}

// أندرويد يسمح بـ 500 إنذار فقط لكل تطبيق؛ نخصّص لمواقيت الصلاة حصّة آمنة
// (تُجدَّد يومياً عند فتح التطبيق) ونترك الباقي للتنبيهات الأخرى.
const MAX_ALARMS = 220;
const MAX_DAYS = 15;
const SCHEDULE_HORIZON_DAYS = 30;

export async function schedulePrayerNotifications(settings: PrayerSettings): Promise<number> {
  if (!isNative()) return 0;
  try {
    // لا نطلب الإذن تلقائياً عند فتح التطبيق؛ الطلب يتم فقط من شاشة «مواقيت الصلاة».
    const perm = await LocalNotifications.checkPermissions();
    if ((perm.display as string) !== 'granted') return 0;

    const today = localDayKey(new Date());

    if (!settings.reminderEnabled && !settings.adhanEnabled && !settings.owabinReminder && !settings.tahajjudReminder) {
      try {
        localStorage.removeItem(SIG_KEY);
      } catch {
        // ignore
      }
      await cancelPrevious();
      return 0;
    }

    const cached = savedSig(settings);
    if (cached.match) return cached.count;

    await cancelPrevious();
    await ensureChannels();

    // عدد تنبيهات اليوم الواحد (تذكير+أذان لكل صلاة + أوابين + ثلث الليل)
    const perDayChoices = PRAYER_ORDER.filter(n => settings.adhanEnabled && settings.adhanPerPrayer[n]).length
      + (settings.reminderEnabled && settings.reminderLead > 0 ? PRAYER_ORDER.length : 0)
      + (settings.owabinReminder && settings.reminderEnabled ? 1 : 0)
      + (settings.tahajjudReminder && settings.reminderEnabled ? 1 : 0);
    const perDay = Math.max(1, perDayChoices);
    const horizon = Math.min(SCHEDULE_HORIZON_DAYS, MAX_ALARMS / perDay, MAX_DAYS);

    const now = new Date();
    const tz = normalizeTimezone(settings.tz, settings);
    const wp = wallRoundedParts(now, tz);
    const pending: { id: number; title: string; body: string; at: Date; channelId: string }[] = [];
    const scheduledIds: number[] = [];

    for (let d = 0; d < horizon; d++) {
      const day = new Date(wp.y, wp.m - 1, wp.d + d);
      const t = computePrayerTimes(day, settings);
      const dayKey = t.date;
      const y = day.getFullYear();
      const mo = day.getMonth() + 1;
      const dd = day.getDate();

      for (const name of PRAYER_ORDER) {
        const hhmm = t[name];
        const [h, m] = hhmm.split(':').map(Number);

        if (settings.reminderEnabled && settings.reminderLead > 0) {
          const remHM = addMinutesToHM(hhmm, -settings.reminderLead);
          const [rh, rm] = remHM.split(':').map(Number);
          const at = zonedDateTimeUtc(y, mo, dd, rh, rm, tz);
          const id = prayHash(`${dayKey}-${name}-rem`);
          pending.push({
            id,
            title: `اقترب موعد صلاة ${PRAYER_ARABIC[name]}`,
            body: `أذان ${PRAYER_ARABIC[name]} في ${hhmm} — متبقي ${settings.reminderLead} دقائق`,
            at,
            channelId: 'prayer-times',
          });
          scheduledIds.push(id);
        }

        if (settings.adhanEnabled && settings.adhanPerPrayer[name]) {
          const at = zonedDateTimeUtc(y, mo, dd, h, m, tz);
          const id = prayHash(`${dayKey}-${name}-adhan`);
          pending.push({
            id,
            title: `حان موعد أذان ${PRAYER_ARABIC[name]}`,
            body: 'الله أكبر الله أكبر… حان وقت الصلاة، حي على الصلاة',
            at,
            channelId: 'prayer-adhan',
          });
          scheduledIds.push(id);
        }
      }

      if (settings.owabinReminder && settings.reminderEnabled) {
        const [oh, om] = t.owabin.split(':').map(Number);
        const at = zonedDateTimeUtc(y, mo, dd, oh, om, tz);
        const id = prayHash(`${dayKey}-owabin`);
        pending.push({
          id,
          title: 'حانت صلاة الأوابين (الضحى)',
          body: `وقت صلاة الأوابين الآن ${t.owabin} — قبل الظهر بساعة`,
          at,
          channelId: 'prayer-times',
        });
        scheduledIds.push(id);
      }

      if (settings.tahajjudReminder && settings.reminderEnabled && t.lastThird) {
        const [lh, lm] = t.lastThird.split(':').map(Number);
        const at = zonedDateTimeUtc(y, mo, dd, lh, lm, tz);
        const id = prayHash(`${dayKey}-tahajjud`);
        pending.push({
          id,
          title: 'قام ليلك 🌙',
          body: `حان الآن الثلث الأخير من الليل — وقت قيام الليل والدعاء قبل الفجر (${t.fajr})`,
          at,
          channelId: 'prayer-times',
        });
        scheduledIds.push(id);
      }
    }

    const nowMs = Date.now();
    const future = pending.filter(n => n.at.getTime() > nowMs);
    if (future.length === 0) {
      saveIds([]);
      saveSig(today, 0, settings);
      return 0;
    }

    const result = await LocalNotifications.schedule({
      notifications: future.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        schedule: { at: n.at, allowWhileIdle: true },
        channelId: n.channelId,
        smallIcon: 'ic_launcher_foreground',
        extra: { type: 'prayer' },
      })),
    });

    const demoted = !!(result as any).warning;
    if (demoted) {
      // دون دقة الزمن المحدد، نكتفي بالإشعارات غير الحتمية — المهم إشعار المستخدم
    }
    saveIds(future.map(n => n.id));
    saveSig(today, future.length, settings);
    return future.length;
  } catch {
    return 0;
  }
}

export async function clearPrayerNotifications(): Promise<void> {
  if (!isNative()) return;
  try {
    await cancelPrevious();
  } catch {
    // ignore
  }
}
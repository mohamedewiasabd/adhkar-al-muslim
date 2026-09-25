import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ReminderSettings } from '../types';
import { initialAdhkarData, quickReminderAdhkar } from '../data/adhkarData';

const isNative = (): boolean => Capacitor.isNativePlatform();

function hashId(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 2147483647;
}

function shortText(s: string, max = 170): string {
  const clean = s.replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max) + '…' : clean;
}

const dhikrPool = {
  morning: () => initialAdhkarData.filter(a => a.category === 'morning'),
  evening: () => initialAdhkarData.filter(a => a.category === 'evening'),
  periodic: () => quickReminderAdhkar
};

function pick(group: 'morning' | 'evening' | 'periodic', seed: number): string {
  const list = dhikrPool[group]();
  if (list.length === 0) return 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ';
  const index = seed % list.length;
  const item = list[index] as any;
  return item.text || item.arabic || 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ';
}

async function ensureChannel(settings: ReminderSettings): Promise<void> {
  if (!isNative()) return;
  try {
    await LocalNotifications.createChannel({
      id: 'adhkar-morning-evening',
      name: 'أذكار المسلم',
      description: 'تذكير بذكر الله وأدعية الأوقات',
      importance: 5,
      visibility: 1,
      sound: settings.soundEnabled ? 'default' : undefined,
      vibration: settings.vibrateEnabled,
      lights: true
    });
  } catch {
    // channel may already exist or not supported
  }
}

function timeToDate(hhmm: string, day: Date): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}

const WAKE_START = '06:45';
const WAKE_END = '21:15';

function parseHM(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export async function getSystemNotificationStatus(): Promise<'granted' | 'denied' | 'pending' | 'unsupported'> {
  if (!isNative()) return 'unsupported';
  try {
    const status = await LocalNotifications.checkPermissions();
    return (status.display as string) === 'granted' ? 'granted' : ((status.display as string) === 'denied' ? 'denied' : 'pending');
  } catch {
    return 'pending';
  }
}

export async function requestSystemNotificationPermission(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const status = await LocalNotifications.requestPermissions();
    return (status.display as string) === 'granted';
  } catch {
    return false;
  }
}

/**
 * Exact alarms (needed for timed reminders to fire ON TIME on Android 12+)
 * require a separate "Alarms & reminders" system grant that is DENIED by
 * default on Android 14+ for apps targeting SDK 33+.
 */
export type ExactAlarmStatus = 'granted' | 'denied' | 'unsupported';

export async function checkExactAlarmStatus(): Promise<ExactAlarmStatus> {
  if (!isNative()) return 'unsupported';
  try {
    const res = await (LocalNotifications as any).checkExactNotificationSetting();
    return (res?.exact_alarm as string) === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'unsupported';
  }
}

/**
 * Opens the system "Alarms & reminders" screen so the user can grant exact
 * alarms. Resolves with the updated status when the user returns to the app.
 */
export async function requestExactAlarmSettings(): Promise<ExactAlarmStatus> {
  if (!isNative()) return 'unsupported';
  try {
    const res = await (LocalNotifications as any).changeExactNotificationSetting();
    return (res?.exact_alarm as string) === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

/**
 * Schedules real system notifications that fire even when the app is closed:
 * - Morning adhkar at settings.morningTime for the next 30 days
 * - Evening adhkar at settings.eveningTime for the next 30 days
 * - Periodic dhikr every settings.intervalMinutes within waking hours (next 3-7 days)
 */
export async function syncSystemNotifications(settings: ReminderSettings): Promise<{ scheduled: number; exactAlarms: boolean }> {
  if (!isNative()) return { scheduled: 0, exactAlarms: false };
  try {
    // لا نطلب الإذن تلقائياً أثناء فتح التطبيق؛ الإذن يُطلب من إعدادات التذكير فقط.
    const perm = await LocalNotifications.checkPermissions();
    if ((perm.display as string) !== 'granted') return { scheduled: 0, exactAlarms: false };

    await LocalNotifications.cancelAll();
    if (!settings.enabled) return { scheduled: 0, exactAlarms: false };
    await ensureChannel(settings);

    const now = new Date();
    const pending: { id: number; title: string; body: string; at: Date; type: string }[] = [];

    // Morning & evening for next 30 days
    for (let d = 0; d < 30; d++) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
      pending.push({
        id: hashId(`m-${day.toISOString()}-${settings.morningTime}`),
        title: 'أذكار الصباح ☀️',
        body: shortText(pick('morning', day.getDate())),
        at: timeToDate(settings.morningTime, day),
        type: 'morning'
      });
      pending.push({
        id: hashId(`e-${day.toISOString()}-${settings.eveningTime}`),
        title: 'أذكار المساء 🌙',
        body: shortText(pick('evening', day.getDate() * 7)),
        at: timeToDate(settings.eveningTime, day),
        type: 'evening'
      });
    }

    // Qiyam al-Layl reminder: يُرسل قبل وقت القيام بنصف ساعة (مفاتيح قيام الليل)
    if (settings.qiyamEnabled && settings.qiyamTime) {
      const [qh, qm] = settings.qiyamTime.split(':').map(Number);
      for (let d = 0; d < 30; d++) {
        const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
        const at = new Date(day);
        at.setHours(qh, qm - 30, 0, 0);
        pending.push({
          id: hashId(`q-${day.toISOString()}`),
          title: 'مفاتيح قيام الليل 🔑',
          body: 'بعد نصف ساعة يقوم الله لنفسه عبادُهُ الصالحون. ابدأ بها عشراً عشراً: الله أكبر، الحمد لله، سبحان الله وبحمده، سبحان الملك القدوس، الاستغفار، لا إله إلا الله، وأعذ بالله من ضيق الدنيا ويوم القيامة.',
          at,
          type: 'qiyam'
        });
      }
    }

    // Periodic dhikr during waking hours
    let periodicDays = settings.intervalMinutes <= 15 ? 3 : settings.intervalMinutes <= 30 ? 5 : 7;
    const startMin = parseHM(WAKE_START);
    const endMin = parseHM(WAKE_END);
    // حصّة آمنة من أندرويد (500 إنذار حدّ أقصى) مع ترك مساحة لباقي التنبيهات.
    const gridPerDay = Math.max(1, Math.ceil((endMin - startMin + 1) / settings.intervalMinutes));
    periodicDays = Math.max(1, Math.min(periodicDays, Math.floor(110 / gridPerDay)));
    const mStart = parseHM(settings.morningTime);
    const eStart = parseHM(settings.eveningTime);

    for (let d = 0; d < periodicDays; d++) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
      for (let t = startMin; t <= endMin; t += settings.intervalMinutes) {
        // skip collisions with morning/evening slots
        if (t === mStart || t === eStart) continue;
        const hh = String(Math.floor(t / 60)).padStart(2, '0');
        const mm = String(t % 60).padStart(2, '0');
        pending.push({
          id: hashId(`p-${day.toISOString()}-${hh}:${mm}`),
          title: 'لحظة ذكر وطمأنينة ✨',
          body: shortText(pick('periodic', day.getDate() + t)),
          at: timeToDate(`${hh}:${mm}`, day),
          type: 'dhikr'
        });
      }
    }

    const nowMS = Date.now();
    const future = pending.filter(n => n.at.getTime() > nowMS);
    if (future.length === 0) return { scheduled: 0, exactAlarms: false };

    const result = await LocalNotifications.schedule({
      notifications: future.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        schedule: {
          at: n.at,
          allowWhileIdle: true
        },
        channelId: 'adhkar-morning-evening',
        smallIcon: 'ic_launcher_foreground',
        extra: { type: n.type }
      }))
    });
    // If schedule() warns us, timed reminders were demoted to inexact alarms
    // and may be delayed (this is how the timer was failing).
    const demoted = !!(result as any).warning;
    return { scheduled: future.length, exactAlarms: !demoted };
  } catch {
    return { scheduled: 0, exactAlarms: false };
  }
}

/** Sends one immediate notification to preview the look & feel. */
export async function sendTestSystemNotification(settings: ReminderSettings): Promise<boolean> {
  if (!isNative()) return false;
  try {
    await ensureChannel(settings);
    const r = quickReminderAdhkar[Math.floor(Math.random() * quickReminderAdhkar.length)];
    await LocalNotifications.schedule({
      notifications: [{
        id: hashId(`test-${Date.now()}`),
        title: 'تذكير بذكر الله ✨',
        body: shortText(r.text),
        schedule: { at: new Date(Date.now() + 2000) },
        channelId: 'adhkar-morning-evening',
        smallIcon: 'ic_launcher_foreground',
        extra: { type: 'test' }
      }]
    });
    return true;
  } catch {
    return false;
  }
}
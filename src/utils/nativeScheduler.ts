import { Capacitor } from '@capacitor/core';
import { isAndroidPlatform } from './platform';
import nativePlugin from './nativePlugin';
import { ReminderSettings } from '../types';
import { PrayerSettings } from './prayer/types';
import { initialAdhkarData, quickReminderAdhkar } from '../data/adhkarData';

/**
 * جسر الإعدادات مع المجدول الأصلي (أندرويد).
 *
 * لماذا؟ لأن الجدولة عبر JavaScript محدودة المدى: تُجدول لـ 30 يوماً فقط
 * وتحتاج فتح التطبيق لتتجدّد، فتتوقف الإشعارات والودجات تلقائياً.
 * المجدول الأصلي يعمل ذاتياً ويبقى صالحاً indefinitely.
 */

const scheduler = nativePlugin('NativeScheduler');

/** نصوص إشعارات الأذكار (تُستخدم في الإشعار اليومي والدوري). */
function adhkarPools() {
  const morning = initialAdhkarData
    .filter((a) => a.category === 'morning')
    .slice(0, 14)
    .map((a) => a.text);
  const evening = initialAdhkarData
    .filter((a) => a.category === 'evening')
    .slice(0, 14)
    .map((a) => a.text);
  const periodic = quickReminderAdhkar.slice(0, 24).map((a) => a.text);
  return { morning, evening, periodic };
}

export function nativeSchedulerAvailable(): boolean {
  return isAndroidPlatform && scheduler.available();
}

/** يرسل إعدادات التذكير إلى المجدول الأصلي. */
export async function syncReminderToNative(settings: ReminderSettings): Promise<boolean> {
  if (!nativeSchedulerAvailable()) return false;
  const pools = adhkarPools();
  try {
    await scheduler.call('configure', {
      adhkar: JSON.stringify({
        enabled: settings.enabled,
        morningTime: settings.morningTime,
        eveningTime: settings.eveningTime,
        intervalMinutes: settings.intervalMinutes,
        qiyamEnabled: settings.qiyamEnabled,
        qiyamTime: settings.qiyamTime,
        soundEnabled: settings.soundEnabled,
        vibrateEnabled: settings.vibrateEnabled,
        morningPool: pools.morning,
        eveningPool: pools.evening,
        periodicPool: pools.periodic,
      }),
    });
    return true;
  } catch {
    return false;
  }
}

/** يرسل إعدادات مواقيت الصلاة إلى المجدول الأصلي. */
export async function syncPrayerToNative(settings: PrayerSettings): Promise<boolean> {
  if (!nativeSchedulerAvailable()) return false;
  try {
    await scheduler.call('configure', {
      prayer: JSON.stringify({
        enabled: true,
        lat: settings.lat,
        lng: settings.lng,
        method: settings.method,
        asr: settings.asr,
        highLats: settings.highLats,
        fajrAngle: settings.fajrAngle,
        ishaAngle: settings.ishaAngle,
        tz: settings.tz,
        adhanEnabled: settings.adhanEnabled,
        adhanPerPrayer: settings.adhanPerPrayer,
        reminderEnabled: settings.reminderEnabled,
        reminderLead: settings.reminderLead,
        owabinReminder: settings.owabinReminder,
        tahajjudReminder: settings.tahajjudReminder,
      }),
    });
    return true;
  } catch {
    return false;
  }
}

/** إعادة بناء الجدولة فوراً (مثلاً بعد تغيير الأذان). */
export async function resyncNative(): Promise<boolean> {
  if (!nativeSchedulerAvailable()) return false;
  try {
    await scheduler.call('sync', {});
    return true;
  } catch {
    return false;
  }
}

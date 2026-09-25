import { useEffect } from 'react';
import { ReminderSettings } from '../types';
import { InAppAlert, subscribeToAlerts, triggerAutoReminder } from '../utils/notifications';
import { syncSystemNotifications } from '../utils/adhkarNotifications';
import { syncDuaOverlay } from '../utils/duaOverlay';
import { initAds } from '../utils/ads';
import { loadPrayerSettings, pushTimesToWidget } from '../utils/prayerStore';
import { checkAndPlayAdhanInApp } from '../utils/adhanPlayer';
import { schedulePrayerNotifications } from '../utils/prayerNotifications';
import { computePrayerTimes } from '../utils/prayerTimes';
import { pushTasbeehChainToWidget } from '../utils/tasbeehWidget';

interface UseAppEffectsOptions {
  isDarkMode: boolean;
  reminderSettings: ReminderSettings;
  setCurrentAlert: (alert: InAppAlert | null) => void;
}

/** الآثار الجانبية العامة للتطبيق: الوضع الداكن، التذكيرات، الصلاة، والإعلانات. */
export function useAppEffects({ isDarkMode, reminderSettings, setCurrentAlert }: UseAppEffectsOptions) {
  // Apply Dark Mode class to <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('noor_dark_mode_pref_v2', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('noor_dark_mode_pref_v2', 'false');
    }
  }, [isDarkMode]);

  // Subscribe to In-App Alerts
  useEffect(() => {
    const unsubscribe = subscribeToAlerts((alert) => {
      setCurrentAlert(alert);
    });
    return unsubscribe;
  }, [setCurrentAlert]);

  // Automatic Periodic Reminder Engine
  useEffect(() => {
    if (!reminderSettings.enabled) return;

    let lastSentTimestamp = Date.now();

    const intervalId = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      // Check morning specific time
      if (currentTimeStr === reminderSettings.morningTime && now.getSeconds() < 10) {
        triggerAutoReminder(reminderSettings, 'morning');
        return;
      }

      // Check evening specific time
      if (currentTimeStr === reminderSettings.eveningTime && now.getSeconds() < 10) {
        triggerAutoReminder(reminderSettings, 'evening');
        return;
      }

      // Periodic interval check: show a dua mid-screen every intervalMinutes
      const elapsedMinutes = (Date.now() - lastSentTimestamp) / (1000 * 60);
      if (elapsedMinutes >= reminderSettings.intervalMinutes) {
        lastSentTimestamp = Date.now();
        triggerAutoReminder(reminderSettings, 'dua');
      }
    }, 15000); // Check every 15s

    return () => clearInterval(intervalId);
  }, [reminderSettings]);

  // Schedule real system notifications (work even after the app is closed)
  useEffect(() => {
    syncSystemNotifications(reminderSettings);
    syncDuaOverlay(reminderSettings);
  }, [reminderSettings]);

  // Prayer times: push today's times to the home widget.
  // جدولة الإشعارات لا تُطلب الإذن تلقائياً؛ تُنفَّذ فقط إن كان الإذن ممنوحاً وبعد استقرار فتح التطبيق.
  useEffect(() => {
    const push = () => {
      try {
        pushTimesToWidget(computePrayerTimes(new Date(), loadPrayerSettings()));
      } catch {
        // ignore
      }
      pushTasbeehChainToWidget().catch(() => {});
    };
    push();
    const onFocus = () => push();
    window.addEventListener('focus', onFocus);
    const t = setTimeout(() => {
      schedulePrayerNotifications(loadPrayerSettings()).catch(() => {});
    }, 3500);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearTimeout(t);
    };
  }, []);

  // In-app adhan: plays on any tab the moment the prayer time hits (foreground app).
  useEffect(() => {
    const t = setInterval(() => {
      try {
        checkAndPlayAdhanInApp(new Date(), loadPrayerSettings());
      } catch {
        // ignore
      }
    }, 15000);
    return () => clearInterval(t);
  }, []);

  // Initialize AdMob (App Open + Rewarded + Native)
  useEffect(() => {
    initAds();
  }, []);
}
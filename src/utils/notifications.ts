import { ReminderSettings } from '../types';
import { quickReminderAdhkar } from '../data/adhkarData';
import { initialDuasData } from '../data/duasData';
import { playReminderChime, triggerHaptic } from './audio';

export interface InAppAlert {
  id: string;
  title: string;
  message: string;
  subtext?: string;
  type: 'dhikr' | 'morning' | 'evening' | 'wird' | 'dua';
  timestamp: number;
}

type AlertListener = (alert: InAppAlert) => void;
const listeners: Set<AlertListener> = new Set();

export function subscribeToAlerts(listener: AlertListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function dispatchInAppAlert(alert: InAppAlert) {
  listeners.forEach(fn => fn(alert));
}

export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}

export function showSystemNotification(title: string, body: string) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        dir: 'rtl',
        lang: 'ar'
      });
    } catch {
      // ignore
    }
  }
}

export function triggerAutoReminder(settings: ReminderSettings, type: 'periodic' | 'morning' | 'evening' | 'dua' = 'periodic') {
  if (settings.soundEnabled) {
    playReminderChime();
  }
  if (settings.vibrateEnabled) {
    triggerHaptic(60);
  }

  let title = 'تذكير بذكر الله';
  let message = '';
  let subtext = '';

  if (type === 'morning') {
    title = 'أذكار الصباح ☀️';
    message = 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ... لا تنسَ أذكار صباحك لحفظ يومك';
    subtext = 'ابدا يومك بالبركة والنور';
  } else if (type === 'evening') {
    title = 'أذكار المساء 🌙';
    message = 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ... حان وقت أذكار المساء لحفظ ليلتك';
    subtext = 'حصن نفسك حتى تصبح';
  } else if (type === 'dua') {
    // Pick a random dua from the duas list (mid-screen overlay)
    const random = initialDuasData[Math.floor(Math.random() * initialDuasData.length)];
    title = 'دعاء للطمأنينة 🌿';
    message = random.arabic;
    subtext = `${random.benefit}${random.reference ? ` [${random.reference}]` : ''}`;
  } else {
    // Pick random inspiring dhikr
    const random = quickReminderAdhkar[Math.floor(Math.random() * quickReminderAdhkar.length)];
    title = 'لحظة ذكر وطمأنينة ✨';
    message = random.text;
    subtext = random.virtue;
  }

  // Dispatch In-App Alert
  const alertObj: InAppAlert = {
    id: 'alert-' + Date.now(),
    title,
    message,
    subtext,
    type: type === 'morning' ? 'morning' : type === 'evening' ? 'evening' : type === 'dua' ? 'dua' : 'dhikr',
    timestamp: Date.now()
  };
  dispatchInAppAlert(alertObj);

  // System notification if permission granted
  showSystemNotification(title, message);
}

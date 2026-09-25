import { ReminderSettings } from '../../types';
import { KEYS } from './keys';

export function loadReminderSettings(): ReminderSettings {
  const defaults: ReminderSettings = {
    enabled: true,
    intervalMinutes: 30,
    morningTime: '06:30',
    eveningTime: '17:30',
    soundEnabled: true,
    vibrateEnabled: true,
    qiyamEnabled: false,
    qiyamTime: '03:00',
  };
  try {
    const saved = localStorage.getItem(KEYS.REMINDERS);
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  } catch {
    return defaults;
  }
}

export function saveReminderSettings(settings: ReminderSettings): void {
  try {
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { ReminderSettings } from '../types';
import { isAndroidPlatform } from '../utils/platform';
import { requestBrowserNotificationPermission, triggerAutoReminder } from '../utils/notifications';
import {
  getSystemNotificationStatus,
  requestSystemNotificationPermission,
  syncSystemNotifications,
  sendTestSystemNotification,
  checkExactAlarmStatus,
  requestExactAlarmSettings,
  ExactAlarmStatus
} from '../utils/adhkarNotifications';
import { isBatteryExempt, requestBatteryExemption } from '../utils/batteryOptimizer';
import { testDuaOverlay } from '../utils/duaOverlay';

export interface UseReminderSettingsResult {
  localSettings: ReminderSettings;
  isNative: boolean;
  notificationStatus: string;
  systemStatus: 'granted' | 'denied' | 'pending' | 'unsupported';
  exactAlarmStatus: ExactAlarmStatus;
  batteryExempt: boolean;
  systemTestSent: boolean;
  testSent: boolean;
  duaOverlayTestSent: boolean;
  toggleEnable: () => void;
  intervalChange: (mins: number) => void;
  timeChange: (field: 'morningTime' | 'eveningTime', value: string) => void;
  toggleQiyam: () => void;
  qiyamTimeChange: (value: string) => void;
  toggleSound: () => void;
  toggleVibrate: () => void;
  requestPermission: () => Promise<void>;
  testNotification: () => void;
  testDuaOverlay: () => Promise<void>;
  systemPermission: () => Promise<void>;
  exactAlarmSettings: () => Promise<void>;
  batteryExemption: () => Promise<void>;
}

export const useReminderSettings = (
  isOpen: boolean,
  settings: ReminderSettings,
  onSaveSettings: (settings: ReminderSettings) => void
): UseReminderSettingsResult => {
  const [localSettings, setLocalSettings] = useState<ReminderSettings>(settings);
  const [notificationStatus, setNotificationStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [systemStatus, setSystemStatus] = useState<'granted' | 'denied' | 'pending' | 'unsupported'>('pending');
  const [exactAlarmStatus, setExactAlarmStatus] = useState<ExactAlarmStatus>('unsupported');
  const [batteryExempt, setBatteryExempt] = useState(true);
  const [systemTestSent, setSystemTestSent] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [duaOverlayTestSent, setDuaOverlayTestSent] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isOpen) return;
    getSystemNotificationStatus().then(setSystemStatus);
    checkExactAlarmStatus().then(setExactAlarmStatus);
    isBatteryExempt().then(setBatteryExempt);
  }, [isOpen]);

  const persist = (updated: ReminderSettings) => {
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const toggleEnable = () => persist({ ...localSettings, enabled: !localSettings.enabled });

  const intervalChange = (mins: number) => persist({ ...localSettings, intervalMinutes: mins });

  const timeChange = (field: 'morningTime' | 'eveningTime', value: string) => {
    persist({ ...localSettings, [field]: value });
  };

  const toggleQiyam = () => persist({ ...localSettings, qiyamEnabled: !localSettings.qiyamEnabled });

  const qiyamTimeChange = (value: string) => persist({ ...localSettings, qiyamTime: value });

  const toggleSound = () => persist({ ...localSettings, soundEnabled: !localSettings.soundEnabled });

  const toggleVibrate = () => persist({ ...localSettings, vibrateEnabled: !localSettings.vibrateEnabled });

  const requestPermission = async () => {
    const granted = await requestBrowserNotificationPermission();
    setNotificationStatus(granted ? 'granted' : 'denied');
  };

  const testNotification = () => {
    if (isNative) {
      sendTestSystemNotification(localSettings);
      setSystemTestSent(true);
      setTimeout(() => setSystemTestSent(false), 2500);
    } else {
      triggerAutoReminder(localSettings, 'periodic');
      setTestSent(true);
      setTimeout(() => setTestSent(false), 2500);
    }
  };

  const testDuaOverlayAsync = async () => {
    if (isAndroidPlatform) {
      const result = await testDuaOverlay(localSettings);
      if (result?.shown) {
        setDuaOverlayTestSent(true);
        setTimeout(() => setDuaOverlayTestSent(false), 2500);
      } else {
        alert('تعذّر عرض الدعاء. أعد فتح التطبيق ثم جرّب مجدداً.');
      }
    } else {
      triggerAutoReminder(localSettings, 'dua');
      setTestSent(true);
      setTimeout(() => setTestSent(false), 2500);
    }
  };

  const systemPermission = async () => {
    const granted = await requestSystemNotificationPermission();
    if (granted) {
      setSystemStatus('granted');
      await syncSystemNotifications(localSettings);
    } else {
      setSystemStatus('denied');
    }
  };

  const exactAlarmSettings = async () => {
    const status = await requestExactAlarmSettings();
    setExactAlarmStatus(status);
    await syncSystemNotifications(localSettings);
  };

  const batteryExemption = async () => {
    const granted = await requestBatteryExemption();
    setBatteryExempt(granted);
    await syncSystemNotifications(localSettings);
  };

  return {
    localSettings,
    isNative,
    notificationStatus,
    systemStatus,
    exactAlarmStatus,
    batteryExempt,
    systemTestSent,
    testSent,
    duaOverlayTestSent,
    toggleEnable,
    intervalChange,
    timeChange,
    toggleQiyam,
    qiyamTimeChange,
    toggleSound,
    toggleVibrate,
    requestPermission,
    testNotification,
    testDuaOverlay: testDuaOverlayAsync,
    systemPermission,
    exactAlarmSettings,
    batteryExemption
  };
};
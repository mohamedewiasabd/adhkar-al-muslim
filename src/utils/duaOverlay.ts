import { ReminderSettings } from '../types';
import { isAndroidPlatform } from './platform';
import { initialAdhkarData } from '../data/adhkarData';
import { initialDuasData } from '../data/duasData';
import nativePlugin from './nativePlugin';

/**
 * واجهة الجافاسكربت للمكوّن الأصلي DuaOverlay:
 * يعرض الدعاء في منتصف الشاشة حتى عندما يكون التطبيق مغلقاً (مثل الإشعارات).
 */

interface OverlayItem {
  t: string;
  b?: string;
  r?: string;
}

const isNative = (): boolean => isAndroidPlatform;

const duaOverlay = nativePlugin('DuaOverlay');

/** يجمع أذكار نوع معيّن (صباح/مساء) كعناصر جاهزة للتخزين الأصلي. */
function adhkarItems(category: 'morning' | 'evening'): OverlayItem[] {
  return initialAdhkarData
    .filter(a => a.category === category)
    .slice(0, 14)
    .map(a => ({
      t: a.text,
      b: a.fadl || undefined,
      r: a.reference || undefined
    }));
}

/** يجمع الأدعية العشوائية (الدوري) كعناصر جاهزة للتخزين الأصلي. */
function duaItems(): OverlayItem[] {
  return initialDuasData
    .slice(0, 24)
    .map(d => ({
      t: d.arabic,
      b: d.benefit || undefined,
      r: d.reference || undefined
    }));
}

export interface DuaOverlayStatus {
  configured: boolean;
  enabled?: boolean;
  soundEnabled?: boolean;
  vibrateEnabled?: boolean;
  morningTime?: string;
  eveningTime?: string;
  intervalMinutes?: number;
  exactAlarms?: boolean;
}

export async function syncDuaOverlay(settings: ReminderSettings): Promise<{ configured: boolean }> {
  if (!isNative() || !duaOverlay.available()) return { configured: false };
  return duaOverlay.call('configure', {
    enabled: settings.enabled,
    morningTime: settings.morningTime,
    eveningTime: settings.eveningTime,
    intervalMinutes: settings.intervalMinutes,
    soundEnabled: settings.soundEnabled,
    vibrateEnabled: settings.vibrateEnabled,
    morningTitle: 'أذكار الصباح ☀️',
    eveningTitle: 'أذكار المساء 🌙',
    periodicTitle: 'دعاء للطمأنينة 🌿',
    morning: adhkarItems('morning'),
    evening: adhkarItems('evening'),
    periodic: duaItems()
  });
}

export async function cancelDuaOverlay(): Promise<{ cancelled: boolean }> {
  if (!isNative() || !duaOverlay.available()) return { cancelled: false };
  return duaOverlay.call('cancel');
}

/** معاينة: يعرض دعاءً عشوائياً في منتصف الشاشة فوراً. */
export async function testDuaOverlay(settings: ReminderSettings): Promise<{ shown: boolean }> {
  if (!isNative() || !duaOverlay.available()) return { shown: false };
  const list = duaItems();
  const item = list[Math.floor(Math.random() * list.length)] || { t: 'اللهم اعصمنا بدينك وطاعتك وطاعة رسولك' };
  return duaOverlay.call('testNow', {
    title: 'دعاء للطمأنينة 🌿',
    text: item.t,
    benefit: item.b || '',
    reference: item.r || '',
    soundEnabled: settings.soundEnabled,
    vibrateEnabled: settings.vibrateEnabled
  });
}

export async function getDuaOverlayStatus(): Promise<DuaOverlayStatus> {
  if (!isNative() || !duaOverlay.available()) return { configured: false };
  return duaOverlay.call('getStatus');
}
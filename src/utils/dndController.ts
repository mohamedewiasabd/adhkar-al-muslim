import { isAndroidPlatform } from './platform';
import nativePlugin from './nativePlugin';

/**
 * التحكم في وضع "عدم الإزعاج" بعد الأذان (أندرويد فقط).
 *
 * - ساعة كاملة بعد انتهاء الأذان لكل الصلوات عدا المغرب (نصف ساعة).
 * - لو غيّر المستخدم الوضع أثناء المدة ⇒ يعود التطبيق لوضع عدم الإزعاج بعد دقيقة.
 */
const dnd = nativePlugin('DndController');

export interface DndStatus {
  enabled?: boolean;
  permission?: boolean;
  windowEnd?: number;
  active?: boolean;
}

export function dndSupported(): boolean {
  return isAndroidPlatform && dnd.available();
}

export async function getDndStatus(): Promise<DndStatus | null> {
  if (!dndSupported()) return null;
  try {
    return await dnd.call<DndStatus>('status', {});
  } catch {
    return null;
  }
}

export async function setDndEnabled(enabled: boolean): Promise<DndStatus | null> {
  if (!dndSupported()) return null;
  try {
    return await dnd.call<DndStatus>('setEnabled', { enabled });
  } catch {
    return null;
  }
}

export async function canControlDnd(): Promise<boolean> {
  if (!dndSupported()) return false;
  try {
    const res = await dnd.call<{ granted?: boolean }>('canControl', {});
    return res.granted === true;
  } catch {
    return false;
  }
}

export async function openDndSettings(): Promise<void> {
  if (!dndSupported()) return;
  try {
    await dnd.call('openSettings', {});
  } catch {
    // ignore
  }
}

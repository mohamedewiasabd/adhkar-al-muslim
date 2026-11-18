import { isAndroidPlatform } from './platform';
import nativePlugin from './nativePlugin';
import { KEYS } from './storage/keys';

/**
 * التحكم في وضع "عدم الإزعاج" بعد الأذان (أندرويد فقط).
 *
 * - ساعة كاملة بعد انتهاء الأذان لكل الصلوات عدا المغرب (نصف ساعة).
 * - لو غيّر المستخدم الوضع أثناء المدة ⇒ يعود التطبيق لوضع عدم الإزعاج بعد دقيقة.
 *
 * نحتفظ بنسخة محلية (localStorage) من مفتاح التفعيل لأن القائمة الأصلية
 * قد تُعاد تهيئتها عند إعادة تثبيت التطبيق/مسح بيانات النظام — فلا يضيع إعداد المستخدم.
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

/** الحالة المحلية المخزّنة (مرجع الواجهة عند تعذّر قراءة الأصل). */
export function loadDndEnabled(): boolean {
  try {
    return localStorage.getItem(KEYS.DND_ENABLED) === '1';
  } catch {
    return false;
  }
}

function saveDndEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(KEYS.DND_ENABLED, enabled ? '1' : '0');
  } catch {
    // ignore
  }
}

export async function getDndStatus(): Promise<DndStatus | null> {
  // المفتاح المحلي هو مرجع اختيار المستخدم — لا نسمح لأصلٍ غير متزامن بإيقافه.
  const enabled = loadDndEnabled();
  let permission = false;
  if (dndSupported()) {
    try {
      const nativeStatus = await dnd.call<DndStatus>('status', {});
      if (nativeStatus?.permission !== undefined) permission = nativeStatus.permission;
      // إن اختلف الأصل عن المحلي نُزامن الأصل مع اختيار المستخدم (لا العكس)،
      // حتى لا ينطفئ المفتاح تلقائياً بعد إعادة التثبيت/مسح بيانات النظام.
      if (nativeStatus?.enabled !== undefined && nativeStatus.enabled !== enabled) {
        await dnd.call('setEnabled', { enabled });
      }
    } catch {
      // ignore
    }
  }
  return { enabled, permission };
}

/** يُستدعى عند فتح التطبيق لدفع مفتاح المستخدم المخزّن إلى الطبقة الأصلية،
 *  فتبقى جدولة الصمت تعمل حتى دون فتح نافذة الإعدادات. */
export async function syncDndToNative(): Promise<void> {
  const enabled = loadDndEnabled();
  if (!dndSupported()) return;
  try {
    const res = await dnd.call<DndStatus>('status', {});
    if (res?.enabled !== enabled) {
      await dnd.call('setEnabled', { enabled });
    }
  } catch {
    // ignore
  }
}

export async function setDndEnabled(enabled: boolean): Promise<DndStatus | null> {
  saveDndEnabled(enabled);
  if (!dndSupported()) return { enabled };
  try {
    const result = await dnd.call<DndStatus>('setEnabled', { enabled });
    // المحلي هو مرجع اختيار المستخدم — لا نسمح للرد الأصلي بإيقاف المفتاح
    return { ...result, enabled };
  } catch {
    return { enabled };
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

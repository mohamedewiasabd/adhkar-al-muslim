import { registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { isAndroidPlatform } from './platform';

export type WidgetType = 'tasbeeh' | 'adhkar' | 'dua' | 'awrad';

export interface WidgetItem {
  id: string;
  text: string;
  target?: number;
  count?: number;
  done?: boolean;
}

export interface WidgetSpec {
  id?: string;
  type: WidgetType;
  title?: string;
  items?: WidgetItem[];
  count?: number;
  target?: number;
  laps?: number;
  index?: number;
  size?: 'small' | 'medium' | 'large';
  x?: number;
  y?: number;
  visible?: boolean;
}

interface OverlayWidgetsApi {
  hasOverlayPermission(): Promise<{ granted: boolean }>;
  requestOverlayPermission(): Promise<{ opened: boolean }>;
  restartService(): Promise<void>;
  addWidget(options: { spec: Record<string, unknown> }): Promise<{ widgets: WidgetSpec[] }>;
  updateWidget(options: { id: string; spec: Record<string, unknown> }): Promise<{ widgets: WidgetSpec[] }>;
  removeWidget(options: { id: string }): Promise<{ widgets: WidgetSpec[] }>;
  setVisible(options: { id: string; visible: boolean }): Promise<{ widgets: WidgetSpec[] }>;
  listWidgets(): Promise<{ widgets: WidgetSpec[] }>;
}

const OverlayWidgets = registerPlugin<OverlayWidgetsApi>('OverlayWidgets');

export function widgetsSupported(): boolean {
  return isAndroidPlatform;
}

export async function hasWidgetPermission(): Promise<boolean> {
  if (!widgetsSupported()) return false;
  try {
    return Boolean((await OverlayWidgets.hasOverlayPermission()).granted);
  } catch {
    return false;
  }
}

/** يفتح شاشة منح صلاحية الرسم فوق التطبيقات. يعيد true إن فُتحت الشاشة فعلاً. */
export async function requestWidgetPermission(): Promise<boolean> {
  if (!widgetsSupported()) return false;
  try {
    const res = await OverlayWidgets.requestOverlayPermission();
    return Boolean(res.opened);
  } catch {
    return false;
  }
}

/**
 * يطلب إذن «الرسم فوق التطبيقات» ثم ينتظر عودة المستخدم من شاشة الإعدادات،
 * ويعيد الفحص تلقائياً ليُكمل العملية (مساعد/الإضافة) دون ضغطة ثانية.
 * يعيد: granted هل أُنجز الإذن؟ و opened هل نُفِّذت شاشة النظام فعلاً؟
 */
export async function requestWidgetPermissionAndWait(): Promise<{ granted: boolean; opened: boolean }> {
  if (!widgetsSupported()) return { granted: false, opened: false };
  if (await hasWidgetPermission()) return { granted: true, opened: true };

  let settle: (granted: boolean) => void = () => {};
  const done = new Promise<boolean>((res) => {
    settle = res;
  });
  let settled = false;
  const finish = (granted: boolean) => {
    if (settled) return;
    settled = true;
    settle(granted);
  };

  let appListener: { remove: () => void } | null = null;
  try {
    appListener = await App.addListener('appStateChange', (state) => {
      if (state.isActive) void hasWidgetPermission().then(finish);
    });
  } catch {
    appListener = null;
  }

  const onFocus = () => void hasWidgetPermission().then(finish);
  const hasFocusApi = typeof window !== 'undefined' && typeof window.addEventListener === 'function';
  if (hasFocusApi) window.addEventListener('focus', onFocus);

  const opened = await requestWidgetPermission();
  if (!opened) {
    finish(false);
  }

  const timeoutHandle = typeof window !== 'undefined' ? window.setTimeout(() => finish(false), 90000) : undefined;
  const granted = await done;
  if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
  if (hasFocusApi) window.removeEventListener('focus', onFocus);
  appListener?.remove();
  return { granted, opened };
}

export async function listWidgets(): Promise<WidgetSpec[]> {
  if (!widgetsSupported()) return [];
  const res = await OverlayWidgets.listWidgets();
  return res.widgets || [];
}

export async function restartWidgetsService(): Promise<void> {
  if (!widgetsSupported()) return;
  await OverlayWidgets.restartService();
}

/** يفتح قائمة الودجات بعد عملية ناجحة. */
export async function addWidget(spec: WidgetSpec): Promise<WidgetSpec[]> {
  if (!widgetsSupported()) return [];
  const res = await OverlayWidgets.addWidget({ spec: { ...spec } as Record<string, unknown> });
  return res.widgets || [];
}

export async function updateWidget(id: string, spec: Partial<WidgetSpec>): Promise<WidgetSpec[]> {
  if (!widgetsSupported()) return [];
  const res = await OverlayWidgets.updateWidget({ id, spec: { ...spec } as Record<string, unknown> });
  return res.widgets || [];
}

export async function removeWidget(id: string): Promise<WidgetSpec[]> {
  if (!widgetsSupported()) return [];
  const res = await OverlayWidgets.removeWidget({ id });
  return res.widgets || [];
}

export async function setWidgetVisible(id: string, visible: boolean): Promise<WidgetSpec[]> {
  if (!widgetsSupported()) return [];
  const res = await OverlayWidgets.setVisible({ id, visible });
  return res.widgets || [];
}

export function widgetErrorMessage(e: unknown): string {
  if (e instanceof Error && e.message) {
    const m = e.message;
    if (/plugin/i.test(m)) return 'المكوّن الأصلي غير مسجّل — أعد تشغيل التطبيق';
    if (/permission|overlay/i.test(m)) return 'إذن الرسم فوق التطبيقات غير مفعّل';
    return m;
  }
  return 'تعذّرت العملية على مستوى النظام';
}

/* ---------- بنّاؤو المواصفات ---------- */

export function buildTasbeehSpec(title: string, target: number, size: WidgetSpec['size'] = 'medium'): WidgetSpec {
  return { type: 'tasbeeh', title, target, count: 0, laps: 0, size };
}

export function buildAdhkarSpec(title: string, items: WidgetItem[], size: WidgetSpec['size'] = 'medium'): WidgetSpec {
  return { type: 'adhkar', title, items, index: 0, size };
}

export function buildDuaSpec(title: string, items: WidgetItem[], size: WidgetSpec['size'] = 'medium'): WidgetSpec {
  return { type: 'dua', title, items, index: 0, size };
}

export function buildAwradSpec(title: string, items: WidgetItem[], size: WidgetSpec['size'] = 'medium'): WidgetSpec {
  return { type: 'awrad', title, items, index: 0, size };
}

/* ---------- إشعار بسيط داخل التطبيق ---------- */

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export function showWidgetToast(message: string): void {
  if (typeof document === 'undefined') return;
  const old = document.getElementById('adhkar-widget-toast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.id = 'adhkar-widget-toast';
  el.textContent = message;
  el.style.cssText =
    'position:fixed;bottom:96px;left:50%;transform:translateX(-50%);z-index:99999;' +
    'background:#10b981;color:#fff;font-weight:700;font-size:13px;' +
    'padding:10px 18px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.25);' +
    'max-width:90vw;text-align:center;direction:rtl;font-family:inherit;';
  document.body.appendChild(el);
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 3200);
}

export function widgetsTypeLabel(type: WidgetType): string {
  switch (type) {
    case 'tasbeeh': return 'سبحة';
    case 'adhkar': return 'أذكار';
    case 'dua': return 'دعاء اليوم';
    case 'awrad': return 'الورد اليومي';
    default: return 'ودجد';
  }
}
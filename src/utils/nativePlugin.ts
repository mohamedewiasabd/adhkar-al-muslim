import { Capacitor } from '@capacitor/core';

/**
 * استدعاء موثوق للإضافات الأصلية المخصصة (المكتوبة داخل التطبيق).
 *
 * لماذا لا نستخدم `Capacitor.Plugins.X` مباشرة؟
 * في إصدار Capacitor الحالي يُبنى Bridge داخل `BridgeActivity.onCreate`
 * قبل تشغيل `registerPlugin` في MainActivity، ولهذا المكوّنات المخصصة
 * لا تُصدَّر إلى `window.Capacitor.PluginHeaders` ولا تظهر في
 * `Capacitor.Plugins`. لكن `Capacitor.nativePromise(...)` يتجاوز
 * قائمة الرؤوس ويوجّه المكالمة إلى الـ Bridge بالاسم مباشرة.
 */
interface NativePlugin {
  call<T = Record<string, unknown>>(method: string, options?: Record<string, unknown>): Promise<T>;
  available(): boolean;
}

const cap: any = Capacitor as any;

function nativePlugin(pluginName: string): NativePlugin {
  return {
    available: (): boolean => typeof cap?.nativePromise === 'function',
    call: <T = Record<string, unknown>>(method: string, options: Record<string, unknown> = {}): Promise<T> =>
      cap.nativePromise(pluginName, method, options) as Promise<T>,
  };
}

export default nativePlugin;
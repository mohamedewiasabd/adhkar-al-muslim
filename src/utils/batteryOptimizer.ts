import { registerPlugin } from '@capacitor/core';
import { isAndroidPlatform } from './platform';

interface BatteryOptimizerPlugin {
  isIgnoringOptimizations(): Promise<{ isExempt: boolean }>;
  requestExemption(): Promise<{ granted: boolean }>;
}

const BatteryOptimizer = registerPlugin<BatteryOptimizerPlugin>('BatteryOptimizer');

const isNative = (): boolean => isAndroidPlatform;

/** هل التطبيق معفى من "تحسين استهلاك البطارية"؟ (خط الدفاع الأخير لوصول الإشعارات المجدولة) */
export async function isBatteryExempt(): Promise<boolean> {
  if (!isNative()) return true;
  try {
    const res = await BatteryOptimizer.isIgnoringOptimizations();
    return Boolean(res.isExempt);
  } catch {
    return true;
  }
}

/** يفتح شاشة النظام لمنح الإعفاء من تحسين البطارية، ويعيد الحالة بعد العودة للتطبيق */
export async function requestBatteryExemption(): Promise<boolean> {
  if (!isNative()) return true;
  try {
    const res = await BatteryOptimizer.requestExemption();
    return Boolean(res.granted);
  } catch {
    return false;
  }
}
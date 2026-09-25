import { Capacitor } from '@capacitor/core';

/** منصة التشغيل الحالية: 'android' | 'ios' | 'web'. */
export const platform: string = Capacitor.getPlatform();

/** هل المنصة أندرويد؟ (المكوّنات الأصلية الخاصة بأندرويد فقط). */
export const isAndroidPlatform = platform === 'android';

/** هل المنصة iOS؟ */
export const isIOSPlatform = platform === 'ios';
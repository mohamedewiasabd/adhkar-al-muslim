import { registerPlugin } from '@capacitor/core';
import { isAndroidPlatform } from './platform';

interface OurAppsApi {
  isAppInstalled(options: { packageName: string }): Promise<{ installed: boolean }>;
  open(options: { packageName: string }): Promise<{ kind: 'app' | 'store' }>;
  openUrl(options: { url: string }): Promise<{ opened: boolean }>;
}

const OurApps = registerPlugin<OurAppsApi>('OurApps');

export function ourAppsSupported(): boolean {
  return isAndroidPlatform;
}

/** هل التطبيق مثبّت على جهاز المستخدم؟ */
export async function isAppInstalled(packageName?: string): Promise<boolean> {
  if (!ourAppsSupported() || !packageName) return false;
  try {
    return Boolean((await OurApps.isAppInstalled({ packageName })).installed);
  } catch {
    return false;
  }
}

/**
 * يفتح التطبيق مباشرةً إن كان مثبّتاً، وإلا ينتقل إلى صفحته في جوجل بلاي.
 * يعيد 'app' إن فُتح التطبيق، أو 'store' إن نُقل لجوجل بلاي.
 */
export async function openOurApp(packageName?: string): Promise<'app' | 'store' | null> {
  if (!packageName) return null;
  if (!ourAppsSupported()) return null;
  try {
    const res = await OurApps.open({ packageName });
    return res.kind;
  } catch {
    return null;
  }
}

/** يفتح رابطاً خارجياً عبر متصفح النظام (متاح على أندرويد فقط). */
export async function openOurAppUrl(url?: string): Promise<boolean> {
  if (!url || !ourAppsSupported()) return false;
  try {
    return Boolean((await OurApps.openUrl({ url })).opened);
  } catch {
    return false;
  }
}

export function openOurAppOnWeb(storeUrl?: string): void {
  if (!storeUrl) return;
  window.open(storeUrl, '_blank');
}
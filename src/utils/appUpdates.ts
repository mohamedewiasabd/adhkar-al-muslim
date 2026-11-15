import { App } from '@capacitor/app';
import { OurApp } from '../types';
import { storeUrlOf } from './appsService';

const THIS_PACKAGE = 'com.muslim.adhkar.wird';
const THIS_ID_HINTS = ['adhkar', 'wird', 'muslim', 'أذكار'];

function normalizeVersion(v?: string | number): string {
  if (v === undefined || v === null) return '';
  const s = String(v).trim();
  // Extract like 1.9.16
  const m = s.match(/(\d+)\.(\d+)\.(\d+)/);
  if (m) return `${m[1]}.${m[2]}.${m[3]}`;
  const m2 = s.match(/(\d+)\.(\d+)/);
  if (m2) return `${m2[1]}.${m2[2]}.0`;
  return s;
}

function compareVersions(a: string, b: string): number {
  const na = normalizeVersion(a).split('.').map(x => parseInt(x || '0', 10));
  const nb = normalizeVersion(b).split('.').map(x => parseInt(x || '0', 10));
  for (let i = 0; i < Math.max(na.length, nb.length); i++) {
    const va = na[i] || 0;
    const vb = nb[i] || 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

export async function getCurrentAppVersion(): Promise<string> {
  try {
    const info = await App.getInfo();
    if (info?.version) return info.version;
  } catch {}
  // Fallback from package.json isn't available at runtime, but try reading
  try {
    const res = await fetch('/version.json', { cache: 'no-store' });
    if (res.ok) {
      const j = await res.json();
      if (j?.version) return j.version;
    }
  } catch {}
  return '';
}

export function isThisApp(app: OurApp): boolean {
  if (!app) return false;
  if (app.packageName === THIS_PACKAGE) return true;
  const name = (app.name || '').toLowerCase();
  if (name.includes('أذكار') && name.includes('مسلم')) return true;
  if (THIS_ID_HINTS.some(h => (app.id || '').toLowerCase().includes(h))) {
    // be conservative
  }
  return false;
}

function getAppVersionField(app: OurApp): string | undefined {
  return (app.version || app.appVersion || app.versionName || app.currentVersion || app.latestVersion) as string | undefined;
}

export interface AppUpdateInfo {
  needsUpdate: boolean;
  thisApp?: OurApp;
  currentVersion: string;
  remoteVersion?: string;
  updateUrl?: string;
}

export function checkForUpdate(apps: OurApp[], currentVersion: string): AppUpdateInfo {
  const thisApp = apps.find(isThisApp);
  if (!thisApp) return { needsUpdate: false, currentVersion };
  const remote = getAppVersionField(thisApp);
  if (!remote) return { needsUpdate: false, thisApp, currentVersion };
  const cmp = compareVersions(currentVersion, remote);
  if (cmp < 0) {
    const updateUrl = thisApp.updateUrl || thisApp.updateLink || thisApp.playStoreUrl || thisApp.androidUrl || thisApp.link || storeUrlOf(thisApp) || `https://play.google.com/store/apps/details?id=${thisApp.packageName || THIS_PACKAGE}`;
    return { needsUpdate: true, thisApp, currentVersion, remoteVersion: remote, updateUrl };
  }
  return { needsUpdate: false, thisApp, currentVersion, remoteVersion: remote };
}

function isTruthyPro(val: any): boolean {
  if (val === true) return true;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes' || s === 'نعم' || s.includes('برو');
  }
  return false;
}

export function hasProNotice(app: OurApp | undefined): { has: boolean; message?: string; title?: string } {
  if (!app) return { has: false };
  if (isTruthyPro(app.pro) || isTruthyPro(app.isPro) || isTruthyPro(app.proVersion) || isTruthyPro(app.hasPro) || isTruthyPro((app as any)['النسخةالبرو']) || isTruthyPro((app as any)['نسخة_البرو'])) {
    const message = app.proNotice || app.proMessage || app.proText || app.proDescription || app.description || 'تتوفر نسخة البرو';
    const title = app.proTitle || 'النسخة البرو';
    return { has: true, message, title };
  }
  return { has: false };
}

function extractAlternative(app: OurApp): OurApp | undefined {
  const candidates = [app.alternativeApp, app.alternative, (app as any)['التطبيقالبديل'], (app as any)['تطبيق_بديل']];
  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === 'string') {
      // maybe just a package/name
      if (c.includes('.') && !c.includes(' ')) {
        return { id: c, name: app.alternativeAppName || 'التطبيق البديل', packageName: c } as OurApp;
      }
      return { id: 'alt', name: c } as OurApp;
    }
    if (typeof c === 'object') {
      return c as OurApp;
    }
  }
  // build from fields
  if (app.alternativeAppName || app.alternativeAppPackage || app.alternativeAppUrl || app.alternativePackageName || app.alternativeStoreUrl || app.alternativeUrl || app.alternativeLink) {
    return {
      id: 'alt',
      name: app.alternativeAppName || app.alternativeAppTitle || 'التطبيق البديل',
      packageName: app.alternativeAppPackage || app.alternativeAppPackageName || app.alternativePackageName,
      storeUrl: app.alternativeAppUrl || app.alternativeUrl || app.alternativeStoreUrl || app.alternativeLink,
    } as OurApp;
  }
  return undefined;
}

export function getAlternativeInfo(app: OurApp | undefined): { has: boolean; app?: OurApp; mandatory: boolean; url?: string } {
  if (!app) return { has: false, mandatory: false };
  const alt = extractAlternative(app);
  if (!alt) return { has: false, mandatory: false };
  const mandatory = Boolean(app.forceAlternative || app.mandatory || app.isMandatory || app.force);
  const url = alt.storeUrl || alt.updateUrl || storeUrlOf(alt) || app.alternativeUrl || app.alternativeAppUrl || app.alternativeStoreUrl;
  return { has: true, app: alt, mandatory, url };
}

export function openUrl(url?: string) {
  if (!url) return;
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch {
    window.open(url, '_blank');
  }
}

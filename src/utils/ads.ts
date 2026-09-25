import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { AdMobNextGen } from 'capacitor-admob-nextgen';

/**
 * ضعها true أثناء التجربة المحلية فقط (تجعل جهازك «جهاز اختبار» فتظهر إعلانات
 * اختبار مضمونة لجميع الوحدات — App Open وRewarded وNative)،
 * ثم أعِدها false قبل الرفع إلى Google Play. حالياً false = إعلانات حقيقية.
 */
const TEST_ADS = false;

export const AD_UNITS = {
  APP_OPEN: 'ca-app-pub-6559329089674801/3675263885',
  REWARDED: 'ca-app-pub-6559329089674801/5451379981',
  NATIVE: 'ca-app-pub-6559329089674801/4718908934'
} as const;

const isNative = (): boolean => Capacitor.isNativePlatform();

let adsReady = false;
let canRequestAds = false;
let appOpenLoaded = false;
let wasInBackground = false;

const adsReadyListeners: Array<() => void> = [];
let adsReadyNotified = false;

export function onAdsReady(cb: () => void): () => void {
  if (!isNative() || adsReadyNotified) {
    cb();
    return () => {};
  }
  adsReadyListeners.push(cb);
  return () => {
    const i = adsReadyListeners.indexOf(cb);
    if (i !== -1) adsReadyListeners.splice(i, 1);
  };
}

function notifyAdsReady() {
  if (adsReadyNotified) return;
  adsReadyNotified = true;
  const cbs = adsReadyListeners.splice(0);
  cbs.forEach(cb => {
    try { cb(); } catch { /* noop */ }
  });
}

export function adsSupported(): boolean {
  return isNative();
}

export async function initAds(): Promise<void> {
  if (!isNative() || adsReady) return;
  try {
    // Per Google/plugin policy: consent (UMP) FIRST, then SDK init.
    const consent = await AdMobNextGen.requestConsentInfo({ showFormIfRequired: true });
    await AdMobNextGen.initialize({ isTesting: TEST_ADS });
    canRequestAds = consent ? Boolean(consent.canRequestAds) : false;
    adsReady = true;
    if (canRequestAds) {
      loadAppOpenAd();
    }
    // Show App Open ad each time the app returns to the foreground (not on first launch)
    App.addListener('appStateChange', (state) => {
      if (state.isActive) {
        if (wasInBackground) {
          // The loaded App Open ad stays valid ~4h, so show it immediately on return.
          maybeShowAppOpenAd();
        }
        wasInBackground = false;
      } else {
        wasInBackground = true;
      }
    });
  } catch {
    adsReady = true;
    canRequestAds = false;
  }
  notifyAdsReady();
}

// ---------- App Open (شاشة فتح التطبيق) ----------
export async function loadAppOpenAd(): Promise<void> {
  if (!isNative() || !adsReady || !canRequestAds) return;
  try {
    await AdMobNextGen.loadAppOpen({ adUnitId: AD_UNITS.APP_OPEN });
    appOpenLoaded = true;
  } catch {
    appOpenLoaded = false;
  }
}

export async function maybeShowAppOpenAd(): Promise<void> {
  if (!isNative() || !adsReady || !canRequestAds || !appOpenLoaded) {
    loadAppOpenAd();
    return;
  }
  try {
    await AdMobNextGen.showAppOpen();
    appOpenLoaded = false;
    loadAppOpenAd(); // preload the next one
  } catch {
    loadAppOpenAd();
  }
}

// ---------- Rewarded (إعلان بمكافأة) ----------
export async function showRewardedAd(): Promise<boolean> {
  if (!isNative() || !adsReady || !canRequestAds) return false;
  try {
    await AdMobNextGen.loadRewarded({ adUnitId: AD_UNITS.REWARDED });
    await AdMobNextGen.showRewarded();
    return true; // المكافأة تُسلَّم عبر حدث onRewardedAdReward
  } catch {
    return false;
  }
}

export type RewardListener = (data: { amount: number; type: string }) => void;

export function onRewardedReward(listener: RewardListener) {
  if (!isNative()) return () => {};
  let handle: { remove: () => void } | null = null;
  let cancelled = false;
  AdMobNextGen.addListener('onRewardedAdReward', (info: any) => {
    if (!cancelled) listener({ amount: Number(info?.amount) || 0, type: String(info?.type || '') });
  }).then(h => {
    if (cancelled && h.remove) h.remove();
    else handle = h;
  });
  return () => {
    cancelled = true;
    if (handle?.remove) handle.remove();
  };
}

// ---------- Native In-Feed (وحدات مدمجة مع المحتوى) ----------
let nativeVisible = false;

export async function showNativeFeedAd(opts: {
  x?: number;
  y: number;
  width: number;
  template?: 'small' | 'medium';
}): Promise<boolean> {
  if (!isNative() || !adsReady || !canRequestAds) return false;
  try {
    await AdMobNextGen.showNativeAd({
      adUnitId: AD_UNITS.NATIVE,
      template: opts.template || 'medium',
      x: Math.round(opts.x ?? 0),
      y: Math.round(opts.y),
      width: Math.round(opts.width)
    });
    nativeVisible = true;
    return true;
  } catch {
    nativeVisible = false;
    return false;
  }
}

export async function hideNativeFeedAd(): Promise<void> {
  if (!isNative() || !nativeVisible) return;
  try {
    await AdMobNextGen.hideNativeAd();
    nativeVisible = false;
  } catch {
    nativeVisible = false;
  }
}
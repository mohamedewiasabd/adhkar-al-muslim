import React, { useEffect, useState } from 'react';
import { X, Download, AlertTriangle, Sparkles } from 'lucide-react';
import { OurApp } from '../types';
import { getOurApps } from '../utils/appsService';
import {
  checkForUpdate,
  getCurrentAppVersion,
  hasProNotice,
  getAlternativeInfo,
  openUrl,
} from '../utils/appUpdates';

const DISMISS_UPDATE_KEY = 'adhkar_update_dismissed_v1';
const DISMISS_PRO_KEY = 'adhkar_pro_dismissed_v1';

export const AppsAlerts: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [showPro, setShowPro] = useState(false);
  const [proInfo, setProInfo] = useState<any>(null);
  const [showAlt, setShowAlt] = useState(false);
  const [altInfo, setAltInfo] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const [res, currentVer] = await Promise.all([getOurApps(), getCurrentAppVersion()]);
        if (cancelled) return;
        const apps = res.apps || [];

        // Check alternative first - mandatory
        for (const app of apps) {
          const alt = getAlternativeInfo(app);
          if (alt.has) {
            setAltInfo(alt);
            setShowAlt(true);
            return; // alternative is mandatory
          }
        }

        // Check update for this app
        const upd = checkForUpdate(apps, currentVer);
        if (upd.needsUpdate) {
          const dismissed = localStorage.getItem(`${DISMISS_UPDATE_KEY}_${upd.remoteVersion || ''}`);
          if (!dismissed) {
            setUpdateInfo(upd);
            setShowUpdate(true);
            return;
          }
        }

        // Check pro notice - dismissible
        for (const app of apps) {
          const p = hasProNotice(app);
          if (p.has) {
            const dismissed = localStorage.getItem(`${DISMISS_PRO_KEY}_${p.title || ''}`);
            if (!dismissed) {
              setProInfo(p);
              setShowPro(true);
              return;
            }
          }
        }
      } catch (e) {
        // ignore
      }
    };
    // slight delay to let app settle
    const t = setTimeout(run, 800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  const dismissUpdate = () => {
    if (updateInfo?.remoteVersion) {
      localStorage.setItem(`${DISMISS_UPDATE_KEY}_${updateInfo.remoteVersion}`, '1');
    } else {
      localStorage.setItem(DISMISS_UPDATE_KEY, '1');
    }
    setShowUpdate(false);
  };

  const dismissPro = () => {
    localStorage.setItem(`${DISMISS_PRO_KEY}_${proInfo?.title || 'pro'}`, '1');
    setShowPro(false);
  };

  const goUpdate = () => {
    openUrl(updateInfo?.updateUrl);
  };

  const goAlt = () => {
    openUrl(altInfo?.url || altInfo?.app?.storeUrl);
  };

  if (showAlt) {
    return (
      <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-tr from-rose-600 to-orange-500 text-white px-5 pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-cairo">التطبيق البديل</h2>
                <p className="text-[11px] text-white/80">يجب تنزيل التطبيق البديل للمتابعة</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed text-center">
              هناك تطبيق بديل مطلوب. يجب تنزيله للمتابعة.
            </p>
            {altInfo?.app?.name && (
              <p className="text-center font-bold text-stone-900 dark:text-stone-100">{altInfo.app.name}</p>
            )}
            <button
              onClick={goAlt}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 text-white font-bold shadow-md shadow-rose-600/20 transition-transform active:scale-[0.99]"
            >
              <Download className="w-4 h-4" />
              تنزيل التطبيق البديل
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showUpdate) {
    return (
      <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 text-white px-5 pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-cairo">تحديث متوفر</h2>
                  <p className="text-[11px] text-white/80">يوجد إصدار جديد من التطبيق</p>
                </div>
              </div>
              <button onClick={dismissUpdate} aria-label="إغلاق" className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed text-center">
              يتوفر تحديث للتطبيق. هل تريد التحديث الآن؟
            </p>
            {(updateInfo?.currentVersion || updateInfo?.remoteVersion) && (
              <p className="text-center text-xs text-stone-500 dark:text-stone-400">
                الإصدار الحالي: {updateInfo.currentVersion || '—'} • الإصدار المتوفر: {updateInfo.remoteVersion || '—'}
              </p>
            )}
            <div className="flex gap-2">
              <button onClick={dismissUpdate} className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold">
                لاحقاً
              </button>
              <button onClick={goUpdate} className="flex-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold">
                تحديث من جوجل بلاي
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showPro) {
    return (
      <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-tr from-amber-500 to-orange-500 text-white px-5 pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-cairo">{proInfo?.title || 'النسخة البرو'}</h2>
                  <p className="text-[11px] text-white/80">إشعار قابل للإلغاء</p>
                </div>
              </div>
              <button onClick={dismissPro} aria-label="إغلاق" className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed text-center whitespace-pre-wrap">
              {proInfo?.message}
            </p>
            <button onClick={dismissPro} className="w-full px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold">
              حسناً
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

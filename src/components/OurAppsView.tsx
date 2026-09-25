import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, LayoutGrid, Loader2, RefreshCw, Store, X } from 'lucide-react';
import { OurApp } from '../types';
import { getOurApps, storeUrlOf, loadAppsCache, OurAppsResult } from '../utils/appsService';
import {
  ourAppsSupported, isAppInstalled, openOurApp, openOurAppUrl
} from '../utils/ourApps';
import { showWidgetToast } from '../utils/widgets';

interface OurAppsViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'أذكار وأدعية': 'from-emerald-600 to-teal-500',
  قرآن: 'from-sky-600 to-indigo-500',
  تسبيح: 'from-amber-500 to-orange-500',
  محتوى: 'from-violet-600 to-purple-500',
};

function gradientFor(app: OurApp, index: number): string {
  const fromCategory = app.category ? CATEGORY_COLORS[app.category] : undefined;
  if (fromCategory) return fromCategory;
  const palettes = [
    'from-emerald-600 to-teal-500',
    'from-sky-600 to-indigo-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-violet-600 to-purple-500',
  ];
  return palettes[index % palettes.length];
}

function FallbackIcon({ app, index }: { app: OurApp; index: number }) {
  return (
    <div
      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientFor(app, index)} text-white flex items-center justify-center shrink-0 shadow-md shadow-black/10`}
    >
      <span className="text-xl font-bold font-cairo">{app.name.charAt(0)}</span>
    </div>
  );
}

function AppCard({ app, index }: { app: OurApp; index: number; key?: React.Key }) {
  const [iconFailed, setIconFailed] = useState(false);
  const [installed, setInstalled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const url = storeUrlOf(app);

  useEffect(() => {
    let alive = true;
    if (app.packageName) {
      isAppInstalled(app.packageName)
        .then((ok) => {
          if (alive) setInstalled(ok);
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, [app.packageName]);

  const openStoreTab = (fallbackUrl?: string) => {
    const target = fallbackUrl || url;
    if (!target) {
      showWidgetToast('هذا التطبيق غير متاح بعد — سيُتاح قريباً');
      return;
    }
    // يُستدعى قبل أي await (داخل حدث النقرة) حتى يحترم مانع النوافذ المنبثقة
    const anchor = document.createElement('a');
    anchor.href = target;
    anchor.target = '_blank';
    anchor.rel = 'noopener,noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleOpen = () => {
    if (busy) return;

    if (ourAppsSupported()) {
      setBusy(true);
      void (async () => {
        try {
          if (app.packageName) {
            const kind = await openOurApp(app.packageName);
            if (kind === 'app') {
              showWidgetToast(`تم فتح ${app.name}`);
              return;
            }
            if (kind === 'store') {
              showWidgetToast('التطبيق غير مثبّت على جهازك — سيُفتح جوجل بلاي للتثبيت');
              return;
            }
          }
          const opened = await openOurAppUrl(url);
          if (!opened) {
            showWidgetToast(url ? 'تعذّر فتح الرابط — جرّب فتحه من المتصفح لاحقاً' : 'هذا التطبيق غير متاح بعد — سيُتاح قريباً');
          }
        } finally {
          setBusy(false);
        }
      })();
      return;
    }

    openStoreTab();
  };

  const actionLabel = busy ? '...' : installed === false ? 'تثبيت' : 'فتح';

  return (
    <div
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpen();
        }
      }}
      title={installed === false ? 'التطبيق غير مثبّت — اضغط للانتقال لجوجل بلاي' : 'اضغط لفتح التطبيق'}
      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 flex gap-3 items-center shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer active:scale-[0.99]"
    >
      {app.iconUrl && !iconFailed ? (
        <img
          src={app.iconUrl}
          alt={app.name}
          loading="lazy"
          onError={() => setIconFailed(true)}
          className="w-14 h-14 rounded-2xl shrink-0 bg-stone-100 dark:bg-stone-800 object-contain"
        />
      ) : (
        <FallbackIcon app={app} index={index} />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-bold text-sm text-stone-900 dark:text-stone-100 font-cairo truncate">{app.name}</p>
        {app.category && (
          <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            {app.category}
          </span>
        )}
        {app.description && (
          <p className="mt-1 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400 line-clamp-2">
            {app.description}
          </p>
        )}
      </div>
      {url ? (
        <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : installed === false ? <Store className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
          <span className="hidden min-[380px]:inline">{actionLabel}</span>
        </span>
      ) : (
        <span className="shrink-0 text-[10px] font-bold px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-400">
          قريباً
        </span>
      )}
    </div>
  );
}

export const OurAppsView: React.FC<OurAppsViewProps> = ({ isOpen, onClose }) => {
  const [result, setResult] = useState<OurAppsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async (force: boolean, announce: boolean) => {
    if (force) setLoading(true);
    try {
      const r = await getOurApps({ force });
      setResult(r);
      if (announce) showWidgetToast('تم تحديث قائمة التطبيقات');
    } finally {
      setLoading(false);
    }
  };

  const load = async () => {
    const cached = loadAppsCache();
    if (cached) {
      setResult({ apps: cached.apps, fromCache: true, fetchedAt: cached.fetchedAt });
      await refresh(true, false);
    } else {
      await refresh(false, false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      setLoading(false);
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const apps = result?.apps ?? [];

  const lastUpdatedLabel = useMemo(() => {
    if (!result?.fetchedAt) return 'قائمة محلية';
    const d = new Date(result.fetchedAt);
    return `آخر تحديث: ${d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  }, [result]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-stone-100/80 dark:bg-stone-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center" dir="rtl">
      <div className="w-full max-w-md max-h-[92vh] bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden motion-safe:animate-[slideUp_.3s_ease]">
        {/* Header */}
        <div className="bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-white px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-cairo">تطبيقاتنا</h2>
                <p className="text-[11px] text-white/80">تطبيقات شركة أذكار المسلم</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="إغلاق صفحة تطبيقاتنا"
              className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && !result ? (
            <div className="flex flex-col items-center gap-3 py-14 text-stone-500 dark:text-stone-400">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
              <span className="text-sm font-medium">جاري جلب التطبيقات...</span>
            </div>
          ) : apps.length === 0 ? (
            <div className="py-14 text-center text-sm text-stone-500 dark:text-stone-400">
              لا توجد تطبيقات لعرضها حالياً.
            </div>
          ) : (
            <>
              {apps.map((app, i) => (
                <AppCard key={app.id || `${app.name}-${i}`} app={app} index={i} />
              ))}

              <div className="flex items-center justify-between pt-2 text-[11px] text-stone-500 dark:text-stone-400">
                <span>{lastUpdatedLabel}</span>
                <button
                  onClick={() => void refresh(true, true)}
                  disabled={loading}
                  className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  تحديث الآن
                </button>
              </div>
              <p className="text-[10px] leading-relaxed text-stone-400 dark:text-stone-600">
                تُحدَّث القائمة تلقائياً عند فتح القسم، ويُمكنك التحديث يدوياً في أي وقت — تعمل بدون نت بعد أول تحميل.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
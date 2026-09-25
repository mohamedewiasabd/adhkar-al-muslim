import React, { useCallback, useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { ShieldAlert } from 'lucide-react';
import {
  WidgetSpec, WidgetType, widgetsSupported,
  hasWidgetPermission, requestWidgetPermissionAndWait, listWidgets,
  addWidget, removeWidget, setWidgetVisible, restartWidgetsService,
  buildTasbeehSpec, buildAdhkarSpec, buildDuaSpec, buildAwradSpec,
  showWidgetToast, widgetErrorMessage
} from '../utils/widgets';
import { TasbeehWidgetSettings } from './TasbeehWidgetSettings';
import { WidgetHeader } from './widgetsManager/WidgetHeader';
import { WidgetPermissionCard } from './widgetsManager/WidgetPermissionCard';
import { WidgetQuickAddGrid } from './widgetsManager/WidgetQuickAddGrid';
import { WidgetListItem } from './widgetsManager/WidgetListItem';
import { WidgetsTips } from './widgetsManager/WidgetsTips';

interface WidgetsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_DUAS = [
  { id: 'dd1', text: 'اللهم إني أسألك الهدى والتقى والعفاف والغنى' },
  { id: 'dd2', text: 'اللهم إني أعوذ بك من الهم والحزن والعجز والكسل والبخل والجبن وضلع الدين وغلبة الرجال' },
  { id: 'dd3', text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ' },
  { id: 'dd4', text: 'اللهم إني أعوذ بك من زوال نعمتك، وتحول عافيتك، وفجاءة نقمتك، وجميع سخطك' },
  { id: 'dd5', text: 'اللهم أعني على ذكرك وشكرك وحسن عبادتك' },
  { id: 'dd6', text: 'اللهم إني أسألك العفو والعافية في الدنيا والآخرة' }
];

const DEFAULT_ADHKAR = [
  { id: 'ad1', text: 'سبحان الله وبحمده', target: 33 },
  { id: 'ad2', text: 'الْحَمْدُ لِلَّهِ', target: 33 },
  { id: 'ad3', text: 'اللهُ أَكْبَر', target: 34 },
  { id: 'ad4', text: 'أَسْتَغْفِرُ اللهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ', target: 100 }
];

const DEFAULT_AWRAD = [
  { id: 'aw1', text: 'أذكار الصباح', target: 1 },
  { id: 'aw2', text: 'أذكار المساء', target: 1 },
  { id: 'aw3', text: 'ورد القرآن اليومي', target: 1 },
  { id: 'aw4', text: 'مسبحة اليوم', target: 100 }
];

export const WidgetsManagerModal: React.FC<WidgetsManagerModalProps> = ({ isOpen, onClose }) => {
  const [permission, setPermission] = useState<boolean>(false);
  const [widgets, setWidgets] = useState<WidgetSpec[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const granted = await hasWidgetPermission();
      setPermission(granted);
      if (granted) setWidgets(await listWidgets());
      else setWidgets([]);
      setError(null);
    } catch (e) {
      setError(widgetErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) reload();
  }, [isOpen, reload]);

  useEffect(() => {
    if (!isOpen) return;
    let removed = false;
    let handle: { remove: () => void } | null = null;
    (async () => {
      try {
        const h = await App.addListener('appStateChange', (state) => {
          if (state.isActive) void reload();
        });
        if (!removed) handle = h;
        else h.remove();
      } catch {
        // ignored
      }
    })();
    const onFocus = () => void reload();
    window.addEventListener('focus', onFocus);
    return () => {
      removed = true;
      handle?.remove();
      window.removeEventListener('focus', onFocus);
    };
  }, [isOpen, reload]);

  if (!isOpen) return null;

  const handleGrant = async () => {
    const res = await requestWidgetPermissionAndWait();
    setPermission(res.granted);
    if (res.granted) {
      setError(null);
      const list = await listWidgets();
      setWidgets(list);
      if (list.length === 0) {
        await addWidget(buildTasbeehSpec('سبحان الله وبحمده', 33));
        showWidgetToast('أُضيفت مسبحة تلقائياً — اسحبها غير مقامها واضغط للعدّ');
        setWidgets(await listWidgets());
      } else {
        showWidgetToast('الإذن مفعّل — اضغط «أضف» لإنشاء ودجد');
      }
    } else if (!res.opened) {
      setError('تعذّر فتح شاشة الإذن تلقائياً. افتحها يدوياً: الإعدادات ← التطبيقات ← أذكار المسلم ← الرسم فوق التطبيقات، ثم عُد.');
    } else {
      setError('لم يُفعّل الإذن بعد — فعّله من إعدادات الجهاز ثم عُد');
    }
  };

  const handleAdd = async (type: WidgetType) => {
    let spec: WidgetSpec | null = null;
    if (type === 'tasbeeh') spec = buildTasbeehSpec('سبحان الله وبحمده', 33);
    else if (type === 'adhkar') spec = buildAdhkarSpec('أذكار العدد', DEFAULT_ADHKAR);
    else if (type === 'dua') spec = buildDuaSpec('دعاء اليوم', DEFAULT_DUAS);
    else spec = buildAwradSpec('الورد اليومي', DEFAULT_AWRAD);
    if (!spec) return;
    try {
      setError(null);
      await addWidget(spec);
      showWidgetToast('تمت إضافة الودجد — اسحبه واضغط عليه للعدّ');
      setWidgets(await listWidgets());
    } catch (e) {
      setError(widgetErrorMessage(e));
      showWidgetToast('تعذّرت الإضافة — راجع الرسالة في الأعلى');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      setError(null);
      await removeWidget(id);
      setWidgets(await listWidgets());
    } catch (e) {
      setError(widgetErrorMessage(e));
    }
  };

  const handleToggle = async (w: WidgetSpec) => {
    if (!w.id) return;
    try {
      setError(null);
      await setWidgetVisible(w.id, !(w.visible ?? true));
      setWidgets(await listWidgets());
    } catch (e) {
      setError(widgetErrorMessage(e));
    }
  };

  const handleRestart = async () => {
    try {
      setError(null);
      await restartWidgetsService();
      showWidgetToast('أُعيد تشغيل الودجات — تحقق الآن من الشاشة');
      setWidgets(await listWidgets());
    } catch (e) {
      setError(widgetErrorMessage(e));
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-stone-100/80 dark:bg-stone-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center" dir="rtl">
      <div className="w-full max-w-md max-h-[92vh] bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden motion-safe:animate-[slideUp_.3s_ease]">
        <WidgetHeader onClose={onClose} />

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!widgetsSupported() ? (
            <div className="rounded-3xl border border-stone-200 dark:border-stone-800 p-5 text-center text-sm text-stone-500 dark:text-stone-400">
              الودجات متاحة في تطبيق أندرويد — ثبّت النسخة الأصلية للاستخدام.
            </div>
          ) : !permission ? (
            <WidgetPermissionCard onGrant={handleGrant} />
          ) : (
            <>
              <WidgetQuickAddGrid onAdd={handleAdd} />

              <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500 dark:text-stone-400">
                <span>{loading ? 'جارٍ التحميل...' : `الودجات النشطة (${widgets.length})`}</span>
                <div className="flex items-center gap-2">
                  <button onClick={handleRestart} className="font-bold text-teal-600 dark:text-teal-400">إعادة تشغيل</button>
                  <button onClick={() => reload()} className="font-bold text-sky-600 dark:text-sky-400">تحديث</button>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-3 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed flex-1">{error}</div>
                </div>
              )}

              {widgets.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 p-6 text-center text-xs text-stone-400">
                  لا توجد ودجات بعد — أضف واحدة من الأعلى.
                </div>
              ) : (
                widgets.map((w) => (
                  <WidgetListItem
                    key={w.id}
                    widget={w}
                    onToggle={() => handleToggle(w)}
                    onRemove={() => handleRemove(w.id!)}
                  />
                ))
              )}

              <WidgetsTips />
            </>
          )}

          <TasbeehWidgetSettings />
        </div>
      </div>
    </div>
  );
};

export default WidgetsManagerModal;
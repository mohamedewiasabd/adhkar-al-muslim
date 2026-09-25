import React, { useState } from 'react';
import { LayoutGrid, Loader2 } from 'lucide-react';
import { isAndroidPlatform } from '../utils/platform';
import {
  WidgetSpec, widgetsSupported, hasWidgetPermission,
  requestWidgetPermissionAndWait, addWidget, showWidgetToast, widgetErrorMessage
} from '../utils/widgets';

interface AddWidgetButtonProps {
  getSpec: () => WidgetSpec | null;
  label: string;
  title?: string;
  className?: string;
}

/** زر إضافة ودجد عائم (أندرويد فقط) — لا يظهر على iOS/الويب. */
export const AddWidgetButton: React.FC<AddWidgetButtonProps> = ({
  getSpec,
  label,
  title,
  className = ''
}) => {
  const [busy, setBusy] = useState(false);

  if (!isAndroidPlatform) return null;

  const handleClick = async () => {
    if (busy) return;
    if (!widgetsSupported()) {
      showWidgetToast('الودجات متاحة في تطبيق أندرويد فقط');
      return;
    }
    const granted = await hasWidgetPermission();
    if (!granted) {
      const res = await requestWidgetPermissionAndWait();
      if (!res.granted) {
        if (!res.opened) {
          showWidgetToast('تعذّر فتح شاشة الإذن تلقائياً — افتحها يدوياً: الإعدادات ← التطبيقات ← أذكار المسلم ← الرسم فوق التطبيقات');
        } else {
          showWidgetToast('فعّل إذن «الرسم فوق التطبيقات» من الإعدادات ثم عُد واضغط مرة أخرى');
        }
        return;
      }
    }
    const spec = getSpec();
    if (!spec) {
      showWidgetToast('لا يوجد محتوى لإضافته كودجد');
      return;
    }
    setBusy(true);
    try {
      await addWidget(spec);
      showWidgetToast('أُضيف الودجد — اسحبه لأي مكان واضغط للتسبيح');
    } catch (e) {
      showWidgetToast(widgetErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      title={title || 'إضافة ودجد عائم'}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-xs font-bold hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors cursor-pointer disabled:opacity-60 ${className}`}
    >
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LayoutGrid className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </button>
  );
};

export default AddWidgetButton;
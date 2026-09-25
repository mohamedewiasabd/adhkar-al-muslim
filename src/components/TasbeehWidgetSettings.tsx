import React, { useCallback, useState } from 'react';
import { Plus, Trash2, RotateCcw, ChevronDown, ChevronUp, ListOrdered } from 'lucide-react';
import {
  DEFAULT_TASBEEH_CHAIN, loadTasbeehChain, pushTasbeehChainToWidget, saveTasbeehChain, WidgetTasbeehItem
} from '../utils/tasbeehWidget';

/**
 * محرّر قائمة «مسبحة الودجد» (الشاشة الرئيسية):
 * يحرّر الأذكار وأعدادها، ويخزّنها محلياً ويدفعها للودجد الأصلي فور التغيير.
 */
export const TasbeehWidgetSettings: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<WidgetTasbeehItem[]>(() => loadTasbeehChain());
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const commit = useCallback((next: WidgetTasbeehItem[]) => {
    const clean = next.map((i, idx) => ({
      text: i.text.trim() ? i.text.trim() : `ذكر ${idx + 1}`,
      count: i.count >= 1 ? Math.round(i.count) : 33,
    }));
    setItems(clean);
    saveTasbeehChain(clean);
    pushTasbeehChainToWidget(clean).then(() => {
      setSavedMsg('حُفظت — الودجد سيعمل بها فوراً');
      setTimeout(() => setSavedMsg(null), 2200);
    }).catch(() => {
      setSavedMsg('حُفظت محلياً');
      setTimeout(() => setSavedMsg(null), 2200);
    });
  }, []);

  const updateText = (idx: number, text: string) => {
    const next = items.slice();
    next[idx] = { ...next[idx], text };
    commit(next);
  };

  const updateCount = (idx: number, count: number) => {
    const next = items.slice();
    next[idx] = { ...next[idx], count: Number.isFinite(count) && count >= 1 ? count : 33 };
    commit(next);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    const next = items.filter((_, i) => i !== idx);
    commit(next);
  };

  const addItem = () => {
    commit([...items, { text: 'أستغفر الله', count: 100 }]);
  };

  const restoreDefaults = () => {
    commit(DEFAULT_TASBEEH_CHAIN.map(i => ({ ...i })));
  };

  const inputCls =
    'w-full bg-white dark:bg-stone-900 px-2.5 py-1.5 rounded-lg text-xs font-bold text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-teal-400';

  return (
    <div className="rounded-3xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-right cursor-pointer"
      >
        <span className="flex items-center gap-2 text-xs font-bold text-indigo-800 dark:text-indigo-200">
          <ListOrdered className="w-4 h-4" />
          تخصيص مسبحة الودجد (الشاشة الرئيسية)
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-indigo-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
            ودجد «المسبحة» يتبع قائمتك بالترتيب: عند إتمام عدّ كل ذكر ينتقل تلقائياً للتالي،
            ويمكنك التنقل يدوياً بزرّي (‹) و(›) على الودجد نفسه.
          </p>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  value={item.text}
                  onChange={(e) => updateText(idx, e.target.value)}
                  placeholder={`ذكر ${idx + 1}`}
                  className={`${inputCls} flex-1`}
                />
                <input
                  type="number"
                  min={1}
                  value={item.count}
                  onChange={(e) => updateCount(idx, parseInt(e.target.value, 10) || 33)}
                  className={`${inputCls} w-[70px] text-center`}
                />
                <button
                  onClick={() => removeItem(idx)}
                  disabled={items.length <= 1}
                  aria-label="حذف الذكر"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 transition-colors disabled:opacity-30 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              إضافة ذكر
            </button>
            <button
              onClick={restoreDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-stone-500 dark:text-stone-400 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              استعادة الافتراضي
            </button>
            {savedMsg && (
              <span className="mr-auto text-[11px] text-teal-600 dark:text-teal-400 font-bold">{savedMsg}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TasbeehWidgetSettings;
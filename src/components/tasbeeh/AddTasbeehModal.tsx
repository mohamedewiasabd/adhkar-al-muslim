import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { TasbeehItem } from '../../types';

interface AddTasbeehModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: TasbeehItem) => void;
}

const TARGET_OPTIONS = [33, 100, 1000, 'infinity', 'custom'] as const;
type TargetOption = typeof TARGET_OPTIONS[number];

/** نموذج إضافة تسبيح مخصص مع معاينة حية؛ يسلم العنصر الجاهز للوالد. */
export const AddTasbeehModal: React.FC<AddTasbeehModalProps> = ({ open, onClose, onSubmit }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newFadl, setNewFadl] = useState('');
  const [newTargetOption, setNewTargetOption] = useState<TargetOption>(100);
  const [newCustomTargetValue, setNewCustomTargetValue] = useState('50');
  const [formError, setFormError] = useState('');

  if (!open) return null;

  const resolveTarget = (): number | 'infinity' => {
    if (newTargetOption === 'custom') {
      const parsed = parseInt(newCustomTargetValue, 10);
      return isNaN(parsed) || parsed <= 0 ? 100 : parsed;
    }
    return newTargetOption;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('يرجى إدخال نص الذكر أو التسبيح');
      return;
    }

    const newItem: TasbeehItem = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      count: resolveTarget(),
      fadl: newFadl.trim() || 'تسبيح مخصص أضفته يدوياً للمسبحة',
      category: 'custom',
      isCustom: true
    };

    onSubmit(newItem);

    // Reset form
    setNewTitle('');
    setNewFadl('');
    setNewTargetOption(100);
    setNewCustomTargetValue('50');
    setFormError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              إضافة تسبيح مخصص إلى المسبحة
            </h3>
          </div>
          <button
            onClick={() => {
              onClose();
              setFormError('');
            }}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {formError && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold">
              ⚠️ {formError}
            </div>
          )}

          {/* Tasbeeh text input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              نص الذكر أو التسبيح <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (formError) setFormError('');
              }}
              placeholder="مثال: يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              autoFocus
            />
          </div>

          {/* Fadl / virtue input (optional) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              الفضل أو المناسبة أو نية الذكر (اختياري)
            </label>
            <textarea
              rows={2}
              value={newFadl}
              onChange={(e) => setNewFadl(e.target.value)}
              placeholder="مثال: دعاء النبي ﷺ للثبات وحفظ القلب"
              className="w-full px-3.5 py-2 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            />
          </div>

          {/* Target count option */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              العدد المستهدف الافتراضي
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {TARGET_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={String(opt)}
                  onClick={() => setNewTargetOption(opt)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    newTargetOption === opt
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {opt === 'infinity' ? 'مفتوح ∞' : opt === 'custom' ? 'مخصص' : opt}
                </button>
              ))}
            </div>

            {newTargetOption === 'custom' && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-stone-500">أدخل العدد:</span>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={newCustomTargetValue}
                  onChange={(e) => setNewCustomTargetValue(e.target.value)}
                  className="w-24 px-3 py-1.5 text-xs rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <span className="text-xs text-stone-500">مرة</span>
              </div>
            )}
          </div>

          {/* Live Preview */}
          {newTitle.trim() && (
            <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                معاينة في المسبحة:
              </span>
              <div className="font-amiri font-bold text-base text-stone-900 dark:text-stone-100">
                {newTitle.trim()}
              </div>
              {newFadl.trim() && (
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  ✨ {newFadl.trim()}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-colors"
            >
              حفظ والبدء بالتسبيح
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
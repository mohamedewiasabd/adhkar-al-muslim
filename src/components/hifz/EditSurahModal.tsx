import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { SurahHifzProgress, SurahMeta } from '../../types';

interface EditSurahModalProps {
  surah: SurahMeta;
  existing?: SurahHifzProgress;
  onClose: () => void;
  onSave: (ayahs: number, strength: 1 | 2 | 3 | 4 | 5, notes?: string) => void;
}

export const EditSurahModal: React.FC<EditSurahModalProps> = ({
  surah,
  existing,
  onClose,
  onSave
}) => {
  const [ayahsCount, setAyahsCount] = useState<number>(existing?.memorizedAyahsCount || 0);
  const [strength, setStrength] = useState<1 | 2 | 3 | 4 | 5>(existing?.revisionStrength || 4);
  const [notes, setNotes] = useState<string>(existing?.notes || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" dir="rtl">
      <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-xl border border-stone-200 dark:border-stone-800">
        <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1">
          تفاصيل حفظ سورة {surah.name}
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          إجمالي آيات السورة: {surah.numberOfAyahs} آية
        </p>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              عدد الآيات المحفوظة:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max={surah.numberOfAyahs}
                value={ayahsCount}
                onChange={(e) => setAyahsCount(Math.min(surah.numberOfAyahs, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                className="flex-1 px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm font-bold text-center"
              />
              <button
                type="button"
                onClick={() => setAyahsCount(surah.numberOfAyahs)}
                className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs cursor-pointer hover:bg-emerald-100"
              >
                حفظت كلها
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              درجة التثبيت والإتقان (من ١ إلى ٥):
            </label>
            <div className="flex items-center justify-center gap-2 py-1">
              {([1, 2, 3, 4, 5] as const).map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStrength(star)}
                  className="p-1 text-amber-500 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${star <= strength ? 'fill-current' : 'opacity-25'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              ملاحظات المراجعة أو المتشابهات:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: بحاجة لتثبيت الربع الثاني، مراجعة نهاية الآيات..."
              rows={2}
              className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200"
            />
          </div>
        </div>

        <div className="mt-5 pt-3.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => onSave(ayahsCount, strength, notes)}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer"
          >
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Edit3, BookOpen, Star } from 'lucide-react';
import { HifzStatus, SurahHifzProgress, SurahMeta } from '../../types';

interface SurahHifzCardProps {
  surah: SurahMeta;
  record?: SurahHifzProgress;
  onStatusChange: (surahNumber: number, newStatus: HifzStatus) => void;
  onEdit: (surah: SurahMeta) => void;
  onSelect: (surahNumber: number) => void;
}

export const SurahHifzCard: React.FC<SurahHifzCardProps> = ({
  surah,
  record,
  onStatusChange,
  onEdit,
  onSelect
}) => {
  const status: HifzStatus = record?.status || 'not_started';
  const memorizedAyahs = record?.memorizedAyahsCount || (status === 'memorized' || status === 'mastered' ? surah.numberOfAyahs : 0);
  const percent = Math.min(100, Math.round((memorizedAyahs / surah.numberOfAyahs) * 100));

  return (
    <div
      className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-all shadow-xs"
    >
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center shrink-0 border border-stone-200 dark:border-stone-700">
            {surah.number}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 font-amiri text-base">
                سورة {surah.name}
              </h4>
              <span className="text-[10px] px-2 py-0.2 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {surah.numberOfAyahs} آية • الجزء {surah.juzStart}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={status}
            onChange={(e) => onStatusChange(surah.number, e.target.value as HifzStatus)}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              status === 'mastered'
                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 text-teal-700 dark:text-teal-300'
                : status === 'memorized'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                : status === 'memorizing'
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-700 dark:text-amber-300'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
            }`}
          >
            <option value="not_started">لم أبدأ بعد</option>
            <option value="memorizing">قيد الحفظ</option>
            <option value="memorized">تم الحفظ كاملاً</option>
            <option value="mastered">متقنة ومراجعة</option>
          </select>

          <button
            onClick={() => onEdit(surah)}
            title="تعديل تفاصيل الآيات المحفوظة"
            className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSelect(surah.number)}
            title="قراءة السورة في المصحف"
            className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {status === 'memorizing' && (
        <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
            <span>حفظت {memorizedAyahs} من {surah.numberOfAyahs} آية</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{percent}%</span>
          </div>
          <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {record?.revisionStrength && (
        <div className="mt-2 flex items-center gap-1 text-[11px] text-stone-500">
          <span>درجة الإتقان:</span>
          <div className="flex items-center gap-0.5 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < (record.revisionStrength || 0) ? 'fill-current' : 'opacity-25'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
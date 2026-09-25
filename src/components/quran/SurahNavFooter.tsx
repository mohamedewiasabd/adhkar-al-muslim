import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SurahMeta } from '../../types';

interface SurahNavFooterProps {
  surah: SurahMeta;
  surahNumber: number;
  onPrev: () => void;
  onNext: () => void;
}

/** شريط التنقل السفلي بعد نهاية السورة. */
export const SurahNavFooter: React.FC<SurahNavFooterProps> = ({
  surah,
  surahNumber,
  onPrev,
  onNext
}) => {
  return (
    <div className="p-4 bg-stone-100 dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 flex items-center justify-between">
      <button
        onClick={onPrev}
        disabled={surahNumber <= 1}
        className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 disabled:opacity-30 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-stone-700 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
      >
        <ChevronRight className="w-4 h-4" />
        <span>السورة السابقة</span>
      </button>

      <div className="text-xs text-stone-500 font-medium">
        نهاية سورة {surah.name}
      </div>

      <button
        onClick={onNext}
        disabled={surahNumber >= 114}
        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-xs font-bold text-white transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
      >
        <span>السورة التالية</span>
        <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
};
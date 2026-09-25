import React from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { SurahMeta } from '../../types';

interface QuranPickerProps {
  surahs: SurahMeta[];
  currentSurah: SurahMeta | undefined;
  quranSurahNumber: number;
  quranAyahNumber: number;
  isSurahOpen: boolean;
  onSurahOpenChange: (open: boolean) => void;
  onSelectSurah: (number: number) => void;
  onAyahChange: (number: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/** منتقي آية من القرآن (سورة + خطوات الآية) لتبويب المشاركة. */
export const QuranPicker: React.FC<QuranPickerProps> = ({
  surahs,
  currentSurah,
  quranSurahNumber,
  quranAyahNumber,
  isSurahOpen,
  onSurahOpenChange,
  onSelectSurah,
  onAyahChange,
  searchQuery,
  onSearchChange
}) => {
  const filteredSurahs = surahs.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.includes(searchQuery) || s.englishName.toLowerCase().includes(q);
  });

  const goAyah = (delta: number) => {
    if (!currentSurah) return;
    onAyahChange(Math.min(currentSurah.numberOfAyahs, Math.max(1, quranAyahNumber + delta)));
  };

  return (
    <div>
      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
        اختر السورة والآية من القرآن الكريم:
      </label>

      {/* Surah dropdown */}
      <div className="relative mb-2.5">
        <button
          id="btn-open-surah-picker"
          onClick={() => onSurahOpenChange(!isSurahOpen)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-right text-stone-800 dark:text-stone-200 hover:border-emerald-500 transition-colors cursor-pointer"
        >
          <div className="flex-1 truncate pl-2">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-1.5">
              {currentSurah?.number}
            </span>
            <span>سورة {currentSurah?.name} ({currentSurah?.numberOfAyahs} آية)</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isSurahOpen ? 'rotate-180' : ''}`} />
        </button>

        {isSurahOpen && (
          <div className="absolute top-full right-0 left-0 mt-1.5 z-20 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 p-2 max-h-56 overflow-y-auto">
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="بحث عن سورة..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 rounded-xl text-xs bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              {filteredSurahs.map((s) => {
                const isSel = s.number === quranSurahNumber;
                return (
                  <button
                    key={s.number}
                    onClick={() => onSelectSurah(s.number)}
                    className={`w-full text-right p-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSel
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span className="truncate flex-1">
                      سورة {s.name}
                      <span className="text-stone-400"> ({s.numberOfAyahs} آية)</span>
                    </span>
                    {isSel && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
              {filteredSurahs.length === 0 && (
                <p className="text-center text-xs text-stone-400 py-3">لا توجد نتائج مطابقة</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ayah stepper */}
      <div className="flex items-center gap-2">
        <button
          id="btn-ayah-prev"
          onClick={() => goAyah(-1)}
          disabled={quranAyahNumber <= 1}
          className="w-10 h-10 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold text-lg flex items-center justify-center hover:border-emerald-500 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          +
        </button>
        <div className="flex-1 text-center">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
            الآية {quranAyahNumber}
            <span className="text-stone-400 font-medium"> من {currentSurah?.numberOfAyahs}</span>
          </span>
        </div>
        <button
          id="btn-ayah-next"
          onClick={() => goAyah(1)}
          disabled={!currentSurah || quranAyahNumber >= currentSurah.numberOfAyahs}
          className="w-10 h-10 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold text-lg flex items-center justify-center hover:border-emerald-500 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          -
        </button>
      </div>
    </div>
  );
};
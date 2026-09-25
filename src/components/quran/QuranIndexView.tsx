import React, { useMemo } from 'react';
import { Search, Bookmark } from 'lucide-react';
import { QuranBookmark, SurahHifzProgress } from '../../types';
import { surahsList, juzList } from '../../data/quranMeta';

export type QuranIndexMode = 'surahs' | 'juz';

interface QuranIndexViewProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  indexMode: QuranIndexMode;
  onIndexModeChange: (mode: QuranIndexMode) => void;
  bookmark: QuranBookmark | null;
  selectedSurahNumber: number;
  hifzData: Record<number, SurahHifzProgress>;
  onSelectSurah: (surahNumber: number) => void;
}

/** فهرس المصحف: بحث فوق السور والأجزاء مع عرض حالة العلامة والحفظ. */
export const QuranIndexView: React.FC<QuranIndexViewProps> = ({
  searchQuery,
  onSearchChange,
  indexMode,
  onIndexModeChange,
  bookmark,
  selectedSurahNumber,
  hifzData,
  onSelectSurah
}) => {
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return surahsList;
    const q = searchQuery.toLowerCase().trim();
    return surahsList.filter(
      s =>
        s.name.includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        String(s.number).includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Index Search and Tabs */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث باسم السورة أو رقمها..."
            className="w-full pr-10 pl-3 py-2.5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs focus:outline-none focus:border-emerald-500 text-stone-800 dark:text-stone-200"
          />
        </div>
        <div className="flex items-center bg-white dark:bg-stone-900 p-1 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs font-semibold">
          <button
            onClick={() => onIndexModeChange('surahs')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              indexMode === 'surahs' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-stone-500'
            }`}
          >
            السور (١١٤)
          </button>
          <button
            onClick={() => onIndexModeChange('juz')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              indexMode === 'juz' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-stone-500'
            }`}
          >
            الأجزاء (٣٠)
          </button>
        </div>
      </div>

      {/* Surahs Grid */}
      {indexMode === 'surahs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredSurahs.map((surah) => {
            const isSelected = surah.number === selectedSurahNumber;
            const isBookmarkedSurah = bookmark?.surahNumber === surah.number;
            const hifzRecord = hifzData[surah.number];

            return (
              <button
                key={surah.number}
                onClick={() => onSelectSurah(surah.number)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center shrink-0 border border-stone-200 dark:border-stone-700">
                    {surah.number}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 dark:text-stone-100 font-amiri text-base">
                        سورة {surah.name}
                      </span>
                      {isBookmarkedSurah && (
                        <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surah.numberOfAyahs} آية
                    </p>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">
                    ص {surah.pageStart}
                  </span>
                  <span className="text-[10px] text-stone-400 block">
                    جزء {surah.juzStart}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Juz Grid */}
      {indexMode === 'juz' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {juzList.map((j) => (
            <div
              key={j.juz}
              onClick={() => {
                const surah = surahsList.find(s => s.name === j.startSurah) || surahsList[0];
                onSelectSurah(surah.number);
              }}
              className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-400 transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  {j.name}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  يبدأ من سورة {j.startSurah} (آية {j.startAyah})
                </p>
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                  ص {j.page}
                </span>
                <span className="text-[10px] text-stone-400">فتح الجزء ←</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
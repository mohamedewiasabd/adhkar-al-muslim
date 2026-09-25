import React from 'react';
import { ChevronLeft, ChevronRight, ListFilter } from 'lucide-react';
import { SurahMeta } from '../../types';

interface SurahHeaderCardProps {
  surah: SurahMeta;
  surahNumber: number;
  onPrev: () => void;
  onNext: () => void;
  onOpenIndex: () => void;
}

/** بطاقة رأس السورة مع إطارات الزخرفة والتنقل بين السور. */
export const SurahHeaderCard: React.FC<SurahHeaderCardProps> = ({
  surah,
  surahNumber,
  onPrev,
  onNext,
  onOpenIndex
}) => {
  return (
    <div className="bg-gradient-to-b from-emerald-800 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 shadow-lg border border-emerald-700/50 relative overflow-hidden">
      {/* Top Bar with Prev/Next Surah */}
      <div className="flex items-center justify-between relative z-10 mb-3">
        <button
          onClick={onPrev}
          disabled={surahNumber <= 1}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-semibold transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
          <span>السابقة</span>
        </button>

        <button
          onClick={onOpenIndex}
          className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>فهرس السور</span>
        </button>

        <button
          onClick={onNext}
          disabled={surahNumber >= 114}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-semibold transition-colors cursor-pointer"
        >
          <span>التالية</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Surah Name & Ornaments */}
      <div className="text-center py-2 relative z-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200 px-3 py-1 rounded-full bg-emerald-700/50 border border-emerald-500/30 mb-2">
          <span>سورة رقم {surah.number}</span>
          <span>•</span>
          <span>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
          <span>•</span>
          <span>{surah.numberOfAyahs} آية</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold font-amiri tracking-wide text-amber-300">
          سُورَةُ {surah.name}
        </h2>

        <div className="flex items-center justify-center gap-4 text-xs text-emerald-200/90 mt-2 font-medium">
          <span>الجزء {surah.juzStart}</span>
          <span>•</span>
          <span>بداية الصفحة {surah.pageStart}</span>
        </div>
      </div>

      {/* Basmalah Display (except At-Tawbah & Al-Fatiha already has it as ayah 1) */}
      {surahNumber !== 9 && surahNumber !== 1 && (
        <div className="mt-4 pt-3.5 border-t border-emerald-700/50 text-center">
          <div className="font-amiri text-xl sm:text-2xl font-bold text-emerald-100">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        </div>
      )}
    </div>
  );
};
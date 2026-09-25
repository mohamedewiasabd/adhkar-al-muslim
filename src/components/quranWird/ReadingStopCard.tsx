import React from 'react';
import { Bookmark } from 'lucide-react';
import { QuranBookmark } from '../../types';

interface ReadingStopCardProps {
  bookmark: QuranBookmark | null;
  currentSurahName: string;
  currentPage: number;
  lastReadDate: string;
  onJumpToBookmark: () => void;
  onOpenSurah: () => void;
}

export const ReadingStopCard: React.FC<ReadingStopCardProps> = ({
  bookmark,
  currentSurahName,
  currentPage,
  lastReadDate,
  onJumpToBookmark,
  onOpenSurah
}) => (
  <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Bookmark className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
            علامة التوقف (الفاصل)
          </h4>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            {bookmark ? `سورة ${bookmark.surahName} • آية (${bookmark.ayahNumber})` : `سورة ${currentSurahName} • صفحة ${currentPage}`}
          </p>
        </div>
      </div>
      {bookmark && (
        <button
          onClick={onJumpToBookmark}
          className="text-xs px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 font-bold transition-colors cursor-pointer"
        >
          متابعة القراءة
        </button>
      )}
    </div>

    <div className="mt-3 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 text-xs">
      {bookmark ? (
        <p className="text-stone-600 dark:text-stone-300 font-amiri line-clamp-2">
          « {bookmark.ayahTextSnippet || 'آية محفوظة كعلامة توقف'} »
        </p>
      ) : (
        <p className="text-stone-500 dark:text-stone-400 text-center py-1">
          لم تقم بحفظ علامة فاصلة بعد. يمكنك الضغط على أيقونة الفاصل في المصحف لأي آية.
        </p>
      )}
    </div>

    <div className="mt-3 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
      <span>آخر تحديث: {lastReadDate}</span>
      <button
        onClick={onOpenSurah}
        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
      >
        فتح السورة الآن ←
      </button>
    </div>
  </div>
);
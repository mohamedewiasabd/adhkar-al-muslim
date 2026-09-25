import React from 'react';
import { BookmarkCheck } from 'lucide-react';
import { AyahItem, QuranBookmark, SurahMeta } from '../../types';
import { SurahHeaderCard } from './SurahHeaderCard';
import { AyahStreamCard } from './AyahStreamCard';
import { SurahNavFooter } from './SurahNavFooter';

interface QuranReaderViewProps {
  surah: SurahMeta;
  surahNumber: number;
  surahAyahs: AyahItem[];
  isLoadingAyahs: boolean;
  apiError: string | null;
  playingAyah: number | null;
  copiedAyahNumber: number | null;
  bookmark: QuranBookmark | null;
  fontSize: 'small' | 'medium' | 'large';
  canShare: boolean;
  onPrev: () => void;
  onNext: () => void;
  onOpenIndex: () => void;
  onRetry: () => void;
  onToggleAudio: (ayah: AyahItem) => void;
  onCopy: (ayah: AyahItem) => void;
  onOpenVideo: (ayah: AyahItem) => void;
  onOpenImage: (ayah: AyahItem) => void;
  onPlatformShare: (ayah: AyahItem) => void;
  onToggleBookmark: (ayah: AyahItem) => void;
}

/** تيار قراءة المصحف: رأس السورة والتنبيهات والآيات مع شريط التنقل السفلي. */
export const QuranReaderView: React.FC<QuranReaderViewProps> = ({
  surah,
  surahNumber,
  surahAyahs,
  isLoadingAyahs,
  apiError,
  playingAyah,
  copiedAyahNumber,
  bookmark,
  fontSize,
  canShare,
  onPrev,
  onNext,
  onOpenIndex,
  onRetry,
  onToggleAudio,
  onCopy,
  onOpenVideo,
  onOpenImage,
  onPlatformShare,
  onToggleBookmark
}) => {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Surah Header Card */}
      <SurahHeaderCard
        surah={surah}
        surahNumber={surahNumber}
        onPrev={onPrev}
        onNext={onNext}
        onOpenIndex={onOpenIndex}
      />

      {/* Bookmark Quick Notification if saved in this surah */}
      {bookmark?.surahNumber === surah.number && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 p-3 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>لديك علامة توقف عند الآية رقم <b>({bookmark.ayahNumber})</b></span>
          </div>
          <button
            onClick={() => {
              const elem = document.getElementById(`ayah-${bookmark.ayahNumber}`);
              elem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="font-bold underline cursor-pointer"
          >
            الانتقال للآية
          </button>
        </div>
      )}

      {/* Loading & Error States */}
      {isLoadingAyahs && (
        <div className="py-16 text-center text-stone-500 dark:text-stone-400 space-y-3">
          <div className="w-8 h-8 mx-auto border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold">جارٍ فتح صفحات المصحف الشريف المباركة...</p>
        </div>
      )}

      {apiError && !isLoadingAyahs && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-center space-y-2">
          <p className="text-xs text-red-700 dark:text-red-300 font-semibold">{apiError}</p>
          <button
            onClick={onRetry}
            className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Ayahs Stream View */}
      {!isLoadingAyahs && surahAyahs.length > 0 && (
        <div className="space-y-3">
          {surahAyahs.map((ayah) => {
            const isPlaying = playingAyah === ayah.number;
            const isCopied = copiedAyahNumber === ayah.numberInSurah;

            return (
              <AyahStreamCard
                key={ayah.number}
                ayah={ayah}
                surah={surah}
                bookmark={bookmark}
                isPlaying={isPlaying}
                isCopied={isCopied}
                fontSize={fontSize}
                canShare={canShare}
                onToggleAudio={onToggleAudio}
                onCopy={onCopy}
                onOpenVideo={onOpenVideo}
                onOpenImage={onOpenImage}
                onPlatformShare={onPlatformShare}
                onToggleBookmark={onToggleBookmark}
              />
            );
          })}

          {/* Bottom Surah Footer & Navigation */}
          <SurahNavFooter
            surah={surah}
            surahNumber={surahNumber}
            onPrev={onPrev}
            onNext={onNext}
          />
        </div>
      )}
    </div>
  );
};
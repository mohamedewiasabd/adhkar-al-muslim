import React from 'react';
import {
  Copy,
  Check,
  Share2,
  Volume2,
  VolumeX,
  Bookmark,
  Film,
  Send
} from 'lucide-react';
import { AyahItem, SurahMeta, QuranBookmark } from '../../types';

interface AyahStreamCardProps {
  ayah: AyahItem;
  surah: SurahMeta;
  bookmark: QuranBookmark | null;
  isPlaying: boolean;
  isCopied: boolean;
  fontSize: 'small' | 'medium' | 'large';
  canShare: boolean;
  onToggleAudio: (ayah: AyahItem) => void;
  onCopy: (ayah: AyahItem) => void;
  onOpenVideo: (ayah: AyahItem) => void;
  onOpenImage: (ayah: AyahItem) => void;
  onPlatformShare: (ayah: AyahItem) => void;
  onToggleBookmark: (ayah: AyahItem) => void;
}

/** بطاقة آية كاملة في تيار القراءة مع شريط الأدوات ونص المصحف. */
export const AyahStreamCard: React.FC<AyahStreamCardProps> = ({
  ayah,
  surah,
  bookmark,
  isPlaying,
  isCopied,
  fontSize,
  canShare,
  onToggleAudio,
  onCopy,
  onOpenVideo,
  onOpenImage,
  onPlatformShare,
  onToggleBookmark
}) => {
  const isBookmarked =
    bookmark?.surahNumber === surah.number &&
    bookmark?.ayahNumber === ayah.numberInSurah;

  const ayahFontClass =
    fontSize === 'large'
      ? 'text-2xl sm:text-3xl leading-[2.6]'
      : fontSize === 'small'
      ? 'text-lg sm:text-xl leading-[2.2]'
      : 'text-xl sm:text-2xl leading-[2.4]';

  return (
    <div
      key={ayah.number}
      id={`ayah-${ayah.numberInSurah}`}
      className={`p-4 sm:p-5 rounded-3xl border transition-all relative ${
        isBookmarked
          ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-sm'
          : 'bg-white dark:bg-stone-900 border-stone-200/90 dark:border-stone-800/90 hover:border-stone-300 dark:hover:border-stone-700'
      }`}
    >
      {/* Top Micro-Bar: Ayah Number, Juz/Page, Quick Tools */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-stone-800/80 text-[11px] text-stone-500 dark:text-stone-400">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px]">
            {ayah.numberInSurah}
          </span>
          <span>سورة {surah.name}</span>
          <span>•</span>
          <span>جزء {ayah.juz || surah.juzStart}</span>
          {ayah.page && (
            <>
              <span>•</span>
              <span>صفحة {ayah.page}</span>
            </>
          )}
          {ayah.sajda && (
            <span className="px-2 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
              سجدة تلاوة ۩
            </span>
          )}
        </div>

        {/* Action Icon Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleAudio(ayah)}
            aria-label="استماع لتلاوة الآية بصوت الشيخ العفاسي"
            title="استماع لتلاوة الآية"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-emerald-600 text-white animate-pulse'
                : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onCopy(ayah)}
            aria-label="نسخ نص الآية"
            title="نسخ نص الآية"
            className="w-7 h-7 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onOpenVideo(ayah)}
            aria-label="تصدير الآية كفيديو مع الصوت"
            title="تصدير الآية كفيديو متحرك مع الصوت (ريلز / ستوري)"
            className="w-7 h-7 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Film className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onOpenImage(ayah)}
            aria-label="تصدير الآية في صورة جميلة"
            title="تصدير في صورة جميلة وبطاقة مشاركة"
            className="w-7 h-7 rounded-lg text-stone-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onPlatformShare(ayah)}
            aria-label="مشاركة الآية عبر منصات متعددة"
            title="مشاركة الآية (واتساب / تيليجرام / لاين / فيبر / بينترست / ...)"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              canShare
                ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                : 'hidden'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onToggleBookmark(ayah)}
            aria-label="وضع علامة توقف للقراءة"
            title={isBookmarked ? 'إزالة علامة الفاصل' : 'وضع علامة توقف (فاصل المصحف)'}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-amber-500 bg-amber-100 dark:bg-amber-950/80'
                : 'text-stone-400 hover:text-amber-500 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Ayah Arabic Uthmani Text */}
      <div className="py-1">
        <p
          className={`font-amiri text-stone-900 dark:text-stone-100 text-right ${ayahFontClass}`}
          style={{ wordSpacing: '2px' }}
        >
          {ayah.text}
          <span className="inline-flex items-center justify-center w-7 h-7 mx-2 rounded-full border border-emerald-600/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold align-middle select-none bg-emerald-50/50 dark:bg-emerald-950/30">
            {ayah.numberInSurah}
          </span>
        </p>
      </div>
    </div>
  );
};
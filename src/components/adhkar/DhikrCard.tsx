import React from 'react';
import { Check, ChevronDown, ChevronUp, RotateCcw, Sparkles, Share2, Copy, Image as ImageIcon } from 'lucide-react';
import { DhikrItem } from '../../types';

interface DhikrCardProps {
  item: DhikrItem;
  index: number;
  isFadlOpen: boolean;
  copied: boolean;
  fontClass: string;
  onTap: () => void;
  onResetCount: () => void;
  onToggleFadl: () => void;
  onCopy: () => void;
  onShare: () => void;
  onImage: () => void;
}

export const DhikrCard: React.FC<DhikrCardProps> = ({
  item,
  index,
  isFadlOpen,
  copied,
  fontClass,
  onTap,
  onResetCount,
  onToggleFadl,
  onCopy,
  onShare,
  onImage
}) => {
  const isDone = item.currentCount >= item.count;
  const remaining = Math.max(0, item.count - item.currentCount);
  const progressRatio = item.count > 0 ? (item.currentCount / item.count) : 0;

  return (
    <div
      id={`dhikr-card-${item.id}`}
      className={`relative rounded-3xl p-5 border transition-all duration-200 ${
        isDone
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-800/50'
          : 'bg-white dark:bg-stone-900 border-stone-200/90 dark:border-stone-800 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-stone-400 dark:text-stone-500 ml-1">
            #{index + 1}
          </span>

          <button
            onClick={onImage}
            id={`btn-export-image-dhikr-${item.id}`}
            className="p-1 rounded-lg text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="تصدير كبطاقة صورة جميلة"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onShare}
            id={`btn-share-dhikr-${item.id}`}
            className="p-1 rounded-lg text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="مشاركة هذا الذكر عبر واتساب ووسائل التواصل"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onCopy}
            id={`btn-copy-dhikr-${item.id}`}
            className="p-1 rounded-lg text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="نسخ نص الذكر"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
            isDone
              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
          }`}>
            {item.count > 1 ? `التكرار: ${item.count} مرات` : 'مرة واحدة'}
          </span>

          {item.currentCount > 0 && !isDone && (
            <button
              onClick={onResetCount}
              className="text-stone-400 hover:text-rose-500 p-1"
              title="تصفير العداد لهذا الذكر"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <p
        onClick={onTap}
        className={`font-amiri font-bold text-stone-900 dark:text-stone-100 text-center select-none cursor-pointer tracking-wide py-2 ${fontClass} ${
          isDone ? 'opacity-90' : ''
        }`}
      >
        {item.text}
      </p>

      {(item.fadl || item.reference) && (
        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/80">
          <button
            onClick={onToggleFadl}
            className="flex items-center justify-between w-full text-xs text-stone-500 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
          >
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>فضل الذكر والسند</span>
            </span>
            {isFadlOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isFadlOpen && (
            <div className="mt-2 text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/50 p-3 rounded-2xl border border-stone-200/50 dark:border-stone-700/40 space-y-1">
              {item.fadl && <p className="leading-relaxed font-normal">{item.fadl}</p>}
              {item.reference && (
                <p className="text-[11px] text-stone-400 dark:text-stone-500 font-medium pt-1">
                  المصدر: {item.reference}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-2 flex items-center justify-center">
        <button
          onClick={onTap}
          disabled={isDone}
          id={`btn-tap-${item.id}`}
          className={`relative w-full max-w-xs py-3.5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all duration-150 active:scale-98 ${
            isDone
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 active:bg-emerald-700'
          }`}
        >
          {isDone ? (
            <>
              <Check className="w-5 h-5 stroke-[3]" />
              <span className="font-bold text-sm">تم الذكر بحمد الله</span>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-1 font-bold">
                <span className="text-xl">{item.currentCount}</span>
                <span className="text-xs opacity-75">/ {item.count}</span>
              </div>
              <span className="font-bold text-sm">
                {remaining === 1 ? 'اضغط للمرة الأخيرة' : `اضغط للتسبيح (متبقي ${remaining})`}
              </span>
            </>
          )}

          {!isDone && (
            <span
              className="absolute bottom-0 left-0 right-0 h-1 bg-white/40 rounded-b-2xl transition-all duration-150"
              style={{ width: `${progressRatio * 100}%` }}
            />
          )}
        </button>
      </div>
    </div>
  );
};
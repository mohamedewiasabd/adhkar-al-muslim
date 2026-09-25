import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { SelectedShareable } from '../ShareModal';

interface PreviewCardProps {
  item: SelectedShareable;
  includeBenefit: boolean;
  includeReference: boolean;
  onExportImage: () => void;
}

/** بطاقة معاينة النص (الفضائل والمصدر) مع زر التصدير كصورة. */
export const PreviewCard: React.FC<PreviewCardProps> = ({
  item,
  includeBenefit,
  includeReference,
  onExportImage
}) => {
  return (
    <div className="p-4 rounded-3xl bg-gradient-to-b from-emerald-50/70 to-teal-50/40 dark:from-stone-800/80 dark:to-stone-800/50 border border-emerald-200/70 dark:border-stone-700 shadow-inner">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70">
          {item.categoryLabel || item.title}
        </span>

        <button
          type="button"
          id="btn-export-image-preview"
          onClick={onExportImage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>تصدير كصورة</span>
        </button>
      </div>

      {/* Sacred Vocalized Arabic Text */}
      <p className="font-amiri font-bold text-stone-900 dark:text-stone-50 text-base leading-relaxed text-center py-2 px-1 selection:bg-emerald-200 max-h-48 overflow-y-auto">
        « {item.text} »
      </p>

      {/* Virtue / Benefit preview */}
      {includeBenefit && item.fadlOrBenefit && item.type !== 'quran' && (
        <div className="mt-2 pt-2 border-t border-emerald-200/50 dark:border-stone-700/60 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          <span className="font-bold text-emerald-700 dark:text-emerald-400 ml-1">
            الفضل والبركة:
          </span>
          <span>{item.fadlOrBenefit}</span>
        </div>
      )}

      {/* Reference preview */}
      {includeReference && item.reference && (
        <div className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
          <span className="font-bold text-stone-600 dark:text-stone-300 ml-1">
            المصدر:
          </span>
          <span>{item.reference}</span>
        </div>
      )}
    </div>
  );
};
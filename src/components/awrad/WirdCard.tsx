import React from 'react';
import { Star, Plus, ChevronLeft, Flame, UserCheck, Image as ImageIcon } from 'lucide-react';
import { ScholarWirdItem } from '../../types';

interface WirdCardProps {
  wird: ScholarWirdItem;
  isFavorite: boolean;
  onOpen: (wird: ScholarWirdItem) => void;
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void;
  onExportImage: (wird: ScholarWirdItem, e: React.MouseEvent) => void;
  onAddToDaily: (wird: ScholarWirdItem, e?: React.MouseEvent) => void;
}

/** بطاقة ورد مأثور في قائمة أوراد المشايخ مع الشرف والمميزات. */
export const WirdCard: React.FC<WirdCardProps> = ({
  wird,
  isFavorite,
  onOpen,
  onToggleFavorite,
  onExportImage,
  onAddToDaily
}) => {
  const isNonSufi = wird.tradition === 'non_sufi';

  return (
    <div
      onClick={() => onOpen(wird)}
      className="group p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-400 dark:hover:border-emerald-700 transition-all cursor-pointer shadow-sm hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {/* Category & Tradition Tag */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isNonSufi
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50'
            }`}>
              {isNonSufi ? 'أئمة الحديث والفقه (غير صوفية)' : 'مشايخ التصوف السني'}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              {wird.category}
            </span>
            {wird.isPopular && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5" /> مشهور ومجرب
              </span>
            )}
          </div>

          {/* Title & Scholar */}
          <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {wird.title}
          </h3>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{wird.scholar}</span>
            {wird.scholarEra && (
              <span className="text-[11px] text-stone-400 font-normal">
                ({wird.scholarEra})
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 line-clamp-2 leading-relaxed">
            {wird.shortDescription}
          </p>

          {/* Timing Pill */}
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
            <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 font-medium">
              🕒 {wird.recommendedTime}
            </span>
            <span>• {wird.sections.length} أذكار وفقرات</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Export as Image Button */}
          <button
            onClick={(e) => onExportImage(wird, e)}
            className="p-2 rounded-xl text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="تصدير كبطاقة صورة جميلة"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Favorite Star Button */}
          <button
            onClick={(e) => onToggleFavorite(wird.id, e)}
            className={`p-2 rounded-xl transition-all ${
              isFavorite
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                : 'text-stone-300 dark:text-stone-700 hover:text-amber-400'
            }`}
            title={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
          >
            <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bottom Card Actions */}
      <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
        <button
          onClick={(e) => onAddToDaily(wird, e)}
          className="flex items-center gap-1 text-[11px] font-bold text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-stone-50 dark:bg-stone-850 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-600" />
          <span>أضف إلى وردي اليومي</span>
        </button>

        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-[-2px] transition-transform">
          <span>فتح وقراءة الورد</span>
          <ChevronLeft className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Share2, Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
import { AddWidgetButton } from '../AddWidgetButton';
import { buildAdhkarSpec } from '../../utils/widgets';

interface CategoryOverviewCardProps {
  categoryLabel: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
  widgetTitle: string;
  widgetItems: { id: string; text: string; target: number }[];
  onShare: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset: () => void;
}

export const CategoryOverviewCard: React.FC<CategoryOverviewCardProps> = ({
  categoryLabel,
  completedCount,
  totalCount,
  percentage,
  widgetTitle,
  widgetItems,
  onShare,
  soundEnabled,
  onToggleSound,
  onReset
}) => (
  <div className="mt-3 p-4 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/10">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-stone-800 dark:text-stone-100">
          إنجاز {categoryLabel}
        </span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
          {completedCount} من {totalCount}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <AddWidgetButton
          label="ودجد"
          title="أضف ودجد أذكار عائم فوق الشاشة"
          getSpec={() => buildAdhkarSpec(widgetTitle, widgetItems)}
        />
        <button
          onClick={onShare}
          id="btn-share-category"
          className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="مشاركة الأذكار"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>مشاركة</span>
        </button>
        <button
          onClick={onToggleSound}
          id="btn-toggle-sound-adhkar"
          className="p-1.5 rounded-xl text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          title={soundEnabled ? 'كتم صوت النقر' : 'تفعيل صوت النقر'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <button
          onClick={onReset}
          id="btn-reset-category"
          className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="إعادة تعيين عداد هذه الفئة"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة</span>
        </button>
      </div>
    </div>

    <div className="w-full h-2.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
    {percentage === 100 && (
      <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
        <Sparkles className="w-4 h-4" />
        <span>ما شاء الله! تم إكمال أذكار هذه الفئة بالكامل</span>
      </div>
    )}
  </div>
);
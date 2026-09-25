import React from 'react';
import { Trophy } from 'lucide-react';

const TOTAL_PAGES = 604;

interface KhatmahProgressCardProps {
  currentPage: number;
  progressPercent: number;
  completedKhatmasCount: number;
  onResetKhatmah: () => void;
}

export const KhatmahProgressCard: React.FC<KhatmahProgressCardProps> = ({
  currentPage,
  progressPercent,
  completedKhatmasCount,
  onResetKhatmah
}) => (
  <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Trophy className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
            مستوى الختمة الحالية
          </h4>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            صفحة {currentPage} من ٦٠٤ ({progressPercent}%)
          </p>
        </div>
      </div>
      {completedKhatmasCount > 0 && (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
          {completedKhatmasCount} ختمات سابقة
        </span>
      )}
    </div>

    <div className="w-full h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full mt-3 overflow-hidden">
      <div
        className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-300"
        style={{ width: `${progressPercent}%` }}
      />
    </div>

    <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
      <span className="text-stone-600 dark:text-stone-400">
        المتبقي للختم: <b className="text-emerald-600 dark:text-emerald-400">{TOTAL_PAGES - currentPage}</b> صفحة
      </span>
      {currentPage >= 600 ? (
        <button
          onClick={onResetKhatmah}
          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
        >
          تسجيل ختمة جديدة
        </button>
      ) : null}
    </div>
  </div>
);
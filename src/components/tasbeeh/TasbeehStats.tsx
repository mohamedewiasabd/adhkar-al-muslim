import React from 'react';

interface TasbeehStatsProps {
  todayCount: number;
  totalCount: number;
}

/** بطاقتا إحصاءات المسبحة (تسبيحات اليوم والإجمالي الكلي). */
export const TasbeehStats: React.FC<TasbeehStatsProps> = ({ todayCount, totalCount }) => {
  return (
    <div className="mt-8 w-full grid grid-cols-2 gap-3 text-center">
      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 shadow-sm">
        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold block mb-0.5">
          تسبيحات اليوم
        </span>
        <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
          {todayCount}
        </span>
      </div>

      <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold block mb-0.5">
          الإجمالي الكلي
        </span>
        <span className="text-lg font-bold text-stone-800 dark:text-stone-100">
          {totalCount}
        </span>
      </div>
    </div>
  );
};
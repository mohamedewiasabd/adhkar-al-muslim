import React from 'react';
import { HifzStats } from '../../hooks/useHifzStats';

interface HifzDashboardProps {
  stats: HifzStats;
}

export const HifzDashboard: React.FC<HifzDashboardProps> = ({ stats }) => (
  <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 dark:from-stone-900 dark:to-stone-950 text-white rounded-3xl p-5 border border-stone-800 shadow-xl relative overflow-hidden">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
            سجل حفظ كتاب الله
          </span>
        </div>
        <h3 className="text-lg font-bold mt-1 text-stone-100">
          متابعة وإتقان حفظ القرآن الكريم
        </h3>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-amiri text-2xl font-bold">
        ﴿۞﴾
      </div>
    </div>

    <div className="mt-4">
      <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-stone-300">
        <span>نسبة حفظ القرآن كاملاً:</span>
        <span className="font-bold text-amber-400">
          {stats.totalAyahsMemorized} آية من ٦٢٣٦ ({stats.progressPercent}%)
        </span>
      </div>
      <div className="w-full h-3 bg-stone-800 rounded-full overflow-hidden p-0.5 border border-stone-700">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${stats.progressPercent}%` }}
        />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2.5 mt-4 pt-3.5 border-t border-stone-800">
      <div className="bg-stone-800/60 p-2.5 rounded-xl border border-stone-700/60 text-center">
        <div className="text-lg font-bold text-emerald-400">
          {stats.completedSurahsTotal}
        </div>
        <div className="text-[11px] text-stone-400 mt-0.5">سور تامة الحفظ</div>
      </div>
      <div className="bg-stone-800/60 p-2.5 rounded-xl border border-stone-700/60 text-center">
        <div className="text-lg font-bold text-amber-400">
          {stats.memorizingCount}
        </div>
        <div className="text-[11px] text-stone-400 mt-0.5">قيد الحفظ الآن</div>
      </div>
      <div className="bg-stone-800/60 p-2.5 rounded-xl border border-stone-700/60 text-center">
        <div className="text-lg font-bold text-teal-400">
          {stats.masteredCount}
        </div>
        <div className="text-[11px] text-stone-400 mt-0.5">متقنة ومراجعة</div>
      </div>
    </div>
  </div>
);
import React, { useState } from 'react';
import { CheckCircle2, Plus, Minus } from 'lucide-react';
import { QuranReadingWirdGoal } from '../../types';
import { triggerHaptic } from '../../utils/audio';

interface QuranDailyGoalCardProps {
  wirdGoal: QuranReadingWirdGoal;
  dailyProgressPercent: number;
  onAddPage: (count: number) => void;
  onSaveTarget: (pages: number) => void;
}

export const QuranDailyGoalCard: React.FC<QuranDailyGoalCardProps> = ({
  wirdGoal,
  dailyProgressPercent,
  onAddPage,
  onSaveTarget
}) => {
  const [showEditTarget, setShowEditTarget] = useState(false);
  const [targetPagesInput, setTargetPagesInput] = useState<number>(wirdGoal.dailyPagesTarget || 4);

  const handleSave = () => {
    triggerHaptic(25);
    onSaveTarget(Math.max(1, targetPagesInput));
    setShowEditTarget(false);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
      <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      <div className="absolute top-2 left-3 opacity-15 text-5xl font-amiri select-none">
        ۞
      </div>

      <div className="flex items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
              الورد القرآني اليومي
            </span>
            {dailyProgressPercent >= 100 && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                أنجزت ورد اليوم!
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold mt-1">
            متابعة الورد القرآني اليومي
          </h3>
        </div>

        <button
          onClick={() => setShowEditTarget(!showEditTarget)}
          className="text-xs px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
        >
          تعديل الهدف
        </button>
      </div>

      {showEditTarget && (
        <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center gap-3 animate-fade-in">
          <span className="text-xs text-emerald-100">الهدف اليومي (صفحات):</span>
          <input
            type="number"
            min="1"
            max="100"
            value={targetPagesInput}
            onChange={(e) => setTargetPagesInput(parseInt(e.target.value, 10) || 1)}
            className="w-16 px-2 py-1 rounded-lg bg-white/20 text-white font-bold text-center border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            onClick={handleSave}
            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-900 font-bold text-xs transition-colors cursor-pointer"
          >
            حفظ
          </button>
        </div>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-emerald-100">
          <span>إنجاز ورد اليوم</span>
          <span className="font-bold">
            {wirdGoal.currentDayPagesRead} من {wirdGoal.dailyPagesTarget} صفحة ({dailyProgressPercent}%)
          </span>
        </div>
        <div className="w-full h-3 bg-white/15 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-emerald-300 rounded-full transition-all duration-500"
            style={{ width: `${dailyProgressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs text-emerald-200">
          <span>تسجيل قراءة:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddPage(-1)}
            disabled={wirdGoal.currentDayPagesRead <= 0}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="إنقاص صفحة"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onAddPage(1)}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+١ صفحة</span>
          </button>
          <button
            onClick={() => onAddPage(4)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-emerald-400/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+٤ صفحات (حزب)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
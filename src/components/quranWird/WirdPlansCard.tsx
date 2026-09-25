import React from 'react';
import { Sparkles } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';

interface WirdPlansCardProps {
  onApplyPlan: (pages: number) => void;
}

const PLANS = [
  { pages: 4, title: 'ختمة في ٥ أشهر', desc: '٤ صفحات يومياً (حزب)' },
  { pages: 10, title: 'ختمة في شهرين', desc: '١٠ صفحات يومياً (نصف جزء)' },
  { pages: 20, title: 'ختمة كل شهر', desc: '٢٠ صفحة يومياً (جزء كامل)', accent: true }
];

export const WirdPlansCard: React.FC<WirdPlansCardProps> = ({ onApplyPlan }) => (
  <div className="bg-stone-50 dark:bg-stone-800/40 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800">
    <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mb-2.5">
      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
      <span>خطط مقترحة لختم القرآن الكريم:</span>
    </h4>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
      {PLANS.map((plan) => (
        <div
          key={plan.pages}
          onClick={() => {
            triggerHaptic(15);
            onApplyPlan(plan.pages);
          }}
          className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 cursor-pointer hover:border-emerald-500 transition-colors"
        >
          <div className={`font-bold text-stone-800 dark:text-stone-200 ${plan.accent ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
            {plan.title}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{plan.desc}</div>
        </div>
      ))}
    </div>
  </div>
);
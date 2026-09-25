import React from 'react';
import { Sparkles } from 'lucide-react';
import { TasbeehItem } from '../../types';

interface TasbeehDialProps {
  item: TasbeehItem;
  currentCount: number;
  targetCount: number | 'infinity';
  lapsCount: number;
  isTapping: boolean;
  onTap: () => void;
}

/** القرص الدائري التفاعلي للمسبحة مع حلقة التقدم والعداد المركزي. */
export const TasbeehDial: React.FC<TasbeehDialProps> = ({
  item,
  currentCount,
  targetCount,
  lapsCount,
  isTapping,
  onTap
}) => {
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = targetCount === 'infinity' ? 1 : Math.min(1, currentCount / targetCount);
  const strokeDashoffset = targetCount === 'infinity' ? 0 : circumference - progressRatio * circumference;

  return (
    <div className="mt-5 flex flex-col items-center">
      {/* Selected Dhikr Display Header */}
      <div className="text-center px-4 mb-3 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3 h-3" />
          <span>{item.isCustom ? 'تسبيح مخصص' : 'تسبيح مأثور'}</span>
        </div>

        <h2 className="font-amiri font-bold text-2xl md:text-3xl text-stone-900 dark:text-stone-50 tracking-wide leading-relaxed">
          {item.title}
        </h2>

        {item.fadl && (
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5 font-medium leading-normal bg-stone-100/70 dark:bg-stone-850/70 p-2 rounded-xl border border-stone-200/50 dark:border-stone-800/50">
            ✨ {item.fadl}
            {item.reference && (
              <span className="block text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                [{item.reference}]
              </span>
            )}
          </p>
        )}
      </div>

      {/* Circular Dial Button */}
      <div
        onClick={onTap}
        id="tasbeeh-interactive-dial"
        className={`relative cursor-pointer select-none rounded-full p-3 transition-transform duration-100 flex items-center justify-center ${
          isTapping ? 'scale-95' : 'scale-100 hover:scale-[1.02]'
        }`}
      >
        {/* SVG Progress Ring */}
        <svg className="w-56 h-56 -rotate-90 transform" viewBox="0 0 240 240">
          <circle
            cx="120"
            cy="120"
            r={radius}
            className="stroke-stone-200 dark:stroke-stone-800"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="120"
            cy="120"
            r={radius}
            className="stroke-emerald-500 transition-all duration-150"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Central Counter Display Card */}
        <div className="absolute inset-5 rounded-full bg-gradient-to-b from-white to-stone-50 dark:from-stone-900 dark:to-stone-950 border border-stone-200/80 dark:border-stone-800 shadow-xl flex flex-col items-center justify-center p-4">
          <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-1">
            {targetCount === 'infinity' ? 'تسبيح حر' : `الدورة: ${lapsCount + 1}`}
          </span>

          <div className="text-5xl font-black text-stone-900 dark:text-stone-50 tracking-tight font-cairo">
            {currentCount}
          </div>

          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            {targetCount === 'infinity' ? '∞ مفتوح' : `من أصل ${targetCount}`}
          </div>

          <div className="mt-2 text-[10px] text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full font-medium">
            المس في أي مكان للتسبيح
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Check } from 'lucide-react';
import { ScholarWirdItem, WirdSection } from '../../types';

interface WirdInteractiveRecitationProps {
  wird: ScholarWirdItem;
  sectionCounts: Record<string, number>;
  currentSectionIndex: number;
  fontClass: string;
  onCountSection: (section: WirdSection) => void;
  onSectionChange: (index: number) => void;
}

/** التلاوة التفاعلية: شريط التقدم الكلي وبطاقة الفقرة الحالية مع العداد والتنقل بين الفقرات. */
export const WirdInteractiveRecitation: React.FC<WirdInteractiveRecitationProps> = ({
  wird,
  sectionCounts,
  currentSectionIndex,
  fontClass,
  onCountSection,
  onSectionChange
}) => {
  const totalRequired = wird.sections.reduce((acc, s) => acc + s.count, 0);
  const currentTotal = wird.sections.reduce((acc, s) => acc + Math.min(s.count, sectionCounts[s.id] || 0), 0);
  const pct = totalRequired > 0 ? Math.round((currentTotal / totalRequired) * 100) : 0;

  const section = wird.sections[currentSectionIndex];
  const currentCount = section ? sectionCounts[section.id] || 0 : 0;
  const isDone = section ? currentCount >= section.count : false;

  return (
    <div className="space-y-5">
      {/* Overall Wird Progress bar */}
      <div className="p-3 bg-stone-100 dark:bg-stone-850 rounded-2xl">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="text-stone-700 dark:text-stone-300">
            تقدم إنجاز الورد: {currentTotal} / {totalRequired} تسبيحة
          </span>
          <span className="text-emerald-600 dark:text-emerald-400">{pct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Current Active Section Card */}
      {section && (
        <div className="p-5 rounded-3xl bg-gradient-to-b from-white to-emerald-50/30 dark:from-stone-850 dark:to-stone-900 border-2 border-emerald-500/30 shadow-md space-y-4 text-center">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-bold">
              الفقرة {currentSectionIndex + 1} من {wird.sections.length}
            </span>
            {section.instruction && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium">
                {section.instruction}
              </span>
            )}
          </div>

          {/* Arabic text of section */}
          <div className={`font-arabic text-stone-900 dark:text-stone-100 leading-loose ${fontClass}`}>
            {section.text}
          </div>

          {section.virtue && (
            <div className="text-xs text-stone-500 dark:text-stone-400 italic">
              💡 {section.virtue}
            </div>
          )}

          {/* Big Tap Counter Button */}
          <div className="pt-2 flex flex-col items-center justify-center">
            <button
              onClick={() => onCountSection(section)}
              disabled={isDone}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-150 transform active:scale-95 shadow-xl ${
                isDone
                  ? 'bg-emerald-600 text-white scale-100 shadow-emerald-600/30'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-400 shadow-emerald-700/40'
              }`}
            >
              {isDone ? (
                <>
                  <Check className="w-8 h-8 stroke-[3]" />
                  <span className="text-[11px] font-bold mt-1">مكتمل</span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-black">{currentCount}</span>
                  <span className="text-[10px] text-white/80 font-medium">
                    من {section.count}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Navigation between sections */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onSectionChange(Math.max(0, currentSectionIndex - 1))}
              disabled={currentSectionIndex === 0}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              السابقة
            </button>

            <div className="flex items-center gap-1">
              {wird.sections.map((sec, idx) => {
                const done = (sectionCounts[sec.id] || 0) >= sec.count;
                return (
                  <button
                    key={sec.id}
                    onClick={() => onSectionChange(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentSectionIndex
                        ? 'w-6 bg-emerald-600'
                        : done
                        ? 'bg-emerald-400'
                        : 'bg-stone-300 dark:bg-stone-700'
                    }`}
                  />
                );
              })}
            </div>

            <button
              onClick={() => onSectionChange(Math.min(wird.sections.length - 1, currentSectionIndex + 1))}
              disabled={currentSectionIndex === wird.sections.length - 1}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 disabled:opacity-30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              التالية
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
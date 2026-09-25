import React from 'react';

interface CustomizationOptionsProps {
  includeBenefit: boolean;
  onBenefitChange: (value: boolean) => void;
  includeReference: boolean;
  onReferenceChange: (value: boolean) => void;
  includeSignature: boolean;
  onSignatureChange: (value: boolean) => void;
}

/** خيارات التخصيص (الفضل / المصدر / التوقيع) للمشاركة النصية والبطاقة. */
export const CustomizationOptions: React.FC<CustomizationOptionsProps> = ({
  includeBenefit,
  onBenefitChange,
  includeReference,
  onReferenceChange,
  includeSignature,
  onSignatureChange
}) => {
  return (
    <div className="space-y-2 pt-1">
      <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
        خيارات التخصيص للمشاركة والنصوص:
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 cursor-pointer hover:bg-stone-100 transition-colors">
          <input
            type="checkbox"
            checked={includeBenefit}
            onChange={(e) => onBenefitChange(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
          />
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            تضمين الفضل
          </span>
        </label>

        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 cursor-pointer hover:bg-stone-100 transition-colors">
          <input
            type="checkbox"
            checked={includeReference}
            onChange={(e) => onReferenceChange(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
          />
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            تضمين المصدر
          </span>
        </label>

        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 cursor-pointer hover:bg-stone-100 transition-colors">
          <input
            type="checkbox"
            checked={includeSignature}
            onChange={(e) => onSignatureChange(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
          />
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            توقيع التطبيق
          </span>
        </label>
      </div>
    </div>
  );
};
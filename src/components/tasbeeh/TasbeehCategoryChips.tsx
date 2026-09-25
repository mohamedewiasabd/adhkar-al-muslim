import React from 'react';
import { TasbeehCategory } from '../../types';

export interface TasbeehCategoryTab {
  id: TasbeehCategory;
  label: string;
}

interface TasbeehCategoryChipsProps {
  categories: TasbeehCategoryTab[];
  active: TasbeehCategory;
  onChange: (category: TasbeehCategory) => void;
  variant?: 'default' | 'compact';
}

/** شرائح تصنيفات التسابيح — تُستخدم في الشريط العلوي وداخل فهرس المسبحة. */
export const TasbeehCategoryChips: React.FC<TasbeehCategoryChipsProps> = ({
  categories,
  active,
  onChange,
  variant = 'default'
}) => {
  const compact = variant === 'compact';
  const buttonClass = compact
    ? 'px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors'
    : 'px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all';

  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none ${compact ? 'text-xs' : ''}`}>
      {categories.map((cat) => {
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`${buttonClass} ${
              isActive
                ? compact
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/25'
                : compact
                ? 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300'
                : 'bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
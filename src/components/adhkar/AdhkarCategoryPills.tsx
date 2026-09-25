import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { DhikrCategory, DhikrItem } from '../../types';

export interface AdhkarCategoryInfo {
  id: DhikrCategory;
  label: string;
  icon: string;
}

interface AdhkarCategoryPillsProps {
  categories: AdhkarCategoryInfo[];
  activeCategory: DhikrCategory;
  adhkar: DhikrItem[];
  onSelect: (category: DhikrCategory) => void;
}

export const AdhkarCategoryPills: React.FC<AdhkarCategoryPillsProps> = ({
  categories,
  activeCategory,
  adhkar,
  onSelect
}) => (
  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
    {categories.map((cat) => {
      const isSelected = activeCategory === cat.id;
      const catAdhkar = adhkar.filter(a => a.category === cat.id);
      const isDone = catAdhkar.length > 0 && catAdhkar.every(a => a.currentCount >= a.count);
      return (
        <button
          key={cat.id}
          id={`cat-btn-${cat.id}`}
          onClick={() => onSelect(cat.id)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
            isSelected
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <span>{cat.icon}</span>
          <span>{cat.label}</span>
          {isDone && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 fill-emerald-500 inline" />
          )}
        </button>
      );
    })}
  </div>
);
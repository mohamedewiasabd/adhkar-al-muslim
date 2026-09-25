import React from 'react';
import { triggerHaptic } from '../../utils/audio';
import { AwradFilter, AWARD_FILTER_TABS, AwradFilterTab } from './awradFilters';

interface AwradFilterTabsProps {
  filters?: AwradFilterTab[];
  active: AwradFilter;
  favoritesCount: number;
  onSelect: (id: AwradFilter) => void;
}

export const AwradFilterTabs: React.FC<AwradFilterTabsProps> = ({
  filters = AWARD_FILTER_TABS,
  active,
  favoritesCount,
  onSelect
}) => (
  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
    {filters.map(filter => {
      const isActive = active === filter.id;
      const Icon = filter.icon;
      return (
        <button
          key={filter.id}
          onClick={() => {
            onSelect(filter.id);
            triggerHaptic(15);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            isActive
              ? 'bg-emerald-600 text-white shadow-sm scale-[1.02]'
              : 'bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
          }`}
        >
          {Icon && <Icon className="w-3.5 h-3.5" />}
          <span>{filter.label}</span>
          {filter.id === 'favorites' && favoritesCount > 0 && (
            <span className="text-[10px] bg-white/20 px-1 rounded-full">
              {favoritesCount}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
import React from 'react';
import { Search } from 'lucide-react';
import { HifzStatus } from '../../types';

interface HifzFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: 'all' | HifzStatus;
  onFilterStatus: (status: 'all' | HifzStatus) => void;
  counts: { all: number; memorized: number; memorizing: number };
}

export const HifzFilters: React.FC<HifzFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatus,
  counts
}) => (
  <div className="flex flex-col sm:flex-row gap-2.5">
    <div className="relative flex-1">
      <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="ابحث باسم السورة أو رقمها..."
        className="w-full pr-10 pl-3 py-2.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-xs focus:outline-none focus:border-emerald-500 text-stone-800 dark:text-stone-200"
      />
    </div>

    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => onFilterStatus('all')}
        className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
          filterStatus === 'all'
            ? 'bg-emerald-600 text-white'
            : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
        }`}
      >
        الكل ({counts.all})
      </button>
      <button
        onClick={() => onFilterStatus('memorized')}
        className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
          filterStatus === 'memorized'
            ? 'bg-emerald-600 text-white'
            : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
        }`}
      >
        محفوظة ({counts.memorized})
      </button>
      <button
        onClick={() => onFilterStatus('memorizing')}
        className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
          filterStatus === 'memorizing'
            ? 'bg-emerald-600 text-white'
            : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
        }`}
      >
        قيد الحفظ ({counts.memorizing})
      </button>
      <button
        onClick={() => onFilterStatus('not_started')}
        className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
          filterStatus === 'not_started'
            ? 'bg-emerald-600 text-white'
            : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
        }`}
      >
        لم تبدأ
      </button>
    </div>
  </div>
);
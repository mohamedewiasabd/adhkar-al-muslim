import React from 'react';
import { Heart } from 'lucide-react';

interface FavoritesToggleProps {
  active: boolean;
  count: number;
  onToggle: () => void;
}

export const FavoritesToggle: React.FC<FavoritesToggleProps> = ({ active, count, onToggle }) => (
  <button
    onClick={onToggle}
    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
      active
        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
    }`}
    title={active ? 'إظهار كل المحتوى' : 'عرض المفضلة فقط'}
  >
    <Heart className={`w-3.5 h-3.5 ${active ? 'fill-white' : 'text-rose-500'}`} />
    <span>المفضلة ({count})</span>
  </button>
);
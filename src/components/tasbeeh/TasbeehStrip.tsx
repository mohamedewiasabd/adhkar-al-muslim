import React from 'react';
import { Trash2 } from 'lucide-react';
import { TasbeehItem } from '../../types';

interface TasbeehStripProps {
  items: TasbeehItem[];
  selectedId: string;
  onSelect: (item: TasbeehItem) => void;
  onDelete: (id: string) => void;
}

/** الشريط الأفقي للتسابيح في التصنيف النشط مع خيار الحذف للمخصصة. */
export const TasbeehStrip: React.FC<TasbeehStripProps> = ({
  items,
  selectedId,
  onSelect,
  onDelete
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1.5 scrollbar-none">
      {items.map((preset) => {
        const isSelected = selectedId === preset.id;
        return (
          <div
            key={preset.id}
            className={`group relative flex items-center shrink-0 rounded-2xl border transition-all duration-150 ${
              isSelected
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700'
            }`}
          >
            <button
              onClick={() => onSelect(preset)}
              className="px-3.5 py-2 text-xs font-bold text-right flex items-center gap-2"
            >
              <span>{preset.title}</span>
              {preset.isCustom && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-emerald-700 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                }`}>
                  مخصص
                </span>
              )}
            </button>

            {preset.isCustom && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(preset.id);
                }}
                title="حذف هذا الذكر المخصص"
                className={`p-1.5 ml-1 rounded-lg transition-colors ${
                  isSelected
                    ? 'text-emerald-200 hover:text-white hover:bg-emerald-700'
                    : 'text-stone-400 hover:text-rose-600 hover:bg-stone-100 dark:hover:bg-stone-750'
                }`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
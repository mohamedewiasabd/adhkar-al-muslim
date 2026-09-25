import React from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { DhikrItem, DuaItem, ScholarWirdItem } from '../../types';
import { ShareTab } from './ShareTabs';

type Pickable = DhikrItem | DuaItem | ScholarWirdItem;

interface ItemPickerProps {
  activeTab: ShareTab;
  isOpen: boolean;
  onToggle: () => void;
  badgeText: string;
  snippetText: string;
  items: Pickable[];
  selectedId: string;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function itemSnippet(item: Pickable, activeTab: ShareTab): string {
  if (activeTab === 'dhikr') {
    return (item as DhikrItem).text;
  }
  if (activeTab === 'dua') {
    const d = item as DuaItem;
    return `${d.title}: ${d.arabic}`;
  }
  const w = item as ScholarWirdItem;
  return `${w.title} (${w.scholar})`;
}

/** قائمة النصوص القابلة للتصدير (أذكار/أدعية/أوراد) مع بحث داخلي. */
export const ItemPicker: React.FC<ItemPickerProps> = ({
  activeTab,
  isOpen,
  onToggle,
  badgeText,
  snippetText,
  items,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange
}) => {
  return (
    <div>
      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
        اختر النص المراد تصديره أو مشاركته:
      </label>

      <div className="relative">
        <button
          id="btn-open-item-picker"
          onClick={onToggle}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-right text-stone-800 dark:text-stone-200 hover:border-emerald-500 transition-colors cursor-pointer"
        >
          <div className="flex-1 truncate pl-2">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-1.5">
              [{badgeText}]
            </span>
            <span>{snippetText}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 left-0 mt-1.5 z-20 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 p-2 max-h-56 overflow-y-auto">
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="بحث في النصوص..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 rounded-xl text-xs bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              {items.map((item) => {
                const isSelected = item.id === selectedId;
                const textSnippet = itemSnippet(item, activeTab);
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`w-full text-right p-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span className="truncate flex-1">{textSnippet}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}

              {items.length === 0 && (
                <p className="text-center text-xs text-stone-400 py-3">
                  لا توجد نتائج مطابقة
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
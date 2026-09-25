import React from 'react';
import { BookOpen, CheckCircle2, Plus, Search, X } from 'lucide-react';
import { TasbeehCategory, TasbeehItem } from '../../types';
import { TasbeehCategoryChips, TasbeehCategoryTab } from './TasbeehCategoryChips';

interface CatalogModalProps {
  open: boolean;
  allCount: number;
  items: TasbeehItem[];
  categories: TasbeehCategoryTab[];
  activeCategory: TasbeehCategory;
  onCategoryChange: (category: TasbeehCategory) => void;
  search: string;
  onSearchChange: (query: string) => void;
  selectedId: string;
  onSelect: (item: TasbeehItem) => void;
  onAddNew: () => void;
  onClose: () => void;
}

/** فهرس المسبحة الكامل مع البحث والتصنيف وفضائل كل تسبيح. */
export const CatalogModal: React.FC<CatalogModalProps> = ({
  open,
  allCount,
  items,
  categories,
  activeCategory,
  onCategoryChange,
  search,
  onSearchChange,
  selectedId,
  onSelect,
  onAddNew,
  onClose
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white dark:bg-stone-900 w-full max-w-xl max-h-[85vh] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Catalog Modal Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              فهرس تسابيح المسبحة المعروفة ({allCount})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Filter inside Catalog */}
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 shrink-0 space-y-2.5">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث في نصوص التسابيح وفضائلها (مثال: استغفار، زبد البحر، نخلة...)"
              className="w-full px-9 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              autoFocus
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute left-3 top-2.5 text-xs text-stone-400 hover:text-stone-600 px-1"
              >
                مسح
              </button>
            )}
          </div>

          {/* Categories chips in catalog */}
          <TasbeehCategoryChips
            categories={categories}
            active={activeCategory}
            onChange={onCategoryChange}
            variant="compact"
          />
        </div>

        {/* Catalog List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {items.length === 0 ? (
            <div className="text-center py-10 text-stone-400 dark:text-stone-500 text-xs">
              لا توجد نتائج مطابقة لبحثك
            </div>
          ) : (
            items.map((t) => {
              const isCurrent = selectedId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => onSelect(t)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600'
                      : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-amiri font-bold text-lg text-stone-900 dark:text-stone-100">
                          {t.title}
                        </span>
                        {t.isCustom && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold">
                            مخصص
                          </span>
                        )}
                      </div>

                      {t.fadl && (
                        <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                          ✨ {t.fadl}
                        </p>
                      )}

                      {t.reference && (
                        <span className="block text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                          📖 المصدر: {t.reference}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-xs font-bold px-2 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {t.count === 'infinity' ? 'مفتوح ∞' : `${t.count} مرة`}
                      </span>

                      {isCurrent ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>محدد حالياً</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          اختر للمسبحة ←
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Catalog Modal Footer */}
        <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            إجمالي التسابيح المتوفرة: {allCount}
          </span>
          <button
            onClick={onAddNew}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة تسبيح جديد</span>
          </button>
        </div>
      </div>
    </div>
  );
};
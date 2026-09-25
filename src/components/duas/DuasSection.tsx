import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { duaCategories } from '../../data/duasData';
import { DuaItem } from '../../types';
import { DuaActions } from './DuaActions';
import { FavoritesToggle } from './FavoritesToggle';

interface DuasSectionProps {
  items: DuaItem[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  showOnlyFavorites: boolean;
  favoritesCount: number;
  favoriteIds: string[];
  copiedId: string | null;
  speakingId: string | null;
  fontClass: string;
  onSpeak: (id: string, text: string, times?: number) => void;
  onCopyItem: (item: DuaItem) => void;
  onImage: (item: DuaItem) => void;
  onShare: (item: DuaItem) => void;
  onToggleFavorite: (id: string) => void;
  onToggleFavoritesOnly: () => void;
}

export const DuasSection: React.FC<DuasSectionProps> = ({
  items,
  selectedCategory,
  onSelectCategory,
  showOnlyFavorites,
  favoritesCount,
  favoriteIds,
  copiedId,
  speakingId,
  fontClass,
  onSpeak,
  onCopyItem,
  onImage,
  onShare,
  onToggleFavorite,
  onToggleFavoritesOnly
}) => (
  <>
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-3 scrollbar-none">
      {duaCategories.map((cat) => {
        const isSelected = !showOnlyFavorites && selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
      <FavoritesToggle active={showOnlyFavorites} count={favoritesCount} onToggle={onToggleFavoritesOnly} />
    </div>

    <div className="mt-4 space-y-3.5">
      {items.map((dua) => (
        <div
          key={dua.id}
          className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                {dua.title}
              </h3>
            </div>
            <DuaActions
              isFavorite={favoriteIds.includes(dua.id)}
              isCopied={copiedId === dua.id}
              isSpeaking={speakingId === dua.id}
              onSpeak={() => onSpeak(dua.id, dua.arabic)}
              onImage={() => onImage(dua)}
              onShare={() => onShare(dua)}
              onCopy={() => onCopyItem(dua)}
              onToggleFavorite={() => onToggleFavorite(dua.id)}
            />
          </div>

          <p className={`font-amiri font-bold text-stone-900 dark:text-stone-100 text-center select-text py-3 leading-relaxed ${fontClass}`}>
            {dua.arabic}
          </p>

          <div className="mt-2 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex flex-col gap-1 text-xs">
            {dua.benefit && (
              <div className="flex items-start gap-1 text-stone-600 dark:text-stone-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{dua.benefit}</span>
              </div>
            )}
            <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">
              {dua.reference}
            </span>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-12 text-stone-400 dark:text-stone-500 text-sm">
          {showOnlyFavorites ? 'لم تقم بإضافة أي دعاء إلى المفضلة بعد' : 'لا توجد أدعية تطابق البحث'}
        </div>
      )}
    </div>
  </>
);
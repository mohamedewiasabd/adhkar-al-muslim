import React from 'react';
import { ScrollText, Sparkles } from 'lucide-react';
import { ruqyaGuidance, ruqyaPhaseLabels } from '../../data/ruqyaData';
import { DuaItem, RuqyaItem } from '../../types';
import { DuaActions } from './DuaActions';
import { FavoritesToggle } from './FavoritesToggle';

interface RuqyaSectionProps {
  items: RuqyaItem[];
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

const toDua = (r: RuqyaItem): DuaItem => ({
  id: r.id,
  title: r.title,
  arabic: r.arabic,
  reference: r.reference,
  category: 'ruqyah',
  benefit: r.note
});

const phases: (keyof typeof ruqyaPhaseLabels)[] = ['opening', 'quran', 'prophetic', 'closing'];

export const RuqyaSection: React.FC<RuqyaSectionProps> = ({
  items,
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
    <div className="mt-3 p-4 rounded-3xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-800/50">
      <div className="flex items-center gap-2 mb-2">
        <ScrollText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        <h3 className="font-bold text-sm text-sky-900 dark:text-sky-100">آداب الرقية قبل البدء</h3>
      </div>
      <div className="space-y-2">
        {ruqyaGuidance.map((g) => (
          <div key={g.id}>
            <p className="text-[11px] font-bold text-sky-800/90 dark:text-sky-200/90">• {g.title}</p>
            <p className="text-[11px] leading-relaxed text-sky-700/80 dark:text-sky-300/70">{g.text}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-3 scrollbar-none">
      <FavoritesToggle active={showOnlyFavorites} count={favoritesCount} onToggle={onToggleFavoritesOnly} />
    </div>

    <div className="mt-4 space-y-4">
      {phases.map((phase) => {
        const phaseItems = items.filter((r) => r.phase === phase);
        if (phaseItems.length === 0) return null;
        return (
          <div key={phase}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <h4 className="font-bold text-xs text-sky-700 dark:text-sky-300">{ruqyaPhaseLabels[phase]}</h4>
            </div>
            <div className="space-y-3">
              {phaseItems.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs font-bold">{r.order}</span>
                      <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">{r.title}</h3>
                    </div>
                    <DuaActions
                      isFavorite={favoriteIds.includes(r.id)}
                      isCopied={copiedId === r.id}
                      isSpeaking={speakingId === r.id}
                      onSpeak={() => onSpeak(r.id, `${r.title}. ${r.arabic}`, r.repetition)}
                      onImage={() => onImage(toDua(r))}
                      onShare={() => onShare(toDua(r))}
                      onCopy={() => onCopyItem(toDua(r))}
                      onToggleFavorite={() => onToggleFavorite(r.id)}
                    />
                  </div>

                  <p className={`font-amiri font-bold text-stone-900 dark:text-stone-100 text-center select-text py-3 leading-relaxed ${fontClass}`}>
                    {r.arabic}
                  </p>

                  <div className="mt-2 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-[11px] font-bold">
                        تُكرر {r.repetition} {r.repetition === 1 ? 'مرة' : 'مرات'}
                      </span>
                      {r.note && (
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          {r.note}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">{r.reference}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {items.length === 0 && (
        <div className="text-center py-12 text-stone-400 dark:text-stone-500 text-sm">
          {showOnlyFavorites ? 'لم تضف أي محتوى رقية إلى المفضلة بعد' : 'لا يوجد ما يطابق البحث'}
        </div>
      )}
    </div>
  </>
);
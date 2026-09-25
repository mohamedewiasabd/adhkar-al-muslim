import React from 'react';
import { Repeat, Sparkles, SunMoon, Volume2, VolumeX } from 'lucide-react';
import { asmaHadithReference, getDailyNameOfAllah, getDailyWirdNames } from '../../data/asmaAlHusna';
import { AsmaAlHusnaItem, DuaItem } from '../../types';
import { DuaActions } from './DuaActions';
import { FavoritesToggle } from './FavoritesToggle';

interface AsmaSectionProps {
  items: AsmaAlHusnaItem[];
  showOnlyFavorites: boolean;
  favoritesCount: number;
  favoriteIds: string[];
  copiedId: string | null;
  speakingId: string | null;
  onSpeak: (id: string, text: string, times?: number) => void;
  onCopyItem: (item: DuaItem) => void;
  onImage: (item: DuaItem) => void;
  onShare: (item: DuaItem) => void;
  onToggleFavorite: (id: string) => void;
  onToggleFavoritesOnly: () => void;
}

const toDua = (a: AsmaAlHusnaItem): DuaItem => ({
  id: a.id,
  title: a.name,
  arabic: a.name,
  reference: a.reference,
  category: 'quranic',
  benefit: a.fadl
});

export const AsmaSection: React.FC<AsmaSectionProps> = ({
  items,
  showOnlyFavorites,
  favoritesCount,
  favoriteIds,
  copiedId,
  speakingId,
  onSpeak,
  onCopyItem,
  onImage,
  onShare,
  onToggleFavorite,
  onToggleFavoritesOnly
}) => {
  const dailyName = getDailyNameOfAllah();
  const dailyWird = getDailyWirdNames(3);

  return (
    <>
      <div className="mt-3 p-4 rounded-3xl bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-amber-950/40 dark:to-emerald-950/40 border border-amber-200/70 dark:border-amber-800/50">
        <div className="flex items-center gap-2 mb-1.5">
          <SunMoon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h3 className="font-bold text-sm text-amber-900 dark:text-amber-100">
            تسعة وتسعون اسماً، من أحصاها دخل الجنة
          </h3>
        </div>
        <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-200/80">{asmaHadithReference}</p>
      </div>

      <div className="mt-3 p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-emerald-600 text-white shadow-lg shadow-amber-600/20">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[11px] font-bold uppercase tracking-wide opacity-90">اسم اليوم</h3>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">{dailyName.number}</span>
        </div>
        <p className="font-amiri font-bold text-4xl text-center my-3 leading-tight">{dailyName.name}</p>
        <p className="text-sm text-center leading-relaxed text-white/95 font-amiri">{dailyName.meaning}</p>
        <p className="mt-2 text-xs text-center text-amber-50/80">﴿ {dailyName.reference} ﴾</p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            onClick={() => onSpeak(`daily-${dailyName.id}`, `${dailyName.name}. ${dailyName.meaning}`)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              speakingId === `daily-${dailyName.id}`
                ? 'bg-white text-rose-600'
                : 'bg-white/20 hover:bg-white/30 backdrop-blur'
            }`}
          >
            {speakingId === `daily-${dailyName.id}` ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{speakingId === `daily-${dailyName.id}` ? 'إيقاف' : 'استمع'}</span>
          </button>
          <DuaActions
            isFavorite={favoriteIds.includes(dailyName.id)}
            isCopied={copiedId === dailyName.id}
            isSpeaking={speakingId === dailyName.id}
            onSpeak={() => onSpeak(dailyName.id, `${dailyName.name}. ${dailyName.meaning}`)}
            onImage={() => onImage(toDua(dailyName))}
            onShare={() => onShare(toDua(dailyName))}
            onCopy={() => onCopyItem(toDua(dailyName))}
            onToggleFavorite={() => onToggleFavorite(dailyName.id)}
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Repeat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <h4 className="font-bold text-xs text-amber-800 dark:text-amber-200">وِرد اليوم — تذكّرها واستمع إليها</h4>
        </div>
        <div className="space-y-2">
          {dailyWird.map((n) => (
            <button
              key={n.id}
              onClick={() => onSpeak(`wird-${n.id}`, `${n.name}. ${n.meaning}`)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-100 font-amiri">
                <span className="text-[10px] text-amber-500">{n.number}</span>
                {n.name}
              </span>
              <Volume2 className="w-4 h-4 text-amber-500" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-3 scrollbar-none">
        <FavoritesToggle active={showOnlyFavorites} count={favoritesCount} onToggle={onToggleFavoritesOnly} />
      </div>

      <div className="mt-4 space-y-3">
        {items.map((a) => (
          <div
            key={a.id}
            className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold">{a.number}</span>
                <h3 className="font-bold text-lg text-amber-900 dark:text-amber-100">{a.name}</h3>
              </div>
              <DuaActions
                isFavorite={favoriteIds.includes(a.id)}
                isCopied={copiedId === a.id}
                isSpeaking={speakingId === a.id}
                onSpeak={() => onSpeak(a.id, `${a.name}. ${a.meaning}`)}
                onImage={() => onImage(toDua(a))}
                onShare={() => onShare(toDua(a))}
                onCopy={() => onCopyItem(toDua(a))}
                onToggleFavorite={() => onToggleFavorite(a.id)}
              />
            </div>

            <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-200 font-amiri">{a.meaning}</p>
            <p className="mt-2 text-xs leading-relaxed text-stone-600 dark:text-stone-300 flex items-start gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>{a.fadl}</span>
            </p>
            <span className="mt-2 inline-block text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {a.reference}
            </span>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-12 text-stone-400 dark:text-stone-500 text-sm">
            {showOnlyFavorites ? 'لم تضف أي اسم إلى المفضلة بعد' : 'لا يوجد اسم يطابق البحث'}
          </div>
        )}
      </div>
    </>
  );
};
import React from 'react';
import { Sparkles, BookOpen, ScrollText } from 'lucide-react';

export type ShareTab = 'dhikr' | 'dua' | 'wird' | 'quran';

interface ShareTabsProps {
  activeTab: ShareTab;
  onTabChange: (tab: ShareTab) => void;
  adhkarCount: number;
  duasCount: number;
  awradCount: number;
}

export const ShareTabs: React.FC<ShareTabsProps> = ({
  activeTab,
  onTabChange,
  adhkarCount,
  duasCount,
  awradCount
}) => {
  const base =
    'flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer';
  const active =
    'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-sm';
  const inactive = 'text-stone-600 dark:text-stone-400 hover:text-stone-900';

  return (
    <div className="flex p-1 rounded-2xl bg-stone-100 dark:bg-stone-800/80 gap-1">
      <button
        id="tab-share-dhikr"
        onClick={() => onTabChange('dhikr')}
        className={`${base} ${activeTab === 'dhikr' ? active : inactive}`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>الأذكار ({adhkarCount})</span>
      </button>

      <button
        id="tab-share-dua"
        onClick={() => onTabChange('dua')}
        className={`${base} ${activeTab === 'dua' ? active : inactive}`}
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>الأدعية ({duasCount})</span>
      </button>

      <button
        id="tab-share-wird"
        onClick={() => onTabChange('wird')}
        className={`${base} ${activeTab === 'wird' ? active : inactive}`}
      >
        <ScrollText className="w-3.5 h-3.5" />
        <span>الأوراد ({awradCount})</span>
      </button>

      <button
        id="tab-share-quran"
        onClick={() => onTabChange('quran')}
        className={`${base} ${activeTab === 'quran' ? active : inactive}`}
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>الآيات</span>
      </button>
    </div>
  );
};
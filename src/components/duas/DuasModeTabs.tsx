import React from 'react';
import { BookOpen, SunMoon, ShieldCheck } from 'lucide-react';

export type SectionMode = 'duas' | 'asma' | 'ruqya';

interface DuasModeTabsProps {
  mode: SectionMode;
  onSwitch: (next: SectionMode) => void;
}

export const DuasModeTabs: React.FC<DuasModeTabsProps> = ({ mode, onSwitch }) => (
  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
    <button
      onClick={() => onSwitch('duas')}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
        mode === 'duas'
          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
      }`}
    >
      <BookOpen className="w-3.5 h-3.5" />
      <span>الأدعية</span>
    </button>
    <button
      onClick={() => onSwitch('asma')}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
        mode === 'asma'
          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
      }`}
    >
      <SunMoon className="w-3.5 h-3.5" />
      <span>أسماء الله</span>
    </button>
    <button
      onClick={() => onSwitch('ruqya')}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
        mode === 'ruqya'
          ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
      }`}
    >
      <ShieldCheck className="w-3.5 h-3.5" />
      <span>الرقية الشرعية</span>
    </button>
  </div>
);
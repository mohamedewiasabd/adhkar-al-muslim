import React from 'react';
import { BookOpen, ListFilter, CalendarCheck, Award } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';

export type QuranSubTab = 'read' | 'index' | 'wird' | 'hifz';

interface QuranSubTabsProps {
  subTab: QuranSubTab;
  onChange: (tab: QuranSubTab) => void;
}

/** شريط التنقل الفرعي لقسم القرآن: المصحف / الفهرس / الورد اليومي / متابعة الحفظ. */
export const QuranSubTabs: React.FC<QuranSubTabsProps> = ({ subTab, onChange }) => {
  const tabs: { id: QuranSubTab; label: string; icon: React.ReactNode }[] = [
    { id: 'read', label: 'المصحف', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'index', label: 'الفهرس', icon: <ListFilter className="w-3.5 h-3.5" /> },
    { id: 'wird', label: 'الورد اليومي', icon: <CalendarCheck className="w-3.5 h-3.5" /> },
    { id: 'hifz', label: 'متابعة الحفظ', icon: <Award className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="sticky top-[68px] z-30 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-md pt-1 pb-2">
      <div className="flex items-center justify-between gap-1 p-1 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
        {tabs.map((tab) => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic(15);
                onChange(tab.id);
              }}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
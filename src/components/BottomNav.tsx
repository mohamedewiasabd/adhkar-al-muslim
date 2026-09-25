import React from 'react';
import { BookOpen, Disc3, CalendarCheck, HeartHandshake, Trophy, BookMarked, Clock } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  wirdPendingCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  wirdPendingCount = 0
}) => {
  const tabs = [
    { id: 'adhkar' as ActiveTab, label: 'الأذكار', icon: BookOpen },
    { id: 'prayer' as ActiveTab, label: 'مواقيت', icon: Clock },
    { id: 'quran' as ActiveTab, label: 'المصحف', icon: BookMarked },
    { id: 'tasbeeh' as ActiveTab, label: 'المسبحة', icon: Disc3 },
    { id: 'wird' as ActiveTab, label: 'الورد اليومي', icon: CalendarCheck, badge: wirdPendingCount },
    { id: 'duas' as ActiveTab, label: 'الأدعية', icon: HeartHandshake },
    { id: 'stats' as ActiveTab, label: 'الإنجاز', icon: Trophy },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-lg border-t border-stone-200 dark:border-stone-800 pb-safe transition-colors">
      <div className="max-w-2xl mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onChangeTab(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {Boolean(tab.badge && tab.badge > 0) && (
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.2 text-[10px] font-bold text-white bg-emerald-600 rounded-full shadow-sm">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-1 tracking-tight">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-5 h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

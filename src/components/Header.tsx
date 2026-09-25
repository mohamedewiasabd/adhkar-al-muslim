import React from 'react';
import { Bell, Moon, Sun, Flame, Sparkles, Share2, Calendar } from 'lucide-react';
import { getFormattedDates } from '../utils/storage';

interface HeaderProps {
  streak: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenReminders: () => void;
  onOpenShare: () => void;
  fontSize: 'small' | 'medium' | 'large';
  onChangeFontSize: (size: 'small' | 'medium' | 'large') => void;
  hasActiveReminders: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  streak,
  isDarkMode,
  onToggleDarkMode,
  onOpenReminders,
  onOpenShare,
  fontSize,
  onChangeFontSize,
  hasActiveReminders
}) => {
  const { hijri, gregorian, weekday } = getFormattedDates();

  const cycleFontSize = () => {
    if (fontSize === 'small') onChangeFontSize('medium');
    else if (fontSize === 'medium') onChangeFontSize('large');
    else onChangeFontSize('small');
  };

  const getStreakLabel = (count: number) => {
    if (count === 1) return 'يوم';
    if (count === 2) return 'يومان';
    if (count >= 3 && count <= 10) return 'أيام';
    return 'يوماً';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors shadow-xs" dir="rtl">
      {/* Top Primary Bar */}
      <div className="max-w-2xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-2.5">
          {/* Brand & Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-50 leading-tight truncate font-cairo">
                  أذكار المسلم
                </h1>
                <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                  الورد اليومي
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium truncate sm:hidden">
                حصن المسلم والورد اليومي
              </p>
            </div>
          </div>

          {/* Quick Actions & Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Streak Counter Pill */}
            <div 
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-bold"
              title={`سلسلة المداومة المتواصلة: ${streak} ${getStreakLabel(streak)}`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span className="font-bold">{streak}</span>
              <span className="hidden sm:inline text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                {getStreakLabel(streak)}
              </span>
            </div>

            {/* Font Size Selector */}
            <button
              onClick={cycleFontSize}
              id="btn-font-size-toggle"
              aria-label="تغيير حجم خط الأذكار"
              className="w-9 h-9 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              title={`حجم الخط: ${fontSize === 'small' ? 'صغير' : fontSize === 'medium' ? 'متوسط' : 'كبير'}`}
            >
              <span className="font-amiri font-bold text-sm">
                {fontSize === 'small' ? 'أ-' : fontSize === 'medium' ? 'أ' : 'أ+'}
              </span>
            </button>

            {/* Notification / Reminders Toggle */}
            <button
              onClick={onOpenReminders}
              id="btn-open-reminders"
              aria-label="إعدادات التنبيه التلقائي"
              className="relative w-9 h-9 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer"
              title="التنبيه التلقائي بالأذكار"
            >
              <Bell className="w-4 h-4" />
              {hasActiveReminders && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900" />
              )}
            </button>

            {/* Share Card Generator */}
            <button
              onClick={onOpenShare}
              id="btn-open-share"
              aria-label="مشاركة بطاقات الأذكار"
              className="w-9 h-9 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-800 flex items-center justify-center transition-colors cursor-pointer"
              title="مشاركة بطاقات الأذكار والأدعية"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              id="btn-toggle-darkmode"
              aria-label="تبديل مظهر التطبيق (ليلي / نهاري)"
              className="w-9 h-9 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer"
              title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي لراحة العين'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Date & Spiritual Sub-Bar */}
      <div className="border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/80 dark:bg-stone-900/60 px-4 py-1.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-[11px] font-medium text-stone-600 dark:text-stone-300">
          {/* Hijri Date Display */}
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 text-xs select-none">🌙</span>
            <span className="font-bold text-stone-800 dark:text-stone-200">
              {hijri}
            </span>
          </div>

          {/* Gregorian Date & Spiritual Encouragement */}
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50">
              <span>﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-stone-400" />
              <span>{weekday ? `${weekday}، ${gregorian}` : gregorian}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

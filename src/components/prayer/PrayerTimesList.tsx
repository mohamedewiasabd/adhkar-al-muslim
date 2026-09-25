import React from 'react';
import { Clock, MoonStar, Sparkles, Sun, Sunrise } from 'lucide-react';
import { PRAYER_ARABIC, PrayerName } from '../../utils/prayerTimes';
import { DailyPrayerTimes, NextPrayer } from '../../utils/prayer/types';

interface PrayerTimesListProps {
  times: DailyPrayerTimes;
  next: NextPrayer;
  now: Date;
}

const rowLabel = (name: string) => {
  if (name === 'sunrise') return 'الشروق';
  if (name === 'lastThird') return 'قيام الليل';
  if (name === 'owabin') return 'الأوابين';
  return PRAYER_ARABIC[name as PrayerName] || name;
};

export const PrayerTimesList: React.FC<PrayerTimesListProps> = ({ times, next, now }) => {
  const prayerRows: { name: string; time: string; icon: React.ReactNode; note?: string }[] = [
    { name: 'fajr', time: times.fajr, icon: <Sunrise className="w-5 h-5" /> },
    { name: 'sunrise', time: times.sunrise, icon: <Sun className="w-5 h-5" />, note: 'الشروق — خروج وقت الفجر' },
    { name: 'owabin', time: times.owabin, icon: <Sparkles className="w-5 h-5" />, note: 'صلاة الأوابين قبل الظهر بساعة' },
    { name: 'dhuhr', time: times.dhuhr, icon: <Sun className="w-5 h-5" /> },
    { name: 'asr', time: times.asr, icon: <Clock className="w-5 h-5" /> },
    { name: 'maghrib', time: times.maghrib, icon: <MoonStar className="w-5 h-5" /> },
    { name: 'isha', time: times.isha, icon: <MoonStar className="w-5 h-5" /> },
    { name: 'lastThird', time: times.lastThird, icon: <MoonStar className="w-5 h-5" />, note: 'بداية الثلث الأخير من الليل — قيام الليل' },
  ];

  const isNext = (name: string) => next.name === name;

  return (
    <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
        <h2 className="font-bold text-stone-800 dark:text-stone-100">مواقيت اليوم</h2>
        <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
          {now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>
      <div className="divide-y divide-stone-100 dark:divide-stone-800">
        {prayerRows.map(row => (
          <div
            key={row.name}
            className={`flex items-center justify-between px-4 py-3 transition-colors ${isNext(row.name) ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${isNext(row.name) ? 'bg-emerald-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-300'}`}>
                {row.icon}
              </span>
              <div>
                <div className="font-semibold text-stone-800 dark:text-stone-100">{rowLabel(row.name)}</div>
                {row.note && <div className="text-[11px] text-stone-500 dark:text-stone-400">{row.note}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tabular-nums text-stone-800 dark:text-stone-100">{row.time}</span>
              {isNext(row.name) && (
                <span className="text-[10px] font-bold bg-emerald-600 text-white rounded-full px-2 py-0.5">القادمة</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
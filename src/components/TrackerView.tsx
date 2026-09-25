import React from 'react';
import { Flame, Trophy, Award, Sparkles, CheckCircle2, TrendingUp, Calendar, HeartHandshake, ShieldCheck, SunMedium, Crown, LayoutGrid, ChevronLeft, Gauge } from 'lucide-react';
import { Achievement, DailyHistoryRecord } from '../types';
import { isAndroidPlatform } from '../utils/platform';

interface TrackerViewProps {
  streak: number;
  totalTasbeeh: number;
  todayTasbeeh: number;
  wirdCompletionRate: number;
  morningDone: boolean;
  eveningDone: boolean;
  achievements: Achievement[];
  history: DailyHistoryRecord[];
  onOpenOurApps: () => void;
  onOpenWidgets: () => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({
  streak,
  totalTasbeeh,
  todayTasbeeh,
  wirdCompletionRate,
  morningDone,
  eveningDone,
  achievements,
  history,
  onOpenOurApps,
  onOpenWidgets
}) => {
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-emerald-500" />;
      case 'SunMedium': return <SunMedium className="w-5 h-5 text-amber-500" />;
      case 'Crown': return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'Flame': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-teal-500" />;
      default: return <Trophy className="w-5 h-5 text-amber-500" />;
    }
  };

  // Generate 7 days labels (today and previous 6 days)
  const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dayName = daysOfWeek[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];
    const rec = history.find(h => h.date === dateStr);
    const isToday = i === 6;
    return {
      name: dayName,
      date: dateStr,
      isToday,
      percentage: isToday ? wirdCompletionRate : (rec ? rec.wirdCompletionRate : (streak > 6 - i ? 85 : 0))
    };
  });

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  return (
    <div className="pb-24 pt-3 max-w-2xl mx-auto px-4">
      {/* Streak Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold w-fit mb-2">
              <Flame className="w-4 h-4 fill-white" />
              <span>سلسلة الالتزام والذكر</span>
            </div>
            <h2 className="text-2xl font-black">
              {streak} {streak === 1 ? 'يوم' : streak === 2 ? 'يومان' : 'أيام متتالية'}
            </h2>
            <p className="text-xs text-white/90 mt-1 font-medium">
              {streak >= 7
                ? 'ما شاء الله! همة عالية ومداومة مباركة على ذكر الله'
                : streak >= 3
                ? 'استمر، فثباتك على الذكر يزرع في قلبك السكينة'
                : 'بداية مباركة، حافظ على وردك اليومي لترتفع سلسلتك'}
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Trophy className="w-8 h-8 text-amber-100" />
          </div>
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold block mb-1">
            تسبيحات اليوم
          </span>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {todayTasbeeh}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>من مجموع {totalTasbeeh} تسبيحة</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold block mb-1">
            إنجاز الورد اليومي
          </span>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {wirdCompletionRate}%
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-2 font-medium">
            <span className={morningDone ? 'text-emerald-600 font-bold' : ''}>
              الصباح {morningDone ? '✓' : '—'}
            </span>
            <span>•</span>
            <span className={eveningDone ? 'text-emerald-600 font-bold' : ''}>
              المساء {eveningDone ? '✓' : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Activity Progress Bar Chart */}
      <div className="mt-4 p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
              نشاطك خلال آخر 7 أيام
            </h3>
          </div>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold">
            نسبة الورد اليومي
          </span>
        </div>

        {/* 7 Bars Column Display */}
        <div className="flex items-end justify-between h-36 pt-4 pb-1 px-2">
          {last7Days.map((d, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 flex-1">
              <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                {d.percentage}%
              </span>
              <div className="w-6 sm:w-8 h-24 bg-stone-100 dark:bg-stone-800 rounded-xl overflow-hidden flex flex-col justify-end p-0.5">
                <div
                  className={`w-full rounded-lg transition-all duration-500 ${
                    d.isToday
                      ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                      : d.percentage > 0
                      ? 'bg-gradient-to-t from-emerald-500/70 to-emerald-400/60'
                      : 'bg-transparent'
                  }`}
                  style={{ height: `${Math.max(6, d.percentage)}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${
                d.isToday
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-stone-500 dark:text-stone-400'
              }`}>
                {d.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones & Badges Showcase */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
              الأوسمة والإنجازات
            </h3>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            {unlockedCount} من {achievements.length} أوسمة
          </span>
        </div>

        <div className="space-y-2.5">
          {achievements.map((ach) => {
            const isUnlocked = Boolean(ach.unlockedAt);
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  isUnlocked
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/60 dark:border-amber-800/50'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                    isUnlocked
                      ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                  }`}>
                    {getBadgeIcon(ach.icon)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {ach.title}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {ach.description}
                    </p>
                  </div>
                </div>

                <div>
                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>مكتمل</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500">
                      قيد الإنجاز
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Widgets — ودجات عائمة (أندرويد فقط) */}
      {isAndroidPlatform && (
        <button
          onClick={onOpenWidgets}
          className="mt-3 w-full flex items-center justify-between gap-3 p-4 rounded-3xl bg-gradient-to-r from-sky-600 to-teal-500 text-white shadow-md shadow-sky-600/20 transition-transform active:scale-[0.99] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Gauge className="w-5 h-5" />
            </div>
            <div className="text-right">
              <h3 className="font-bold text-sm">الودجات العائمة</h3>
              <p className="text-[11px] text-white/85">سبحة، أذكار، أدعية وأوراد فوق كل الشاشات</p>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 opacity-90 shrink-0" />
        </button>
      )}

      {/* Our Apps — رابط فتح تطبيقات أندرويد (أندرويد فقط) */}
      {isAndroidPlatform && (
        <button
          onClick={onOpenOurApps}
          className="mt-3 w-full flex items-center justify-between gap-3 p-4 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20 transition-transform active:scale-[0.99] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div className="text-right">
              <h3 className="font-bold text-sm">تطبيقاتنا</h3>
              <p className="text-[11px] text-white/85">تطبيقات أخرى من فريق أذكار المسلم</p>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 opacity-90 shrink-0" />
        </button>
      )}
    </div>
  );
};

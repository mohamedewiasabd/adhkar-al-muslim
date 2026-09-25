import React, { useMemo } from 'react';
import { QuranBookmark, QuranReadingWirdGoal } from '../types';
import { surahsList } from '../data/quranMeta';
import { triggerHaptic } from '../utils/audio';
import { QuranDailyGoalCard } from './quranWird/QuranDailyGoalCard';
import { KhatmahProgressCard } from './quranWird/KhatmahProgressCard';
import { ReadingStopCard } from './quranWird/ReadingStopCard';
import { WirdPlansCard } from './quranWird/WirdPlansCard';

interface QuranWirdTrackerProps {
  wirdGoal: QuranReadingWirdGoal;
  onUpdateGoal: (newGoal: QuranReadingWirdGoal) => void;
  bookmark: QuranBookmark | null;
  onJumpToBookmark: () => void;
  onSelectSurah: (surahNumber: number) => void;
}

export const QuranWirdTracker: React.FC<QuranWirdTrackerProps> = ({
  wirdGoal,
  onUpdateGoal,
  bookmark,
  onJumpToBookmark,
  onSelectSurah
}) => {
  const totalPagesInQuran = 604;
  const currentPage = wirdGoal.lastReadPage || 1;
  const progressPercent = Math.min(100, Math.round((currentPage / totalPagesInQuran) * 100));
  const dailyProgressPercent = Math.min(100, Math.round((wirdGoal.currentDayPagesRead / wirdGoal.dailyPagesTarget) * 100));

  const currentSurahMeta = useMemo(() => {
    return surahsList.find(s => s.number === wirdGoal.lastReadSurah) || surahsList[0];
  }, [wirdGoal.lastReadSurah]);

  const handleAddPageRead = (count: number = 1) => {
    triggerHaptic(20);
    const newCurrentDayPages = Math.max(0, wirdGoal.currentDayPagesRead + count);
    const newPage = Math.min(604, Math.max(1, (wirdGoal.lastReadPage || 1) + count));

    const foundSurah = [...surahsList].reverse().find(s => s.pageStart <= newPage) || surahsList[0];

    onUpdateGoal({
      ...wirdGoal,
      currentDayPagesRead: newCurrentDayPages,
      lastReadPage: newPage,
      lastReadSurah: foundSurah.number
    });
  };

  const handleResetKhatmah = () => {
    if (window.confirm('هل تود تسجيل إتمام هذه الختمة وبدء ختمة جديدة بحمد الله؟')) {
      triggerHaptic(35);
      onUpdateGoal({
        ...wirdGoal,
        lastReadPage: 1,
        lastReadSurah: 1,
        lastReadAyah: 1,
        currentDayPagesRead: 0,
        completedKhatmasCount: (wirdGoal.completedKhatmasCount || 0) + 1
      });
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <QuranDailyGoalCard
        wirdGoal={wirdGoal}
        dailyProgressPercent={dailyProgressPercent}
        onAddPage={handleAddPageRead}
        onSaveTarget={(pages) => onUpdateGoal({ ...wirdGoal, dailyPagesTarget: pages })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <KhatmahProgressCard
          currentPage={currentPage}
          progressPercent={progressPercent}
          completedKhatmasCount={wirdGoal.completedKhatmasCount || 0}
          onResetKhatmah={handleResetKhatmah}
        />

        <ReadingStopCard
          bookmark={bookmark}
          currentSurahName={currentSurahMeta.name}
          currentPage={currentPage}
          lastReadDate={wirdGoal.lastReadDate}
          onJumpToBookmark={onJumpToBookmark}
          onOpenSurah={() => onSelectSurah(bookmark?.surahNumber || wirdGoal.lastReadSurah || 1)}
        />
      </div>

      <WirdPlansCard onApplyPlan={(pages) => onUpdateGoal({ ...wirdGoal, dailyPagesTarget: pages })} />
    </div>
  );
};
import { useState, useCallback } from 'react';
import { QuranBookmark, QuranReadingWirdGoal, SurahHifzProgress } from '../types';
import {
  loadQuranBookmark,
  saveQuranBookmark,
  loadQuranWirdGoal,
  saveQuranWirdGoal,
  loadHifzProgress,
  saveHifzProgress
} from '../utils/storage';

interface UseQuranStateOptions {
  onStreakActivity: () => number;
}

/** حالة القرآن في التطبيق: علامة القراءة، هدف الورد اليومي، وسجل الحفظ. */
export function useQuranState({ onStreakActivity }: UseQuranStateOptions) {
  const [quranBookmark, setQuranBookmark] = useState<QuranBookmark | null>(() => loadQuranBookmark());
  const [quranWirdGoal, setQuranWirdGoal] = useState<QuranReadingWirdGoal>(() => loadQuranWirdGoal());
  const [hifzProgress, setHifzProgress] = useState<Record<number, SurahHifzProgress>>(() => loadHifzProgress());

  const handleUpdateQuranBookmark = useCallback((bookmark: QuranBookmark | null) => {
    setQuranBookmark(bookmark);
    saveQuranBookmark(bookmark);
  }, []);

  const handleUpdateQuranWirdGoal = useCallback((newGoal: QuranReadingWirdGoal) => {
    setQuranWirdGoal(newGoal);
    saveQuranWirdGoal(newGoal);
    // Also reward streak activity if pages read today increased
    if (newGoal.currentDayPagesRead > 0) {
      onStreakActivity();
    }
  }, [onStreakActivity]);

  const handleUpdateHifzProgress = useCallback((newHifz: Record<number, SurahHifzProgress>) => {
    setHifzProgress(newHifz);
    saveHifzProgress(newHifz);
    onStreakActivity();
  }, [onStreakActivity]);

  return {
    quranBookmark,
    quranWirdGoal,
    hifzProgress,
    handleUpdateQuranBookmark,
    handleUpdateQuranWirdGoal,
    handleUpdateHifzProgress
  };
}
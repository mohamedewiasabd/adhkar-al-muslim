import { QuranBookmark, QuranReadingWirdGoal, SurahHifzProgress } from '../../types';
import { KEYS } from './keys';
import { getTodayDateString } from './dates';

// ==================== Quran Storage Helpers ====================

export function loadQuranBookmark(): QuranBookmark | null {
  try {
    const saved = localStorage.getItem(KEYS.QURAN_BOOKMARK);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function saveQuranBookmark(bookmark: QuranBookmark | null): void {
  try {
    if (bookmark === null) {
      localStorage.removeItem(KEYS.QURAN_BOOKMARK);
    } else {
      localStorage.setItem(KEYS.QURAN_BOOKMARK, JSON.stringify(bookmark));
    }
  } catch {
    // ignore
  }
}

export function loadQuranWirdGoal(): QuranReadingWirdGoal {
  const defaultGoal: QuranReadingWirdGoal = {
    dailyPagesTarget: 4, // 4 pages daily (1 hizb every 2.5 days)
    currentDayPagesRead: 0,
    lastReadSurah: 1,
    lastReadAyah: 1,
    lastReadPage: 1,
    lastReadDate: getTodayDateString(),
    completedKhatmasCount: 0,
    historyLog: []
  };

  try {
    const saved = localStorage.getItem(KEYS.QURAN_WIRD_GOAL);
    if (!saved) return defaultGoal;
    const parsed: QuranReadingWirdGoal = JSON.parse(saved);
    const today = getTodayDateString();
    if (parsed.lastReadDate !== today) {
      return {
        ...parsed,
        currentDayPagesRead: 0,
        lastReadDate: today
      };
    }
    return parsed;
  } catch {
    return defaultGoal;
  }
}

export function saveQuranWirdGoal(goal: QuranReadingWirdGoal): void {
  try {
    localStorage.setItem(KEYS.QURAN_WIRD_GOAL, JSON.stringify(goal));
  } catch {
    // ignore
  }
}

export function loadHifzProgress(): Record<number, SurahHifzProgress> {
  try {
    const saved = localStorage.getItem(KEYS.QURAN_HIFZ_PROGRESS);
    if (!saved) return {};
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

export function saveHifzProgress(progress: Record<number, SurahHifzProgress>): void {
  try {
    localStorage.setItem(KEYS.QURAN_HIFZ_PROGRESS, JSON.stringify(progress));
  } catch {
    // ignore
  }
}
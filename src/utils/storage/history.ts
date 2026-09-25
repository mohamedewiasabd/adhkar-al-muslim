import { Achievement, DailyHistoryRecord } from '../../types';
import { initialAchievements } from '../../data/defaultWird';
import { KEYS } from './keys';

export function loadHistory(): DailyHistoryRecord[] {
  try {
    const saved = localStorage.getItem(KEYS.HISTORY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveHistory(records: DailyHistoryRecord[]): void {
  try {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function loadAchievements(): Achievement[] {
  try {
    const saved = localStorage.getItem(KEYS.ACHIEVEMENTS);
    if (!saved) return initialAchievements;
    const parsed: Achievement[] = JSON.parse(saved);
    // merge with initial in case new ones were added
    return initialAchievements.map(init => {
      const match = parsed.find(p => p.id === init.id);
      return match ? { ...init, unlockedAt: match.unlockedAt } : init;
    });
  } catch {
    return initialAchievements;
  }
}

export function saveAchievements(data: Achievement[]): void {
  try {
    localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(data));
  } catch {
    // ignore
  }
}
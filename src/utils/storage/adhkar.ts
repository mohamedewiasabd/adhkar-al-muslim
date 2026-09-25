import { DhikrItem } from '../../types';
import { initialAdhkarData } from '../../data/adhkarData';
import { KEYS } from './keys';
import { getTodayDateString } from './dates';

export function loadAdhkarData(): DhikrItem[] {
  try {
    const saved = localStorage.getItem(KEYS.ADHKAR);
    if (!saved) return initialAdhkarData;
    const parsed = JSON.parse(saved);
    // Verify if same day or reset needed
    const lastDate = localStorage.getItem(KEYS.LAST_DATE);
    const today = getTodayDateString();
    if (lastDate !== today) {
      // New day: reset current counts
      return initialAdhkarData.map(item => ({ ...item, currentCount: 0, completed: false }));
    }
    return parsed;
  } catch {
    return initialAdhkarData;
  }
}

export function saveAdhkarData(data: DhikrItem[]): void {
  try {
    localStorage.setItem(KEYS.ADHKAR, JSON.stringify(data));
  } catch {
    // ignore
  }
}
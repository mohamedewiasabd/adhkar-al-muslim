import { DailyWirdItem } from '../../types';
import { initialWirdItems } from '../../data/defaultWird';
import { KEYS } from './keys';
import { getTodayDateString } from './dates';

export function loadWirdData(): DailyWirdItem[] {
  try {
    const saved = localStorage.getItem(KEYS.WIRD);
    const lastDate = localStorage.getItem(KEYS.LAST_DATE);
    const today = getTodayDateString();
    if (!saved || lastDate !== today) {
      return initialWirdItems.map(item => ({ ...item, current: 0, completed: false }));
    }
    return JSON.parse(saved);
  } catch {
    return initialWirdItems;
  }
}

export function saveWirdData(data: DailyWirdItem[]): void {
  try {
    localStorage.setItem(KEYS.WIRD, JSON.stringify(data));
  } catch {
    // ignore
  }
}
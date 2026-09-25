import { KEYS } from './keys';
import { getTodayDateString } from './dates';

export function loadTotalTasbeeh(): number {
  try {
    const val = localStorage.getItem(KEYS.TOTAL_TASBEEH);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function saveTotalTasbeeh(count: number): void {
  try {
    localStorage.setItem(KEYS.TOTAL_TASBEEH, count.toString());
  } catch {
    // ignore
  }
}

export function loadTodayTasbeeh(): number {
  try {
    const lastDate = localStorage.getItem(KEYS.LAST_DATE);
    const today = getTodayDateString();
    if (lastDate !== today) return 0;
    const val = localStorage.getItem(KEYS.TODAY_TASBEEH);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function saveTodayTasbeeh(count: number): void {
  try {
    localStorage.setItem(KEYS.TODAY_TASBEEH, count.toString());
  } catch {
    // ignore
  }
}

export function loadStreak(): number {
  try {
    const lastDate = localStorage.getItem(KEYS.LAST_DATE);
    const today = getTodayDateString();
    const val = localStorage.getItem(KEYS.STREAK);
    let streak = val ? parseInt(val, 10) || 1 : 1;

    if (!lastDate) {
      localStorage.setItem(KEYS.LAST_DATE, today);
      localStorage.setItem(KEYS.STREAK, '1');
      return 1;
    }

    if (lastDate === today) {
      return streak;
    }

    // Check difference in days
    const lastTime = new Date(lastDate).getTime();
    const currTime = new Date(today).getTime();
    const diffDays = Math.round((currTime - lastTime) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Continued streak!
      return streak;
    } else if (diffDays > 1) {
      // Missed a day: reset streak
      streak = 1;
      localStorage.setItem(KEYS.STREAK, '1');
      localStorage.setItem(KEYS.LAST_DATE, today);
      return streak;
    }
    return streak;
  } catch {
    return 1;
  }
}

export function updateStreakOnActivity(): number {
  try {
    const lastDate = localStorage.getItem(KEYS.LAST_DATE);
    const today = getTodayDateString();
    const val = localStorage.getItem(KEYS.STREAK);
    let streak = val ? parseInt(val, 10) || 1 : 1;

    if (lastDate !== today) {
      if (lastDate) {
        const lastTime = new Date(lastDate).getTime();
        const currTime = new Date(today).getTime();
        const diffDays = Math.round((currTime - lastTime) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streak += 1;
        } else {
          streak = 1;
        }
      }
      localStorage.setItem(KEYS.LAST_DATE, today);
      localStorage.setItem(KEYS.STREAK, streak.toString());
    }
    return streak;
  } catch {
    return 1;
  }
}
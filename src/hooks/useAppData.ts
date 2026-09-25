import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  DailyHistoryRecord,
  DailyWirdItem,
  DhikrCategory,
  DhikrItem,
  ReminderSettings
} from '../types';
import {
  getTodayDateString,
  loadAchievements,
  loadAdhkarData,
  loadFavoriteDuas,
  loadHistory,
  loadReminderSettings,
  loadStreak,
  loadTodayTasbeeh,
  loadTotalTasbeeh,
  loadWirdData,
  saveAchievements,
  saveAdhkarData,
  saveFavoriteDuas,
  saveHistory,
  saveReminderSettings,
  saveTodayTasbeeh,
  saveTotalTasbeeh,
  saveWirdData,
  updateStreakOnActivity
} from '../utils/storage';

/** حالة البيانات المركزية للتطبيق: الأذكار، الورد اليومي، التسبيح، الإنجازات، المحفوظات. */
export function useAppData() {
  const [adhkar, setAdhkar] = useState<DhikrItem[]>(() => loadAdhkarData());
  const [wirdList, setWirdList] = useState<DailyWirdItem[]>(() => loadWirdData());
  const [totalTasbeeh, setTotalTasbeeh] = useState<number>(() => loadTotalTasbeeh());
  const [todayTasbeeh, setTodayTasbeeh] = useState<number>(() => loadTodayTasbeeh());
  const [streak, setStreak] = useState<number>(() => loadStreak());
  const [achievements, setAchievements] = useState(() => loadAchievements());
  const [history, setHistory] = useState<DailyHistoryRecord[]>(() => loadHistory());
  const [favoriteDuas, setFavoriteDuas] = useState<string[]>(() => loadFavoriteDuas());
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => loadReminderSettings());

  const refreshStreak = useCallback(() => {
    const newStreak = updateStreakOnActivity();
    setStreak(newStreak);
    return newStreak;
  }, []);

  // Calculate morning & evening completion
  const morningDone = useMemo(() => {
    const morningList = adhkar.filter(a => a.category === 'morning');
    return morningList.length > 0 && morningList.every(a => a.currentCount >= a.count);
  }, [adhkar]);

  const eveningDone = useMemo(() => {
    const eveningList = adhkar.filter(a => a.category === 'evening');
    return eveningList.length > 0 && eveningList.every(a => a.currentCount >= a.count);
  }, [adhkar]);

  // Calculate wird completion rate
  const wirdCompletionRate = useMemo(() => {
    if (wirdList.length === 0) return 0;
    const completed = wirdList.filter(w => w.completed || w.current >= w.target).length;
    return Math.round((completed / wirdList.length) * 100);
  }, [wirdList]);

  // Sync morning/evening status into wirdList automatically
  useEffect(() => {
    let changed = false;
    const updated = wirdList.map(item => {
      if (item.id === 'w-morning' && item.completed !== morningDone) {
        changed = true;
        return { ...item, completed: morningDone, current: morningDone ? item.target : 0 };
      }
      if (item.id === 'w-evening' && item.completed !== eveningDone) {
        changed = true;
        return { ...item, completed: eveningDone, current: eveningDone ? item.target : 0 };
      }
      return item;
    });

    if (changed) {
      setWirdList(updated);
      saveWirdData(updated);
    }
  }, [morningDone, eveningDone, wirdList]);

  // Check and unlock achievements
  const checkAchievements = useCallback((newTotalTasbeeh: number, newStreak: number, newWirdRate: number) => {
    const todayStr = getTodayDateString();
    let hasUnlocked = false;

    const updatedAchievements = achievements.map(ach => {
      if (ach.unlockedAt) return ach;

      let qualify = false;
      if (ach.conditionType === 'total_tasbeeh' && newTotalTasbeeh >= ach.targetValue) {
        qualify = true;
      } else if (ach.conditionType === 'streak' && newStreak >= ach.targetValue) {
        qualify = true;
      } else if (ach.conditionType === 'wird_full' && newWirdRate >= 100) {
        qualify = true;
      }

      if (qualify) {
        hasUnlocked = true;
        return { ...ach, unlockedAt: todayStr };
      }
      return ach;
    });

    if (hasUnlocked) {
      setAchievements(updatedAchievements);
      saveAchievements(updatedAchievements);
    }
  }, [achievements]);

  // Record daily history
  const updateDailyHistory = useCallback((tasbeeh: number, wRate: number) => {
    const today = getTodayDateString();
    setHistory(prev => {
      const existingIdx = prev.findIndex(r => r.date === today);
      let updated: DailyHistoryRecord[];
      const record: DailyHistoryRecord = {
        date: today,
        tasbeehCount: tasbeeh,
        morningCompleted: morningDone,
        eveningCompleted: eveningDone,
        wirdCompletionRate: wRate
      };

      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = record;
      } else {
        updated = [...prev, record];
      }
      saveHistory(updated);
      return updated;
    });
  }, [morningDone, eveningDone]);

  // Increment Tasbeeh
  const handleIncrementTasbeeh = useCallback((amount = 1) => {
    const newTotal = totalTasbeeh + amount;
    const newToday = todayTasbeeh + amount;
    setTotalTasbeeh(newTotal);
    setTodayTasbeeh(newToday);
    saveTotalTasbeeh(newTotal);
    saveTodayTasbeeh(newToday);

    const newStreak = updateStreakOnActivity();
    setStreak(newStreak);

    checkAchievements(newTotal, newStreak, wirdCompletionRate);
    updateDailyHistory(newToday, wirdCompletionRate);
  }, [totalTasbeeh, todayTasbeeh, checkAchievements, wirdCompletionRate, updateDailyHistory]);

  // Update specific Dhikr count in Adhkar section
  const handleUpdateAdhkarCount = useCallback((id: string, newCount: number) => {
    const targetItem = adhkar.find(a => a.id === id);
    const prevCount = targetItem?.currentCount || 0;
    const delta = Math.max(0, newCount - prevCount);

    const updatedAdhkar = adhkar.map(item => {
      if (item.id === id) {
        const completed = newCount >= item.count;
        return { ...item, currentCount: newCount, completed };
      }
      return item;
    });

    setAdhkar(updatedAdhkar);
    saveAdhkarData(updatedAdhkar);

    if (delta > 0) {
      handleIncrementTasbeeh(delta);
    }
  }, [adhkar, handleIncrementTasbeeh]);

  // Reset category counts
  const handleResetCategory = useCallback((category: DhikrCategory) => {
    const updated = adhkar.map(item => {
      if (item.category === category) {
        return { ...item, currentCount: 0, completed: false };
      }
      return item;
    });
    setAdhkar(updated);
    saveAdhkarData(updated);
  }, [adhkar]);

  // Wird Item handlers
  const handleToggleWirdItem = useCallback((id: string) => {
    const updated = wirdList.map(item => {
      if (item.id === id) {
        const nextDone = !item.completed;
        return { ...item, completed: nextDone, current: nextDone ? item.target : 0 };
      }
      return item;
    });
    setWirdList(updated);
    saveWirdData(updated);

    const completedCount = updated.filter(w => w.completed || w.current >= w.target).length;
    const newRate = Math.round((completedCount / updated.length) * 100);
    checkAchievements(totalTasbeeh, streak, newRate);
    updateDailyHistory(todayTasbeeh, newRate);
  }, [wirdList, checkAchievements, totalTasbeeh, streak, updateDailyHistory, todayTasbeeh]);

  const handleUpdateWirdProgress = useCallback((id: string, delta: number) => {
    const updated = wirdList.map(item => {
      if (item.id === id) {
        const nextVal = Math.max(0, Math.min(item.target, item.current + delta));
        return { ...item, current: nextVal, completed: nextVal >= item.target };
      }
      return item;
    });
    setWirdList(updated);
    saveWirdData(updated);

    const completedCount = updated.filter(w => w.completed || w.current >= w.target).length;
    const newRate = Math.round((completedCount / updated.length) * 100);
    checkAchievements(totalTasbeeh, streak, newRate);
    updateDailyHistory(todayTasbeeh, newRate);
  }, [wirdList, checkAchievements, totalTasbeeh, streak, updateDailyHistory, todayTasbeeh]);

  const handleAddCustomWird = useCallback((item: DailyWirdItem) => {
    const updated = [...wirdList, item];
    setWirdList(updated);
    saveWirdData(updated);
  }, [wirdList]);

  const handleDeleteWird = useCallback((id: string) => {
    const updated = wirdList.filter(w => w.id !== id);
    setWirdList(updated);
    saveWirdData(updated);
  }, [wirdList]);

  // Duas Favorites toggle
  const handleToggleFavoriteDua = useCallback((id: string) => {
    setFavoriteDuas(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      saveFavoriteDuas(updated);
      return updated;
    });
  }, []);

  // Save reminder settings
  const updateReminderSettings = useCallback((settings: ReminderSettings) => {
    setReminderSettings(settings);
    saveReminderSettings(settings);
  }, []);

  return {
    adhkar,
    wirdList,
    totalTasbeeh,
    todayTasbeeh,
    streak,
    achievements,
    history,
    favoriteDuas,
    reminderSettings,
    morningDone,
    eveningDone,
    wirdCompletionRate,
    refreshStreak,
    handleIncrementTasbeeh,
    handleUpdateAdhkarCount,
    handleResetCategory,
    handleToggleWirdItem,
    handleUpdateWirdProgress,
    handleAddCustomWird,
    handleDeleteWird,
    handleToggleFavoriteDua,
    updateReminderSettings
  };
}
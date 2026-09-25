import { useMemo } from 'react';
import { SurahHifzProgress } from '../types';
import { surahsList } from '../data/quranMeta';

export interface HifzStats {
  memorizedCount: number;
  masteredCount: number;
  memorizingCount: number;
  completedSurahsTotal: number;
  totalAyahsMemorized: number;
  progressPercent: number;
}

export const useHifzStats = (hifzData: Record<number, SurahHifzProgress>): HifzStats =>
  useMemo(() => {
    let memorizedCount = 0;
    let memorizingCount = 0;
    let masteredCount = 0;
    let totalAyahsMemorized = 0;

    surahsList.forEach((s) => {
      const record = hifzData[s.number];
      if (record) {
        if (record.status === 'memorized') {
          memorizedCount++;
          totalAyahsMemorized += (record.memorizedAyahsCount || s.numberOfAyahs);
        } else if (record.status === 'mastered') {
          masteredCount++;
          totalAyahsMemorized += s.numberOfAyahs;
        } else if (record.status === 'memorizing') {
          memorizingCount++;
          totalAyahsMemorized += (record.memorizedAyahsCount || 0);
        }
      }
    });

    const totalQuranAyahs = 6236;
    const progressPercent = Math.min(100, Math.round((totalAyahsMemorized / totalQuranAyahs) * 100));

    return {
      memorizedCount,
      masteredCount,
      memorizingCount,
      completedSurahsTotal: memorizedCount + masteredCount,
      totalAyahsMemorized,
      progressPercent
    };
  }, [hifzData]);